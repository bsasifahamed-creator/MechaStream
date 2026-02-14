import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_CODE_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen3:4b';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ConversationRequest {
  message: string;
  conversationId: string;
  isCodeIDE?: boolean;
  projectName?: string;
}

interface ConversationResponse {
  message: string;
  suggestions?: string[];
  shouldGenerateProject?: boolean;
  projectPrompt?: string | null;
}

// Store conversations in memory (in production, use Redis or database)
const conversations = new Map<string, ConversationMessage[]>();

/** Call Ollama directly so the chatbot works without self-fetch to /api/ai. */
async function callOllamaForConversation(fullPrompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 1500 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return '';
    const data = await res.json().catch(() => ({}));
    return (data.response || '').trim();
  } catch (e) {
    clearTimeout(timeoutId);
    console.error('Ollama conversation error:', e);
    return '';
  }
}

function parseConversationJson(raw: string): ConversationResponse | null {
  if (!raw || !raw.trim()) return null;
  try {
    const jsonStr = raw.includes('{') ? raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1) : raw;
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && typeof parsed.message === 'string') {
      return {
        message: parsed.message,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        shouldGenerateProject: Boolean(parsed.shouldGenerateProject),
        projectPrompt: typeof parsed.projectPrompt === 'string' ? parsed.projectPrompt : null,
      };
    }
  } catch {
    // use raw as message if it looks like plain text
    if (raw.length > 0 && raw.length < 2000) {
      return {
        message: raw,
        suggestions: [],
        shouldGenerateProject: false,
        projectPrompt: null,
      };
    }
  }
  return null;
}

async function callAIForConversation(messages: ConversationMessage[], isCodeIDE: boolean = false): Promise<ConversationResponse> {
  const systemPrompt = isCodeIDE
    ? `You are an expert software developer assistant in a code IDE. Be conversational and helpful. Ask clarifying questions when needed. When the user clearly wants to generate/build something, set shouldGenerateProject=true and set projectPrompt to a detailed one-paragraph description for code generation. Reply ONLY with valid JSON in this exact format: {"message": "your reply", "suggestions": ["option1", "option2"], "shouldGenerateProject": false, "projectPrompt": null}`
    : `You are a helpful AI for a code generation platform. Guide users through project ideas. When ready to generate, set shouldGenerateProject=true and projectPrompt to a detailed description. Reply ONLY with valid JSON: {"message": "your reply", "suggestions": ["option1", "option2"], "shouldGenerateProject": false, "projectPrompt": null}`;

  const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nRespond with only the JSON object, no other text:`;

  const raw = await callOllamaForConversation(fullPrompt);
  const parsed = parseConversationJson(raw);
  if (parsed && parsed.message) return parsed;

  return {
    message: "I couldn't generate a response. Start Ollama (run `ollama serve` in a terminal) and pull a model (e.g. `ollama pull qwen3:4b`), then try again.",
    suggestions: ['Start Ollama and try again', 'Try a shorter message', 'Check the terminal for errors'],
    shouldGenerateProject: false,
    projectPrompt: null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, isCodeIDE = false, projectName }: ConversationRequest = await request.json();

    // Get or create conversation
    let conversation = conversations.get(conversationId) || [];

    // Add user message
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    conversation.push(userMessage);

    // Keep only last 10 messages to avoid context getting too long
    if (conversation.length > 10) {
      conversation = conversation.slice(-10);
    }

    // Get AI response
    let aiResponse = await callAIForConversation(conversation, isCodeIDE);

    // In Code IDE: if user message asks to build/create something or specifically backend/API, trigger code generation
    const lastUserContent = (message || '').trim();
    const buildVerb = /\b(build|create|make|generate|add|implement|give me)\s+(?:me\s+)?(?:a\s+)?/i.test(lastUserContent);
    const wantsBackend = /\b(backend|api|server|flask|express|rest)\b/i.test(lastUserContent);
    const looksLikeBuildRequest =
      isCodeIDE &&
      projectName &&
      lastUserContent.length > 5 &&
      lastUserContent.length < 500 &&
      (buildVerb || wantsBackend);

    if (looksLikeBuildRequest && !aiResponse.shouldGenerateProject) {
      let projectPrompt = aiResponse.projectPrompt || lastUserContent;
      if (wantsBackend && projectPrompt) {
        projectPrompt = projectPrompt + '. Include full backend code: e.g. backend/app.py, backend/requirements.txt, backend/templates and backend/static.';
      }
      aiResponse = {
        ...aiResponse,
        shouldGenerateProject: true,
        projectPrompt,
      };
    }

    // Add AI response to conversation
    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date()
    };

    conversation.push(assistantMessage);
    conversations.set(conversationId, conversation);

    return NextResponse.json({
      ...aiResponse,
      conversationId
    });

  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json({
      message: 'Sorry, I encountered an error. Please try again.',
      suggestions: ['Try again', 'Refresh the page'],
      shouldGenerateProject: false
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
  }

  const conversation = conversations.get(conversationId) || [];
  return NextResponse.json({ messages: conversation });
}
