import { NextRequest, NextResponse } from 'next/server';

// API Keys
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Validate API keys
const hasValidGroq = GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';
const hasValidOpenAI = OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';
const hasValidOpenRouter = OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
const hasValidGoogle = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_api_key_here';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  function_call?: any;
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface ChatRequest {
  messages: Message[];
  projectName?: string;
  model?: string;
}

interface ChatResponse {
  message: string;
  function_call?: FunctionCall;
  suggestions?: string[];
}

// Available functions for the chatbot
const availableFunctions = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the project',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The relative path to the file to read'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a project directory',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The relative path to the directory to list (use "." for root)',
          default: '.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write or update a file in the project',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The relative path where to write the file'
        },
        content: {
          type: 'string',
          description: 'The content to write to the file'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'search_code',
    description: 'Search for code patterns or text in the project files',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query or regex pattern'
        },
        file_pattern: {
          type: 'string',
          description: 'File pattern to search in (e.g., "*.js", "*.tsx")',
          default: '*'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'generate_code',
    description: 'Generate code based on a specific request',
    parameters: {
      type: 'object',
      properties: {
        request: {
          type: 'string',
          description: 'The code generation request'
        },
        framework: {
          type: 'string',
          description: 'The framework to use (react, vue, flask, etc.)'
        },
        language: {
          type: 'string',
          description: 'The programming language'
        }
      },
      required: ['request']
    }
  },
  {
    name: 'generate_project',
    description: 'Generate a complete project with multiple files',
    parameters: {
      type: 'object',
      properties: {
        request: {
          type: 'string',
          description: 'The project generation request'
        }
      },
      required: ['request']
    }
  }
];

async function callConversationalLLM(messages: Message[], model: string = 'gpt-4'): Promise<ChatResponse> {
  const apis = [
    { name: 'ollama', key: true, func: callOllama }, // Ollama is always available locally
    { name: 'openai', key: hasValidOpenAI, func: callOpenAI },
    { name: 'groq', key: hasValidGroq, func: callGroq },
    { name: 'openrouter', key: hasValidOpenRouter, func: callOpenRouter },
    { name: 'google', key: hasValidGoogle, func: callGoogle },
  ];

  for (const api of apis) {
    if (!api.key) continue;

    try {
      console.log(`Trying ${api.name} API for conversational chat...`);
      const result = await api.func(messages, model);
      if (result) {
        console.log(`✅ ${api.name} API returned conversational response`);
        return result;
      }
    } catch (error) {
      console.log(`${api.name} API failed:`, error);
      continue;
    }
  }

  throw new Error('All AI services are currently unavailable for conversational chat.');
}

async function callOpenAI(messages: Message[], model: string): Promise<ChatResponse | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are an expert software developer assistant integrated into a code IDE. Your role is to help users build, debug, and improve their code through interactive conversation.

Key capabilities:
- Ask clarifying questions when requirements are ambiguous
- Use function calls to read files, write code, search the codebase
- Generate code iteratively based on user feedback
- Provide suggestions for improvements and best practices
- Maintain context across multiple turns

Guidelines:
- Always ask at least one clarifying question for vague requests before generating code
- Use function calls to understand the current codebase before making changes
- Offer customization options after initial code generation
- Support iterative refinement through natural language feedback
- Be conversational and helpful, not just a code generator

Available functions: ${availableFunctions.map(f => f.name).join(', ')}`
          },
          ...messages
        ],
        functions: availableFunctions,
        function_call: 'auto',
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.log(`OpenAI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const choice = data.choices[0];

    if (choice.finish_reason === 'function_call') {
      return {
        message: choice.message.content || '',
        function_call: choice.message.function_call
      };
    }

    return {
      message: choice.message.content || '',
      suggestions: [
        'Would you like me to make any changes to this code?',
        'Should I add error handling or validation?',
        'Would you prefer a different approach?'
      ]
    };
  } catch (error) {
    console.log('OpenAI API failed:', error);
    return null;
  }
}

