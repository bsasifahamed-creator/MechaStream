import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findMatchingTemplate } from '../../../lib/local-templates';

const DEBUG_LOG_PATH = path.join(process.cwd(), '.cursor', 'debug.log');
const DEBUG_LOG_FALLBACK = path.join(process.cwd(), 'debug-ai-error.log');

// API Keys with better validation
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_CODE_MODEL = process.env.OLLAMA_CODE_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

// Validate API keys
const hasValidGroq = GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';
const hasValidOpenAI = OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';
const hasValidOpenRouter = OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
const hasValidGoogle = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_api_key_here';

interface LLMResponse {
  code?: string;
  explanation?: string;
  suggestions?: string[];
  error?: string;
  source?: string;
  model?: string;
}

/** Strip <think>/reasoning blocks so they don't break preview/code. Handles Qwen and similar models. */
function stripThinkBlocks(content: string): string {
  if (!content || typeof content !== 'string') return content;
  let out = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/```reasoning[\s\S]*?```/gi, '')
    .trim();
  return out;
}

function cleanCodeResponse(content: string): string {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
      console.log('✅ Valid JSON response with', parsed.files.length, 'files');
      return JSON.stringify(parsed);
    }
  } catch (error) {
    console.log('❌ JSON parse failed, trying to extract from markdown or text');
  }

  // Fallback: Remove markdown code blocks and extract JSON
  const codeBlockRegex = /```(?:json|javascript)?\s*([\s\S]*?)```/g;
  const matches = content.match(codeBlockRegex);

  if (matches && matches.length > 0) {
    const codeContent = matches[0].replace(/```(?:json|javascript)?\s*/, '').replace(/```$/, '').trim();
    try {
      const parsed = JSON.parse(codeContent);
      if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
        console.log('✅ Extracted valid JSON from markdown');
        return JSON.stringify(parsed);
      }
    } catch (error) {
      console.log('❌ Extracted content is not valid JSON');
    }
  }

  // If no valid JSON found, return the entire content as fallback
  console.log('⚠️ Returning raw content as fallback');
  return content.trim();
}

async function callOpenAI(prompt: string): Promise<LLMResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate complete, working code for the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create proper folder structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const cleanedCode = cleanCodeResponse(content);
    
    return {
      code: cleanedCode,
      explanation: 'Generated using OpenAI GPT-4',
      source: 'openai',
      model: 'gpt-4'
    };
  } catch (error) {
    return { error: `OpenAI API error: ${error}` };
  }
}

async function callGroq(prompt: string): Promise<LLMResponse> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate complete, working code for the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create proper folder structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const cleanedCode = cleanCodeResponse(content);
    
    return {
      code: cleanedCode,
      explanation: 'Generated using Groq Mixtral',
      source: 'groq',
      model: 'mixtral-8x7b-32768'
    };
  } catch (error) {
    return { error: `Groq API error: ${error}` };
  }
}

async function callOpenRouter(prompt: string): Promise<LLMResponse> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate complete, working code for the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create proper folder structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const cleanedCode = cleanCodeResponse(content);
    
    return {
      code: cleanedCode,
      explanation: 'Generated using OpenRouter Claude',
      source: 'openrouter',
      model: 'claude-3.5-sonnet'
    };
  } catch (error) {
    return { error: `OpenRouter API error: ${error}` };
  }
}

async function callGoogle(prompt: string): Promise<LLMResponse> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert web developer. Generate complete, working code for the user's request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create proper folder structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.\n\nUser request: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';
    const cleanedCode = cleanCodeResponse(content);
    
    return {
      code: cleanedCode,
      explanation: 'Generated using Google Gemini',
      source: 'google',
      model: 'gemini-pro'
    };
  } catch (error) {
    return { error: `Google API error: ${error}` };
  }
}

const REACT_GENERATE_SYSTEM = `You are an expert React/Next.js developer. Generate a COMPLETE, working React component based on the user's description.

CRITICAL RULES:
- Return ONLY the code. No markdown fences, no \`\`\`jsx, no explanations before or after.
- Start your response with the first line of code (e.g. "use client" or import React).
- Use functional components with React hooks.
- Include ALL necessary imports at the top (import React, useState, useEffect, etc.).
- Use Tailwind CSS classes for ALL styling.
- Export the component as default: export default function ComponentName() { ... }
- Make it visually polished — use proper spacing, colors, rounded corners, shadows.
- Make it fully interactive and functional.
- Handle edge cases and loading states.`;

