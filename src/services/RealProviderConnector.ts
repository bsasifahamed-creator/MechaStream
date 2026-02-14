import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costPerToken: {
    input: number;
    output: number;
  };
}

export interface ProviderResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  metadata?: {
    model: string;
    provider: string;
    responseTime: number;
  };
}

export class RealProviderConnector {
  private static instance: RealProviderConnector;
  private providers: Map<string, ProviderConfig> = new Map();
  private rateLimiters: Map<string, { requests: number[]; tokens: number[] }> = new Map();
  private usageTracker: Map<string, { totalCost: number; totalTokens: number }> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): RealProviderConnector {
    if (!RealProviderConnector.instance) {
      RealProviderConnector.instance = new RealProviderConnector();
    }
    return RealProviderConnector.instance;
  }

  private initializeProviders(): void {
    // OpenAI/OpenRouter
    if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      this.providers.set('openrouter', {
        name: 'OpenRouter',
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        model: 'openai/gpt-4',
        maxTokens: 4000,
        temperature: 0.7,
        rateLimit: { requestsPerMinute: 60, tokensPerMinute: 100000 },
        costPerToken: { input: 0.00003, output: 0.00006 }
      });
    }

    // OpenAI Direct
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      this.providers.set('openai', {
        name: 'OpenAI',
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 4000,
        temperature: 0.7,
        rateLimit: { requestsPerMinute: 60, tokensPerMinute: 100000 },
        costPerToken: { input: 0.00003, output: 0.00006 }
      });
    }

    // Google Gemini
    if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      this.providers.set('google', {
        name: 'Google Gemini',
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        model: 'gemini-1.5-flash',
        maxTokens: 4000,
        temperature: 0.7,
        rateLimit: { requestsPerMinute: 60, tokensPerMinute: 100000 },
        costPerToken: { input: 0.000007, output: 0.000021 }
      });
    }

    // Anthropic Claude
    if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        name: 'Anthropic Claude',
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229',
        maxTokens: 4000,
        temperature: 0.7,
        rateLimit: { requestsPerMinute: 60, tokensPerMinute: 100000 },
        costPerToken: { input: 0.000003, output: 0.000015 }
      });
    }
  }

  private checkRateLimit(provider: string): boolean {
    const config = this.providers.get(provider);
    if (!config) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.rateLimiters.has(provider)) {
      this.rateLimiters.set(provider, { requests: [], tokens: [] });
    }

    const limiter = this.rateLimiters.get(provider)!;
    
    // Clean old entries
    limiter.requests = limiter.requests.filter(time => time > oneMinuteAgo);
    limiter.tokens = limiter.tokens.filter(time => time > oneMinuteAgo);

    // Check rate limits
    if (limiter.requests.length >= config.rateLimit.requestsPerMinute) {
      return false;
    }

    return true;
  }

  private trackUsage(provider: string, inputTokens: number, outputTokens: number): void {
    const config = this.providers.get(provider);
    if (!config) return;

    const cost = (inputTokens * config.costPerToken.input) + (outputTokens * config.costPerToken.output);
    
    if (!this.usageTracker.has(provider)) {
      this.usageTracker.set(provider, { totalCost: 0, totalTokens: 0 });
    }

    const tracker = this.usageTracker.get(provider)!;
    tracker.totalCost += cost;
    tracker.totalTokens += inputTokens + outputTokens;

    // Update rate limiter
    const now = Date.now();
    const limiter = this.rateLimiters.get(provider)!;
    limiter.requests.push(now);
    limiter.tokens.push(now);
  }

  public async generateWithOpenAI(provider: string, prompt: string): Promise<ProviderResponse> {
    const config = this.providers.get(provider);
    if (!config) {
      return { success: false, error: `Provider ${provider} not configured` };
    }

    if (!this.checkRateLimit(provider)) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    const startTime = Date.now();

    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that generates React code. Always use React.createElement() instead of JSX syntax. Generate clean, functional React components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      });

      const content = completion.choices[0]?.message?.content || '';
      const usage = completion.usage;
      const responseTime = Date.now() - startTime;

      // Track usage
      this.trackUsage(provider, usage?.prompt_tokens || 0, usage?.completion_tokens || 0);

      return {
        success: true,
        content,
        usage: {
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0,
          cost: (usage?.prompt_tokens || 0) * config.costPerToken.input + (usage?.completion_tokens || 0) * config.costPerToken.output
        },
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: this.handleProviderError(error, provider),
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };
    }
  }

  public async generateWithGoogle(prompt: string): Promise<ProviderResponse> {
    const config = this.providers.get('google');
    if (!config) {
      return { success: false, error: 'Google provider not configured' };
    }

    if (!this.checkRateLimit('google')) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    const startTime = Date.now();

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });

      const promptText = `You are a helpful AI assistant that generates React code. Always use React.createElement() instead of JSX syntax. Generate clean, functional React components. Here's the user request: ${prompt}`;
      const result = await model.generateContent(promptText);

      const content = result.response.text();
      const responseTime = Date.now() - startTime;

      // Estimate token usage (Google doesn't provide exact token counts)
      const estimatedTokens = Math.ceil(content.length / 4);
      this.trackUsage('google', estimatedTokens, estimatedTokens);

      return {
        success: true,
        content,
        usage: {
          inputTokens: estimatedTokens,
          outputTokens: estimatedTokens,
          cost: estimatedTokens * config.costPerToken.output
        },
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: this.handleProviderError(error, 'google'),
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };
    }
  }

  public async generateWithAnthropic(prompt: string): Promise<ProviderResponse> {
    const config = this.providers.get('anthropic');
    if (!config) {
      return { success: false, error: 'Anthropic provider not configured' };
    }

    if (!this.checkRateLimit('anthropic')) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    const startTime = Date.now();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: config.maxTokens,
          messages: [
            {
              role: 'user',
              content: `You are a helpful AI assistant that generates React code. Always use React.createElement() instead of JSX syntax. Generate clean, functional React components. Here's the user request: ${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';
      const responseTime = Date.now() - startTime;

      // Track usage
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      this.trackUsage('anthropic', inputTokens, outputTokens);

      return {
        success: true,
        content,
        usage: {
          inputTokens,
          outputTokens,
          cost: inputTokens * config.costPerToken.input + outputTokens * config.costPerToken.output
        },
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: this.handleProviderError(error, 'anthropic'),
        metadata: {
          model: config.model,
          provider: config.name,
          responseTime
        }
      };
    }
  }

  private handleProviderError(error: any, provider: string): string {
    if (error.status === 401) {
      return `${provider} API key is invalid. Please check your API key configuration.`;
    } else if (error.status === 429) {
      return `${provider} rate limit exceeded. Please try again later.`;
    } else if (error.status === 500) {
      return `${provider} server error. Please try again.`;
    } else if (error.code === 'ECONNREFUSED') {
      return `${provider} connection failed. Please check your internet connection.`;
    } else {
      return `${provider} error: ${error.message || 'Unknown error occurred'}`;
    }
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  public getProviderConfig(provider: string): ProviderConfig | undefined {
    return this.providers.get(provider);
  }

  public getUsageStats(provider: string): { totalCost: number; totalTokens: number } | undefined {
    return this.usageTracker.get(provider);
  }

  public getAllUsageStats(): Map<string, { totalCost: number; totalTokens: number }> {
    return new Map(this.usageTracker);
  }

  public resetUsageStats(): void {
    this.usageTracker.clear();
  }
} 