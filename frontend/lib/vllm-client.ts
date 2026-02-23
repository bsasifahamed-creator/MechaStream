/**
 * Cliente TypeScript para la API vLLM
 * Compatible con Next.js
 */

export interface GenerateRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GenerateResponse {
  id: string;
  text: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatResponse {
  id: string;
  message: ChatMessage;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}

export class VLLMClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remover slash final
  }

  /**
   * Verificar el estado de la API
   */
  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Generar texto a partir de un prompt
   */
  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        ...request,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Generate request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Completar conversación de chat
   */
  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        ...request,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat completion failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generar texto con streaming
   */
  async generateTextStream(
    request: GenerateRequest,
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.text) {
                onChunk(parsed.choices[0].text);
              }
            } catch (e) {
              // Ignorar errores de parsing de chunks individuales
            }
          }
        }
      }

      onComplete?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Listar modelos disponibles
   */
  async listModels(): Promise<{ object: string; data: any[] }> {
    const response = await fetch(`${this.baseUrl}/v1/models`);
    
    if (!response.ok) {
      throw new Error(`List models failed: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Verificar si la API está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.health();
      return true;
    } catch {
      return false;
    }
  }
}

// Instancia por defecto
export const vllmClient = new VLLMClient();

// Hook para React (opcional)
export function useVLLM() {
  return {
    client: vllmClient,
    generateText: vllmClient.generateText.bind(vllmClient),
    chatCompletion: vllmClient.chatCompletion.bind(vllmClient),
    generateTextStream: vllmClient.generateTextStream.bind(vllmClient),
    health: vllmClient.health.bind(vllmClient),
    isAvailable: vllmClient.isAvailable.bind(vllmClient),
  };
}