async function callGroq(messages: Message[], model: string): Promise<ChatResponse | null> {
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
            content: `You are an expert software developer assistant integrated into a code IDE. Your role is to help users build, debug, and improve their code through interactive conversation.

Key capabilities:
- Ask clarifying questions when requirements are ambiguous
- Use function calls to read files, write code, search the codebase
- Generate code iteratively based on user feedback
- Provide suggestions for improvements and best practices
- Maintain context across multiple turns

Guidelines:
- Always ask at least one clarifying question for vague requests before generating code
- Use function calls to understand the current codebase before making changes
- Offer customization options after initial code generation
- Support iterative refinement through natural language feedback
- Be conversational and helpful, not just a code generator

Available functions: ${availableFunctions.map(f => f.name).join(', ')}`
          },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.log(`Groq API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      message: choice.message.content || '',
      suggestions: [
        'Would you like me to make any changes to this code?',
        'Should I add error handling or validation?',
        'Would you prefer a different approach?'
      ]
    };
  } catch (error) {
    console.log('Groq API failed:', error);
    return null;
  }
}

async function callOpenRouter(messages: Message[], model: string): Promise<ChatResponse | null> {
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
            content: `You are an expert software developer assistant integrated into a code IDE. Your role is to help users build, debug, and improve their code through interactive conversation.

Key capabilities:
- Ask clarifying questions when requirements are ambiguous
- Use function calls to read files, write code, search the codebase
- Generate code iteratively based on user feedback
- Provide suggestions for improvements and best practices
- Maintain context across multiple turns

Guidelines:
- Always ask at least one clarifying question for vague requests before generating code
- Use function calls to understand the current codebase before making changes
- Offer customization options after initial code generation
- Support iterative refinement through natural language feedback
- Be conversational and helpful, not just a code generator

Available functions: ${availableFunctions.map(f => f.name).join(', ')}`
          },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.log(`OpenRouter API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      message: choice.message.content || '',
      suggestions: [
        'Would you like me to make any changes to this code?',
        'Should I add error handling or validation?',
        'Would you prefer a different approach?'
      ]
    };
  } catch (error) {
    console.log('OpenRouter API failed:', error);
    return null;
  }
}

