import { NextResponse } from 'next/server'

export async function GET() {
  // Mock error data
  const errors = [
    {
      id: 'error-1',
      error: {
        provider: 'qwen',
        type: 'auth',
        message: 'Incorrect API key provided',
        statusCode: 401,
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        context: {
          requestId: 'req-123456',
          model: 'qwen-turbo',
          endpoint: '/v1/chat/completions'
        },
        retryable: false,
        recoveryStrategy: {
          action: 'user_notification',
          message: 'Authentication failed',
          suggestion: 'Please check your Qwen API key in the settings'
        }
      },
      resolved: false
    },
    {
      id: 'error-2',
      error: {
        provider: 'deepseek',
        type: 'model',
        message: 'Model not found: deepseek-chat',
        statusCode: 404,
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        context: {
          requestId: 'req-123457',
          model: 'deepseek-chat',
          endpoint: '/v1/chat/completions'
        },
        retryable: true,
        recoveryStrategy: {
          action: 'switch_provider',
          message: 'Model not available',
          suggestion: 'Switching to alternative provider'
        }
      },
      resolved: true,
      resolutionTime: new Date(Date.now() - 300000),
      resolutionStrategy: 'Switched to OpenRouter'
    },
    {
      id: 'error-3',
      error: {
        provider: 'openrouter',
        type: 'rate_limit',
        message: 'Rate limit exceeded',
        statusCode: 429,
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        context: {
          requestId: 'req-123458',
          model: 'gpt-4',
          endpoint: '/v1/chat/completions'
        },
        retryable: true,
        recoveryStrategy: {
          action: 'retry',
          delay: 60000,
          maxRetries: 3,
          message: 'Rate limit exceeded',
          suggestion: 'Retrying in 60 seconds'
        }
      },
      resolved: false
    },
    {
      id: 'error-4',
      error: {
        provider: 'google-cli',
        type: 'network',
        message: 'Connection timeout',
        statusCode: 0,
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        context: {
          requestId: 'req-123459',
          model: 'gemini-1.5-flash',
          endpoint: '/v1beta/models/gemini-1.5-flash:generateContent'
        },
        retryable: true,
        recoveryStrategy: {
          action: 'retry',
          delay: 5000,
          maxRetries: 5,
          message: 'Network error',
          suggestion: 'Retrying connection'
        }
      },
      resolved: true,
      resolutionTime: new Date(Date.now() - 600000),
      resolutionStrategy: 'Connection restored'
    }
  ]

  return NextResponse.json({ errors })
} 