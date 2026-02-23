import { NextResponse } from 'next/server'

export async function GET() {
  // Mock provider data
  const providers = [
    {
      name: 'openrouter',
      apiKey: 'sk-or-v1-...',
      baseURL: 'https://openrouter.ai/api/v1',
      models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'],
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      priority: 1,
      enabled: true,
      lastUsed: new Date(),
      successRate: 98.5,
      averageResponseTime: 1200,
      totalRequests: 1250,
      failedRequests: 19
    },
    {
      name: 'deepseek',
      apiKey: 'sk-...',
      baseURL: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder'],
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
        requestsPerDay: 5000
      },
      priority: 2,
      enabled: true,
      lastUsed: new Date(Date.now() - 300000), // 5 minutes ago
      successRate: 95.2,
      averageResponseTime: 1800,
      totalRequests: 890,
      failedRequests: 43
    },
    {
      name: 'qwen',
      apiKey: 'sk-...',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      models: ['qwen-turbo', 'qwen-plus'],
      rateLimits: {
        requestsPerMinute: 40,
        requestsPerHour: 800,
        requestsPerDay: 8000
      },
      priority: 3,
      enabled: false,
      lastUsed: new Date(Date.now() - 86400000), // 1 day ago
      successRate: 92.1,
      averageResponseTime: 2200,
      totalRequests: 567,
      failedRequests: 45
    },
    {
      name: 'google-cli',
      apiKey: 'sk-...',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
      rateLimits: {
        requestsPerMinute: 50,
        requestsPerHour: 1200,
        requestsPerDay: 15000
      },
      priority: 4,
      enabled: true,
      lastUsed: new Date(Date.now() - 60000), // 1 minute ago
      successRate: 97.8,
      averageResponseTime: 950,
      totalRequests: 2100,
      failedRequests: 46
    }
  ]

  return NextResponse.json({ providers })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Mock provider update
    console.log('Updating provider:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Provider updated successfully' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    )
  }
} 