import { NextResponse } from 'next/server'

export async function GET() {
  // Mock recent errors data
  const errors = [
    {
      error: 'AuthenticationError: 401 Incorrect API key provided',
      provider: 'qwen',
      timestamp: new Date(Date.now() - 3600000),
      category: 'authentication',
      severity: 'high',
      resolved: false
    },
    {
      error: 'RateLimitError: 429 Too many requests',
      provider: 'openrouter',
      timestamp: new Date(Date.now() - 7200000),
      category: 'rate_limit',
      severity: 'medium',
      resolved: true,
      resolutionTime: new Date(Date.now() - 5400000)
    },
    {
      error: 'QuotaExceededError: 402 Payment required',
      provider: 'deepseek',
      timestamp: new Date(Date.now() - 14400000),
      category: 'quota_exceeded',
      severity: 'high',
      resolved: false
    },
    {
      error: 'NetworkError: Connection timeout',
      provider: 'google-cli',
      timestamp: new Date(Date.now() - 1800000),
      category: 'network',
      severity: 'medium',
      resolved: true,
      resolutionTime: new Date(Date.now() - 900000)
    },
    {
      error: 'ServerError: 500 Internal server error',
      provider: 'qwen',
      timestamp: new Date(Date.now() - 5400000),
      category: 'server_error',
      severity: 'medium',
      resolved: false
    },
    {
      error: 'TimeoutError: Request timed out',
      provider: 'deepseek',
      timestamp: new Date(Date.now() - 3600000),
      category: 'timeout',
      severity: 'medium',
      resolved: true,
      resolutionTime: new Date(Date.now() - 1800000)
    },
    {
      error: 'InvalidRequestError: 400 Bad request',
      provider: 'openrouter',
      timestamp: new Date(Date.now() - 86400000),
      category: 'invalid_request',
      severity: 'low',
      resolved: true,
      resolutionTime: new Date(Date.now() - 82800000)
    },
    {
      error: 'AuthenticationError: Invalid API key format',
      provider: 'google-cli',
      timestamp: new Date(Date.now() - 7200000),
      category: 'authentication',
      severity: 'high',
      resolved: false
    },
    {
      error: 'RateLimitError: 429 Rate limit exceeded',
      provider: 'qwen',
      timestamp: new Date(Date.now() - 10800000),
      category: 'rate_limit',
      severity: 'medium',
      resolved: true,
      resolutionTime: new Date(Date.now() - 9000000)
    },
    {
      error: 'NetworkError: DNS resolution failed',
      provider: 'openrouter',
      timestamp: new Date(Date.now() - 3600000),
      category: 'network',
      severity: 'medium',
      resolved: false
    }
  ]

  return NextResponse.json({ errors })
} 