async function callOllama(messages: Message[], model: string): Promise<ChatResponse | null> {
  try {
    // Convert messages to Ollama format
    const ollamaMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const ollamaModel = process.env.OLLAMA_CODE_MODEL || 'qwen3:4b';
    const ollamaBase = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          {
            role: 'system',
            content: `You are an expert software developer assistant integrated into a code IDE. Your role is to help users build, debug, and improve their code through interactive conversation.

Key capabilities:
- Ask clarifying questions when requirements are ambiguous
- Use function calls to read files, write code, search the codebase
- Generate code iteratively based on user feedback
- Provide suggestions for improvements and best practices
- Maintain context across multiple turns

Guidelines:
- Always ask at least one clarifying question for vague requests before generating code
- Use function calls to understand the current codebase before making changes
- Offer customization options after initial code generation
- Support iterative refinement through natural language feedback
- Be conversational and helpful, not just a code generator

Available functions: ${availableFunctions.map(f => f.name).join(', ')}

Respond with a JSON object in this format: {"message": "your response", "function_call": {"name": "function_name", "arguments": "json_string"}, "suggestions": ["suggestion1", "suggestion2"]}`
          },
          ...ollamaMessages
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1000
        }
      })
    });

    if (!response.ok) {
      console.log(`Ollama API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.message?.content || '';

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content.trim());
      if (parsed && typeof parsed === 'object') {
        return {
          message: parsed.message || '',
          function_call: parsed.function_call,
          suggestions: parsed.suggestions || [
            'Would you like me to make any changes to this code?',
            'Should I add error handling or validation?',
            'Would you prefer a different approach?'
          ]
        };
      }
    } catch (e) {
      // If not JSON, treat as plain text response
      return {
        message: content,
        suggestions: [
          'Would you like me to make any changes to this code?',
          'Should I add error handling or validation?',
          'Would you prefer a different approach?'
        ]
      };
    }

    return {
      message: content,
      suggestions: [
        'Would you like me to make any changes to this code?',
        'Should I add error handling or validation?',
        'Would you prefer a different approach?'
      ]
    };
  } catch (error) {
    console.log('Ollama API failed:', error);
    return null;
  }
}

async function callGoogle(messages: Message[], model: string): Promise<ChatResponse | null> {
  try {
    // Convert messages to Google format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{
              text: `You are an expert software developer assistant integrated into a code IDE. Your role is to help users build, debug, and improve their code through interactive conversation.

Guidelines:
- Always ask at least one clarifying question for vague requests before generating code
- Be conversational and helpful, not just a code generator
- Offer customization options after initial code generation
- Support iterative refinement through natural language feedback

${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`
            }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      console.log(`Google API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';

    return {
      message: content,
      suggestions: [
        'Would you like me to make any changes to this code?',
        'Should I add error handling or validation?',
        'Would you prefer a different approach?'
      ]
    };
  } catch (error) {
    console.log('Google API failed:', error);
    return null;
  }
}

// Function execution handlers
async function executeFunction(functionName: string, args: any, projectName?: string): Promise<any> {
  switch (functionName) {
    case 'read_file':
      return await readFile(args.path, projectName);
    case 'list_directory':
      return await listDirectory(args.path, projectName);
    case 'write_file':
      return await writeFile(args.path, args.content, projectName);
    case 'search_code':
      return await searchCode(args.query, args.file_pattern, projectName);
    case 'generate_code':
      return await generateCode(args.request, args.framework, args.language);
    case 'generate_project':
      return await generateProject(args.request);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

async function readFile(path: string, projectName?: string): Promise<string> {
  if (!projectName) throw new Error('Project name required for file operations');

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/files/read?projectName=${encodeURIComponent(projectName)}&path=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error(`Failed to read file: ${response.statusText}`);

  const data = await response.json();
  return data.content || '';
}

async function listDirectory(path: string, projectName?: string): Promise<string[]> {
  if (!projectName) throw new Error('Project name required for file operations');

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/files/list?projectName=${encodeURIComponent(projectName)}&path=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error(`Failed to list directory: ${response.statusText}`);

  const data = await response.json();
  return data.files || [];
}

async function writeFile(path: string, content: string, projectName?: string): Promise<void> {
  if (!projectName) throw new Error('Project name required for file operations');

  const response = await fetch('/api/files/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: projectName, path, content })
  });

  if (!response.ok) throw new Error(`Failed to write file: ${response.statusText}`);
}

async function searchCode(query: string, filePattern: string = '*', projectName?: string): Promise<any[]> {
  if (!projectName) throw new Error('Project name required for search operations');

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/files/search?projectName=${encodeURIComponent(projectName)}&query=${encodeURIComponent(query)}&filePattern=${encodeURIComponent(filePattern)}`);
  if (!response.ok) throw new Error(`Failed to search code: ${response.statusText}`);

  const data = await response.json();
  return data.results || [];
}

async function generateCode(request: string, framework?: string, language?: string): Promise<any> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: request,
      features: framework ? [`framework-${framework}`] : [],
      provider: 'fallback'
    })
  });

  if (!response.ok) throw new Error(`Failed to generate code: ${response.statusText}`);

  const data = await response.json();
  return data;
}

async function generateProject(request: string): Promise<any> {
  // Call the main chat API to generate project JSON
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: request })
  });

  if (!response.ok) throw new Error(`Failed to generate project: ${response.statusText}`);

  const jsonData = await response.json();

  // Write files using bulk-write API
  const bulkWriteResponse = await fetch('/api/files/bulk-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: jsonData.files })
  });

  if (!bulkWriteResponse.ok) throw new Error(`Failed to write project files: ${bulkWriteResponse.statusText}`);

  const writeResult = await bulkWriteResponse.json();

  return {
    ...jsonData,
    writeResult
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, projectName, model = 'gpt-4' }: ChatRequest = await request.json();

    console.log('🤖 Conversational chat API called with', messages.length, 'messages');

    // Call the LLM for conversational response
    const llmResponse = await callConversationalLLM(messages, model);

    // If there's a function call, execute it
    if (llmResponse.function_call) {
      console.log('🔧 Executing function:', llmResponse.function_call.name);

      try {
        const functionResult = await executeFunction(
          llmResponse.function_call.name,
          JSON.parse(llmResponse.function_call.arguments),
          projectName
        );

        // Return the function result along with the original response
        return NextResponse.json({
          ...llmResponse,
          function_result: functionResult
        });
      } catch (error) {
        console.error('Function execution failed:', error);
        return NextResponse.json({
          message: `I tried to execute ${llmResponse.function_call.name} but encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json(llmResponse);

  } catch (error) {
    console.error('Conversational chat API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again.'
    }, { status: 500 });
  }
}