/** Call Ollama /api/chat for React component generation. Uses message format; strips <think> and extracts code. */
async function callOllamaReactGenerate(prompt: string, existingCode: string, context: string): Promise<LLMResponse> {
  try {
    const userMessage = existingCode
      ? `Current code:\n${existingCode}\n\nUser request: ${prompt}${context ? `\nContext: ${context}` : ''}`
      : prompt + (context ? `\nContext: ${context}` : '');

    console.log(`[/api/ai] operation=generate, model=${OLLAMA_CODE_MODEL}, prompt length=${userMessage.length}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_CODE_MODEL,
        messages: [
          { role: 'system', content: REACT_GENERATE_SYSTEM },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: { temperature: 0.7, num_predict: 8192 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[/api/ai] Ollama error', response.status, errorText);
      return { error: `Ollama returned ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    let content = (data?.message?.content ?? data?.response ?? '').trim();
    if (!content) {
      console.error('[/api/ai] Ollama empty response. Keys:', data ? Object.keys(data) : 'no data');
      return { error: 'Ollama returned empty response' };
    }

    console.log(`[/api/ai] Raw response length: ${content.length}`);

    content = stripThinkBlocks(content);
    content = content
      .replace(/^```(?:jsx|tsx|javascript|typescript|react|html|css)?\s*\n?/gm, '')
      .replace(/\n?```\s*$/gm, '')
      .trim();

    // If response has explanation text before code, extract from first code-like line
    const codeStartPatterns = [
      /^(import\s)/m, /^('use client')/m, /^("use client")/m,
      /^(export\s)/m, /^(const\s)/m, /^(function\s)/m,
      /^(export default)/m, /^(return\s*\()/m, /^(React\.)/m,
      /^(\s*<[A-Z][a-zA-Z]*)/m,
    ];
    for (const pattern of codeStartPatterns) {
      const match = content.match(pattern);
      if (match && match.index !== undefined && match.index > 0) {
        content = content.slice(match.index);
        break;
      }
    }

    // Drop trailing explanation after the component (e.g. "Here's how it works...")
    const lastBracket = content.lastIndexOf('};');
    if (lastBracket > 100) {
      const after = content.slice(lastBracket + 2).trim();
      if (after.length > 0 && !after.startsWith('//') && !/^[\s\S]*\b(import|export|function|const)\b/.test(after)) {
        content = content.slice(0, lastBracket + 2);
      }
    }

    console.log(`[/api/ai] Cleaned code length: ${content.length}`);

    return {
      code: content,
      explanation: `Generated using Ollama (${OLLAMA_CODE_MODEL})`,
      source: 'ollama',
      model: OLLAMA_CODE_MODEL,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: `Ollama error: ${msg}` };
  }
}

async function callOllama(prompt: string): Promise<LLMResponse> {
  try {
    console.log(`🦙 Trying Ollama (${OLLAMA_CODE_MODEL}) for code generation...`);
    
    // First check if Ollama is running
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const statusResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!statusResponse.ok) {
        throw new Error('Ollama not running');
      }
    } catch (error) {
      return { error: 'Ollama not running locally. Please start Ollama first.' };
    }
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_CODE_MODEL,
          prompt: `You are an expert web developer. Generate complete, working code for the user's request.

IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create proper folder structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.

User request: ${prompt}`,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 4000,
          },
        }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Ollama API error response:', errorText);
      return { error: `Ollama API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    
    // Ollama returns the response directly in the 'response' field
    let content = data.response || '';
    content = stripThinkBlocks(content);
    
    if (!content) {
      return { error: 'Ollama returned empty response' };
    }
    
    const cleanedCode = cleanCodeResponse(content);
    
    return {
      code: cleanedCode,
      explanation: `Generated using Ollama (${OLLAMA_CODE_MODEL})`,
      source: 'ollama',
      model: OLLAMA_CODE_MODEL
    };
  } catch (error) {
    return { error: `Ollama API error: ${error}` };
  }
}

function detectExecutionCommand(prompt: string): { isExecutionCommand: boolean; command: string; operation?: string; details?: any } {
  const lowerPrompt = prompt.toLowerCase();
  
  // File creation commands
  if (lowerPrompt.includes('create file') || lowerPrompt.includes('create a file') || lowerPrompt.includes('add file')) {
    return {
      isExecutionCommand: true,
      command: 'create',
      operation: 'create',
      details: { type: 'file' }
    };
  }
  
  // Component addition commands
  if (lowerPrompt.includes('add component') || lowerPrompt.includes('create component') || lowerPrompt.includes('add this component')) {
    return {
      isExecutionCommand: true,
      command: 'add-component',
      operation: 'add-component',
      details: { type: 'component' }
    };
  }
  
  // File modification commands
  if (lowerPrompt.includes('update') || lowerPrompt.includes('modify') || lowerPrompt.includes('change')) {
    return {
      isExecutionCommand: true,
      command: 'modify',
      operation: 'modify',
      details: { type: 'modification' }
    };
  }
  
  // File deletion commands
  if (lowerPrompt.includes('delete') || lowerPrompt.includes('remove') || lowerPrompt.includes('delete file')) {
    return {
      isExecutionCommand: true,
      command: 'delete',
      operation: 'delete',
      details: { type: 'deletion' }
    };
  }
  
  // Code update commands
  if (lowerPrompt.includes('update code') || lowerPrompt.includes('modify code') || lowerPrompt.includes('change code')) {
    return {
      isExecutionCommand: true,
      command: 'update',
      operation: 'update',
      details: { type: 'code-update' }
    };
  }
  
  return { isExecutionCommand: false, command: '' };
}

const CONVERSATION_SYSTEM = `You are an expert software developer assistant. Reply ONLY with valid JSON, no other text.
Use this exact format: {"message": "your reply to the user", "suggestions": ["optional follow-up 1", "optional follow-up 2"], "shouldGenerateProject": false, "projectPrompt": null}
- message: your conversational response (helpful, ask clarifying questions if needed).
- suggestions: 0-3 short follow-up prompts the user could click.
- shouldGenerateProject: true only when the user clearly wants to generate/build something and requirements are clear enough.
- projectPrompt: when shouldGenerateProject is true, set this to a detailed one-paragraph prompt for code generation (e.g. "Create a Flask app with a todo list: add/delete items, store in memory, simple HTML/CSS frontend with Tailwind."); otherwise null.`;

async function callLLMForConversation(userPrompt: string): Promise<string> {
  const apis: { name: string; fn: (p: string) => Promise<string> }[] = [];
  if (hasValidGroq) apis.push({ name: 'groq', fn: callGroqConversation });
  if (hasValidOpenAI) apis.push({ name: 'openai', fn: callOpenAIConversation });
  if (hasValidOpenRouter) apis.push({ name: 'openrouter', fn: callOpenRouterConversation });
  if (hasValidGoogle) apis.push({ name: 'google', fn: callGoogleConversation });
  apis.push({ name: 'ollama', fn: callOllamaConversation });
  for (const { fn } of apis) {
    try {
      const out = await fn(userPrompt);
      if (typeof out === 'string' && out.trim()) return out;
    } catch (_) {
      continue;
    }
  }
  return '';
}

async function callOpenAIConversation(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'system', content: CONVERSATION_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error('OpenAI error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
async function callGroqConversation(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'system', content: CONVERSATION_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error('Groq error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
async function callOpenRouterConversation(prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'system', content: CONVERSATION_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error('OpenRouter error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
async function callGoogleConversation(prompt: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${CONVERSATION_SYSTEM}\n\nUser:\n${prompt}` }] }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error('Google error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}
async function callOllamaConversation(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_CODE_MODEL,
        prompt: `${CONVERSATION_SYSTEM}\n\nUser:\n${prompt}`,
        stream: false,
        options: { temperature: 0.7, num_predict: 1500 },
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.response?.trim() || '';
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fcccba6e-df5d-43f4-b024-9d90a6fa1d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/ai/route.ts:POST:entry',message:'AI POST entered',data:{hasBody:true},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const body = await req.json();
    const { prompt, provider = 'fallback', features = [], enableAgenticSearch = false, projectName, isConversation, operation, type: bodyType, code: existingCode = '', context: codeContext = '' } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    // Use original prompt without cache busting to avoid rate limits
    const cleanPrompt = prompt;

    // React/component generate: use Ollama /api/generate, return single code string (for IDE / AIAssistant)
    const isGenerateRequest = operation === 'generate' || bodyType === 'generate';
    if (isGenerateRequest && typeof cleanPrompt === 'string' && cleanPrompt.trim()) {
      console.log('[AI] Code gen request, model:', OLLAMA_CODE_MODEL, 'prompt length:', cleanPrompt.length);
      const ollamaResult = await callOllamaReactGenerate(cleanPrompt.trim(), typeof existingCode === 'string' ? existingCode : '', typeof codeContext === 'string' ? codeContext : '');
      console.log('[AI] Code gen result:', ollamaResult.code ? `${ollamaResult.code.length} chars` : ollamaResult.error);
      if (ollamaResult.code && !ollamaResult.error) {
        return NextResponse.json({
          code: ollamaResult.code,
          success: true,
          operation: 'generate',
          model: ollamaResult.model || OLLAMA_CODE_MODEL,
          explanation: ollamaResult.explanation || 'Code generated.',
          suggestions: ollamaResult.suggestions || [],
          source: ollamaResult.source || 'ollama',
          usage: { total_tokens: 0 },
        });
      }
      if (ollamaResult.error) {
        return NextResponse.json(
          {
            error: ollamaResult.error,
            suggestions: ['Start Ollama (ollama serve) and pull a model (e.g. ollama pull qwen3)', 'Try a shorter prompt'],
          },
          { status: 502 }
        );
      }
      // If no code and no error, fall through to multi-provider path
    }

    // Conversation mode: return chat-style JSON (message, suggestions, shouldGenerateProject, projectPrompt) not code
    if (isConversation === true) {
      const raw = await callLLMForConversation(cleanPrompt);
      let message = 'I couldn\'t generate a response right now. Please try again.';
      let suggestions: string[] = [];
      let shouldGenerateProject = false;
      let projectPrompt: string | null = null;
      if (raw) {
        try {
          const start = raw.indexOf('{');
          const end = raw.lastIndexOf('}');
          const jsonStr = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed === 'object') {
            message = typeof parsed.message === 'string' ? parsed.message : message;
            suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : suggestions;
            shouldGenerateProject = Boolean(parsed.shouldGenerateProject);
            projectPrompt = typeof parsed.projectPrompt === 'string' ? parsed.projectPrompt : null;
          }
        } catch {
          message = raw.length > 500 ? raw.slice(0, 500) + '…' : raw;
        }
      }
      return NextResponse.json({ message, suggestions, shouldGenerateProject, projectPrompt });
    }
    
    console.log('AI API called with prompt:', cleanPrompt);
    console.log('Features:', features);
    console.log('Provider:', provider);
    console.log('Enable Agentic Search:', enableAgenticSearch);
    
    // Check if this is an execution command
    const executionCommand = detectExecutionCommand(prompt);
    if (executionCommand.isExecutionCommand && projectName) {
      console.log('Execution command detected:', executionCommand);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fcccba6e-df5d-43f4-b024-9d90a6fa1d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/ai/route.ts:execCommandBranch',message:'Taking execution-command branch',data:{projectName},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Handle execution command by calling the execute-command API
      try {
        const executeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/execute-command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: prompt,
            projectName: projectName,
            operation: executionCommand.operation,
            details: executionCommand.details
          })
        });

        if (executeResponse.ok) {
          const executeResult = await executeResponse.json() as { message: string; files?: string[] };
          return NextResponse.json({
            code: `// ${executeResult.message}\n// Files updated: ${executeResult.files?.join(', ') || 'No files'}`,
            explanation: executeResult.message,
            suggestions: ['Continue with more commands', 'View the updated files', 'Run the project'],
            source: 'execution-command',
            model: 'file-operation',
            usage: { total_tokens: 0 },
            isExecutionCommand: true,
            executionResult: executeResult
          });
        } else {
          const errorData = await executeResponse.json() as { error: string };
          return NextResponse.json({
            code: `// Error: ${errorData.error}`,
            explanation: `Failed to execute command: ${errorData.error}`,
            suggestions: ['Check the project name', 'Verify file paths', 'Try a different command'],
            source: 'execution-command',
            model: 'file-operation',
            usage: { total_tokens: 0 },
            error: errorData.error
          });
        }
    } catch (error) {
        console.error('Execution command error:', error);
        return NextResponse.json({
          code: `// Error: ${error instanceof Error ? error.message : 'Failed to execute command'}`,
          explanation: 'Failed to execute the command. Please try again.',
          suggestions: ['Check your connection', 'Verify the project exists', 'Try a simpler command'],
          source: 'execution-command',
          model: 'file-operation',
          usage: { total_tokens: 0 },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Enhanced prompt based on features (with auto-detection from prompt text)
    let enhancedPrompt = cleanPrompt;

    const promptLower = cleanPrompt.toLowerCase();
    const ALWAYS_UI_UX = true; // force UI/UX emphasis
    const wantsUIDesign =
      ALWAYS_UI_UX ||
      features.includes('ui-ux-design') ||
      /ui\b|ux\b|design|beautiful|stunning|modern|visual|tailwind|responsive|animation|glassmorphism|neumorphism/.test(promptLower);
    const wantsBackend =
      /backend|api\b|server|flask|express|rest\s*api|django|fastapi/i.test(promptLower);

    if (features.includes('deep-research')) {
      enhancedPrompt = `${cleanPrompt}\n\nPlease provide comprehensive research with multiple sources, detailed analysis, and extended reasoning. Include relevant examples and practical applications.`;
    } else if (wantsBackend) {
      enhancedPrompt = `${cleanPrompt}\n\nIMPORTANT: Include complete backend code. You MUST output a "files" array with at least: backend/app.py (or server.js for Node), backend/requirements.txt (or package.json), backend/templates/index.html, backend/static/style.css, backend/static/script.js. Use Flask for Python or Express for Node. No placeholders - full working code only.`;
    } else if (wantsUIDesign) {
      enhancedPrompt = `${cleanPrompt}\n\nDesign requirements: Use a modern, visually appealing UI with strong UX. Prefer responsive layouts, generous spacing, clear hierarchy, and accessible contrast. If generating Flask HTML, include <script src='https://cdn.tailwindcss.com'></script> in <head> and use Tailwind utility classes. For React, also use Tailwind classes. Add subtle transitions/hover states and ensure the layout looks polished on mobile and desktop.`;
    } else if (features.includes('code-optimization')) {
      enhancedPrompt = `${cleanPrompt}\n\nPlease provide optimized, efficient code with best practices, performance considerations, and clean architecture.`;
    } else if (features.includes('educational')) {
      enhancedPrompt = `${cleanPrompt}\n\nPlease provide educational explanations with examples, best practices, and learning resources.`;
    }
    
    // Get available APIs with proper validation
    const availableApis: string[] = [];
    
    // Check each API with proper validation
    if (hasValidGroq) availableApis.push('groq');
    if (hasValidOpenAI) availableApis.push('openai');
    if (hasValidOpenRouter) availableApis.push('openrouter');
    if (hasValidGoogle) availableApis.push('google');
    
    // Always add Ollama as local fallback
    availableApis.push('ollama');
    
    // Prioritize Ollama first for code gen when running locally (no keys required)
    const apiPriority = ['ollama', 'google', 'groq', 'openrouter', 'openai'];
    const prioritizedApis = apiPriority.filter(api => availableApis.includes(api));
    
    console.log('Available APIs:', availableApis);
    console.log('Prioritized APIs:', prioritizedApis);
    console.log('API Status:', {
      groq: hasValidGroq ? '✅ Available' : '❌ Not configured',
      openai: hasValidOpenAI ? '✅ Available' : '❌ Not configured', 
      openrouter: hasValidOpenRouter ? '✅ Available' : '❌ Not configured',
      google: hasValidGoogle ? '✅ Available' : '❌ Not configured',
      ollama: '✅ Always available (local)'
    });
    
    let response: LLMResponse;
    
    // Try APIs in order with better error handling and timeout
    for (const apiName of prioritizedApis) {
      console.log('Trying', apiName, 'API...');
      
      try {
        // Add timeout to prevent hanging - shorter timeout for faster fallback
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000) // 10 second timeout for faster fallback
        );
        
        const apiCallPromise = (async () => {
          switch (apiName) {
            case 'openai':
              return await callOpenAI(enhancedPrompt);
            case 'groq':
              return await callGroq(enhancedPrompt);
            case 'openrouter':
              return await callOpenRouter(enhancedPrompt);
            case 'google':
            
              // Try Google API twice with a short delay
              let googleResponse = await callGoogle(enhancedPrompt);
              const is503 = Boolean(googleResponse && (googleResponse as any).error && typeof (googleResponse as any).error === 'string' && (googleResponse as any).error.includes('503'));
              if (is503) {
                console.log('Google API returned 503, retrying once...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                googleResponse = await callGoogle(enhancedPrompt);
              }
              return googleResponse;
            case 'ollama':
              return await callOllama(enhancedPrompt);
            default:
              return { error: 'Unknown API' };
          }
        })();
        
        response = await Promise.race([apiCallPromise, timeoutPromise]) as LLMResponse;
        
        // If we got a successful response, break out of the loop
        if (response.code && !response.error) {
          console.log(`✅ ${apiName} API call successful with code length:`, response.code.length);
          console.log(`🎯 Using ${apiName} for this request`);
          return NextResponse.json({
            code: response.code,
            explanation: response.explanation || '',
            suggestions: response.suggestions || [],
            source: response.source || 'LLM',
            model: response.model || apiName,
            usage: { total_tokens: 0 }
          });
        }
        
        // Log what we got for debugging
        console.log(`${apiName} API response:`, {
          hasCode: !!response.code,
          codeLength: response.code?.length || 0,
          hasError: !!response.error,
          error: response.error
        });
        
        // If we got an error, log it and continue to next API
        if (response.error) {
          console.log(`${apiName} API error:`, response.error);
          
          // Special handling for rate limits - wait a bit before trying next API
          if (response.error.includes('Too Many Requests') || response.error.includes('rate limit')) {
            console.log(`⏳ Rate limit hit for ${apiName}, waiting 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else if (response.error.includes('Payment Required')) {
            console.log(`💳 Payment required for ${apiName}, skipping...`);
          } else if (response.error.includes('Not Found')) {
            console.log(`🔍 API endpoint not found for ${apiName}, skipping...`);
          }
          
          continue;
        }
        
      } catch (error) {
        console.log(`${apiName} API failed:`, error);
        continue;
      }
    }
    
    // If all APIs fail, try local templates as final fallback
    console.log('❌ All APIs failed - trying local templates...');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fcccba6e-df5d-43f4-b024-9d90a6fa1d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/ai/route.ts:beforeFindMatching',message:'Before findMatchingTemplate',data:{promptLen:cleanPrompt?.length},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const localTemplate = findMatchingTemplate(cleanPrompt);
    if (localTemplate) {
      console.log('✅ Found matching local template');
      return NextResponse.json({
        code: localTemplate.html,
        explanation: localTemplate.explanation,
        suggestions: [
          'This is a local template generated when AI services are unavailable',
          'Try again later for AI-generated custom code',
          'Modify the template to fit your needs'
        ],
        source: 'local-template',
        model: 'template-fallback',
        usage: { total_tokens: 0 }
      });
    }

    // If no local template matches, return error
    console.log('❌ No matching local template found - returning error');
    return NextResponse.json({
      error: 'All AI services are currently unavailable. Please try again in a few moments.',
      suggestions: [
        'Wait 30 seconds and try again',
        'Check your internet connection',
        'Try a simpler prompt like "create a chatbot" or "create a calculator"',
        'Make sure Ollama is running locally',
        'Check your API keys in .env.local',
        'Try restarting the development server'
      ],
      source: 'api-failure',
      model: 'none'
    }, { status: 503 });
    
  } catch (error) {
    console.error('API error:', error);
    // #region agent log
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    fetch('http://127.0.0.1:7242/ingest/fcccba6e-df5d-43f4-b024-9d90a6fa1d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/ai/route.ts:catch500',message:'AI route threw - Internal Server Error',data:{error:errMsg,stack:errStack?.slice(0,500)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    try {
      const line = JSON.stringify({ location: 'api/ai/route.ts:catch500', message: 'AI route threw', data: { error: errMsg, stack: errStack?.slice(0,800) }, timestamp: Date.now(), hypothesisId: 'A' }) + '\n';
      const dir = path.dirname(DEBUG_LOG_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(DEBUG_LOG_PATH, line);
    } catch (_) {
      try { fs.appendFileSync(DEBUG_LOG_FALLBACK, JSON.stringify({ location: 'api/ai/route.ts:catch500', message: 'AI route threw', data: { error: errMsg, stack: errStack?.slice(0,800) }, timestamp: Date.now() }) + '\n'); } catch (_2) {}
    }
    // #endregion
    const safeMessage = process.env.NODE_ENV === 'development' ? errMsg : 'Internal server error';
    return NextResponse.json(
      { error: safeMessage },
      { status: 500 }
    );
  }
}

/** GET /api/ai — health check and Ollama status */
export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await res.json();
    return NextResponse.json({
      status: 'ok',
      ollama: 'connected',
      models: data.models?.map((m: { name?: string }) => m.name) || [],
      activeModel: OLLAMA_CODE_MODEL,
    });
  } catch {
    return NextResponse.json({
      status: 'error',
      ollama: 'disconnected',
      message: 'Cannot reach Ollama at ' + OLLAMA_BASE_URL,
    }, { status: 503 });
  }
}