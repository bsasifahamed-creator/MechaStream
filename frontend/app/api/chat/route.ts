import { NextRequest, NextResponse } from 'next/server';

// API Keys
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
const hasValidOllama = true; // Ollama is local, always try it first

async function callLLMForJSON(userPrompt: string): Promise<any> {
  // Try APIs in order with JSON output
  const apis = [
    { name: 'ollama', key: hasValidOllama, func: callOllama },
    { name: 'google', key: hasValidGoogle, func: callGoogle },
    { name: 'groq', key: hasValidGroq, func: callGroq },
    { name: 'openrouter', key: hasValidOpenRouter, func: callOpenRouter },
    { name: 'openai', key: hasValidOpenAI, func: callOpenAI },
  ];

  for (const api of apis) {
    if (!api.key) continue;

    try {
      console.log(`Trying ${api.name} API for JSON output...`);
      const result = await api.func(userPrompt);
      if (result) {
        console.log(`✅ ${api.name} API returned response`);
        return result;
      }
    } catch (error) {
      console.log(`${api.name} API failed:`, error);
      continue;
    }
  }

  // If all APIs fail, return error - no fallback templates
  console.log('❌ All APIs failed - no fallback available');
  throw new Error('All AI services are currently unavailable. Please try again in a few moments.');
}

async function callOllama(prompt: string): Promise<any> {
  console.log(`🔄 Calling Ollama API (model: ${OLLAMA_CODE_MODEL})...`);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_CODE_MODEL,
        prompt: `You are an expert full-stack developer. Generate a complete web application based on the user's request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create a proper project structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.

User request: ${prompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4000
        }
      })
    });

    if (!response.ok) {
      console.log(`❌ Ollama API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.response || '';

    console.log('📄 Ollama response length:', content.length);

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content.trim());
      if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
        console.log('✅ Ollama returned valid JSON');
        return parsed;
      }
    } catch (parseError) {
      console.log('❌ Ollama response not valid JSON, trying to extract...');
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          if (extracted.files && Array.isArray(extracted.files)) {
            console.log('✅ Extracted valid JSON from Ollama response');
            return extracted;
          }
        } catch (e) {
          console.log('❌ Failed to extract JSON from Ollama response');
        }
      }
    }

    console.log('⚠️ Ollama response not valid JSON format');
    return null;

  } catch (error) {
    console.log('❌ Ollama API failed:', error);
    return null;
  }
}

async function callGoogle(prompt: string): Promise<any> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are an expert full-stack developer. Generate a complete web application based on the user's request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create a proper project structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.\n\nUser request: ${prompt}` }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.7 }
    })
  });

  if (!response.ok) throw new Error(`Google API error: ${response.status}`);

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text || '';

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
      console.log('✅ Google returned valid JSON');
      return parsed;
    }
  } catch (parseError) {
    console.log('❌ Google response not valid JSON, trying to extract...');
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted.files && Array.isArray(extracted.files)) {
          console.log('✅ Extracted valid JSON from Google response');
          return extracted;
        }
      } catch (e) {
        console.log('❌ Failed to extract JSON from Google response');
      }
    }
  }

  console.log('⚠️ Google response not valid JSON format');
  return null;
}

async function callGroq(prompt: string): Promise<any> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{
        role: 'system',
        content: 'You are an expert full-stack developer. Generate a complete web application based on the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create a proper project structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
      console.log('✅ Groq returned valid JSON');
      return parsed;
    }
  } catch (parseError) {
    console.log('❌ Groq response not valid JSON, trying to extract...');
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted.files && Array.isArray(extracted.files)) {
          console.log('✅ Extracted valid JSON from Groq response');
          return extracted;
        }
      } catch (e) {
        console.log('❌ Failed to extract JSON from Groq response');
      }
    }
  }

  console.log('⚠️ Groq response not valid JSON format');
  return null;
}

async function callOpenRouter(prompt: string): Promise<any> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{
        role: 'system',
        content: 'You are an expert full-stack developer. Generate a complete web application based on the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create a proper project structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
      console.log('✅ OpenRouter returned valid JSON');
      return parsed;
    }
  } catch (parseError) {
    console.log('❌ OpenRouter response not valid JSON, trying to extract...');
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted.files && Array.isArray(extracted.files)) {
          console.log('✅ Extracted valid JSON from OpenRouter response');
          return extracted;
        }
      } catch (e) {
        console.log('❌ Failed to extract JSON from OpenRouter response');
      }
    }
  }

  console.log('⚠️ OpenRouter response not valid JSON format');
  return null;
}

async function callOpenAI(prompt: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert full-stack developer. Generate a complete web application based on the user\'s request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "relative/path/to/file.ext", "content": "file content here"}]} - no markdown, no explanations, no code blocks. Create a proper project structure with backend/ and frontend/ directories. For Flask projects, include backend/app.py, backend/templates/index.html, backend/static/style.css, backend/static/script.js, backend/requirements.txt. For React projects, use frontend/ directory. Always provide full working code that can run immediately.'
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object' && parsed.files && Array.isArray(parsed.files)) {
      console.log('✅ OpenAI returned valid JSON');
      return parsed;
    }
  } catch (parseError) {
    console.log('❌ OpenAI response not valid JSON, trying to extract...');
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted.files && Array.isArray(extracted.files)) {
          console.log('✅ Extracted valid JSON from OpenAI response');
          return extracted;
        }
      } catch (e) {
        console.log('❌ Failed to extract JSON from OpenAI response');
      }
    }
  }

  console.log('⚠️ OpenAI response not valid JSON format');
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Chat API called');
    const { message } = await request.json();
    console.log('📨 Received message:', message);

    // When user asks for backend/API/server, ensure we request full backend file structure
    const msg = (message || '').trim();
    const wantsBackend = /\b(backend|api\b|server|flask|express|rest\s*api|django|fastapi)\b/i.test(msg);
    const userPrompt = wantsBackend
      ? `${msg}\n\nInclude complete backend: backend/app.py (or server.js), backend/requirements.txt (or package.json), backend/templates/, backend/static/. Full working code only.`
      : msg;

    // Get LLM response as JSON object
    const jsonResponse = await callLLMForJSON(userPrompt);

    // Check if we got a valid response
    if (jsonResponse && typeof jsonResponse === 'object' && jsonResponse.files && Array.isArray(jsonResponse.files)) {
      console.log('✅ Valid JSON response with', jsonResponse.files.length, 'files');
      return NextResponse.json(jsonResponse);
    } else {
      console.error('❌ Invalid or null response from LLM');
      return NextResponse.json({ error: 'Invalid response from LLM' }, { status: 500 });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    models: ['ai', 'advanced'],
    timestamp: new Date().toISOString()
  })
}
