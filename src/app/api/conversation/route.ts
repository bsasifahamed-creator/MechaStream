import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_CODE_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen2.5-coder:7b';
const OLLAMA_TIMEOUT_MS = 180000; // 3 min — Ollama needs time, especially on first inference

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

const CONVERSATION_SYSTEM = `You are MechaStream AI assistant. Help users build web applications.
When the user asks to create/build something, respond with a brief acknowledgment and set shouldGenerateProject to true.
You MUST respond in this EXACT JSON format, nothing else:
{"message": "your response here", "suggestions": ["suggestion1", "suggestion2"], "shouldGenerateProject": false, "projectPrompt": null}
If the user wants to build something, set shouldGenerateProject to true and projectPrompt to their request.`;

/** Call Ollama /api/chat for conversation (message format; better than /api/generate for chat). */
async function callOllamaForConversation(messages: ConversationMessage[], lastUserPrompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const ollamaMessages = [
      { role: 'system' as const, content: CONVERSATION_SYSTEM },
      ...messages.slice(-6).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false,
        options: { temperature: 0.7, num_predict: 4096 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return '';
    const data = await res.json().catch(() => ({}));
    let raw = (data?.message?.content ?? data?.response ?? '').trim();
    raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '').trim();
    return raw;
  } catch (e) {
    clearTimeout(timeoutId);
    const isAbort = e instanceof Error && e.name === 'AbortError';
    if (isAbort) {
      console.warn('Ollama conversation: request aborted (timeout or client disconnect)');
    } else {
      console.error('Ollama conversation error:', e);
    }
    return '';
  }
}

function parseConversationResponse(raw: string, userPrompt: string): ConversationResponse {
  if (!raw || !raw.trim()) {
    return {
      message: "I couldn't generate a response. Start Ollama (ollama serve) and try again.",
      suggestions: ['Start Ollama and try again', 'Try a shorter message'],
      shouldGenerateProject: false,
      projectPrompt: null,
    };
  }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*"message"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed.message === 'string') {
        return {
          message: parsed.message,
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          shouldGenerateProject: Boolean(parsed.shouldGenerateProject),
          projectPrompt: typeof parsed.projectPrompt === 'string' ? parsed.projectPrompt : null,
        };
      }
    }
  } catch {
    /* not JSON */
  }
  const buildKeywords = /\b(create|build|make|generate|design|code|develop)\b/i;
  const wantsBuild = buildKeywords.test(userPrompt);
  return {
    message: raw.length > 6000 ? raw.slice(0, 6000) + '…' : raw.trim(),
    suggestions: wantsBuild ? ['Generate the code', 'Add more details', 'Pick a different framework'] : ['Tell me more', 'Show me an example'],
    shouldGenerateProject: wantsBuild,
    projectPrompt: wantsBuild ? userPrompt : null,
  };
}

async function callAIForConversation(messages: ConversationMessage[], _isCodeIDE: boolean, lastUserPrompt: string): Promise<ConversationResponse> {
  const raw = await callOllamaForConversation(messages, lastUserPrompt);
  return parseConversationResponse(raw, lastUserPrompt);
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
    let aiResponse = await callAIForConversation(conversation, isCodeIDE, message);

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
