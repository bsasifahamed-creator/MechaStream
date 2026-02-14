import { NextResponse } from 'next/server'

export async function GET() {
  // Mock error patterns data
  const patterns = [
    {
      type: 'authentication',
      frequency: 12,
      lastOccurrence: new Date(Date.now() - 3600000),
      category: {
        type: 'authentication',
        severity: 'high',
        recoverable: true,
        retryable: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        recoveryActions: [
          'Check API key validity',
          'Verify API key permissions',
          'Rotate API key if compromised',
          'Contact provider support'
        ],
        preventionStrategies: [
          'Regular API key rotation',
          'Monitor API key usage',
          'Implement key validation checks'
        ]
      }
    },
    {
      type: 'rate_limit',
      frequency: 8,
      lastOccurrence: new Date(Date.now() - 7200000),
      category: {
        type: 'rate_limit',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        recoveryActions: [
          'Implement exponential backoff',
          'Reduce request frequency',
          'Use request queuing',
          'Switch to alternative provider'
        ],
        preventionStrategies: [
          'Implement rate limiting',
          'Monitor request patterns',
          'Use request batching',
          'Implement circuit breaker'
        ]
      }
    },
    {
      type: 'quota_exceeded',
      frequency: 5,
      lastOccurrence: new Date(Date.now() - 14400000),
      category: {
        type: 'quota_exceeded',
        severity: 'high',
        recoverable: true,
        retryable: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        recoveryActions: [
          'Upgrade provider plan',
          'Switch to alternative provider',
          'Implement usage monitoring',
          'Contact provider for quota increase'
        ],
        preventionStrategies: [
          'Monitor usage quotas',
          'Implement usage alerts',
          'Set up automatic scaling',
          'Use multiple providers'
        ]
      }
    },
    {
      type: 'network',
      frequency: 15,
      lastOccurrence: new Date(Date.now() - 1800000),
      category: {
        type: 'network',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        maxRetries: 5,
        backoffStrategy: 'exponential',
        recoveryActions: [
          'Retry with exponential backoff',
          'Check network connectivity',
          'Switch to alternative endpoint',
          'Use fallback provider'
        ],
        preventionStrategies: [
          'Implement connection pooling',
          'Use multiple endpoints',
          'Monitor network health',
          'Implement circuit breaker'
        ]
      }
    },
    {
      type: 'server_error',
      frequency: 6,
      lastOccurrence: new Date(Date.now() - 5400000),
      category: {
        type: 'server_error',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        maxRetries: 3,
        backoffStrategy: 'linear',
        recoveryActions: [
          'Retry with linear backoff',
          'Switch to alternative provider',
          'Contact provider support',
          'Use fallback endpoint'
        ],
        preventionStrategies: [
          'Monitor provider status',
          'Implement health checks',
          'Use multiple providers',
          'Implement graceful degradation'
        ]
      }
    },
    {
      type: 'timeout',
      frequency: 9,
      lastOccurrence: new Date(Date.now() - 3600000),
      category: {
        type: 'timeout',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        maxRetries: 2,
        backoffStrategy: 'linear',
        recoveryActions: [
          'Increase timeout settings',
          'Retry with longer timeout',
          'Switch to faster provider',
          'Use async processing'
        ],
        preventionStrategies: [
          'Optimize request size',
          'Implement request caching',
          'Use connection pooling',
          'Monitor response times'
        ]
      }
    },
    {
      type: 'invalid_request',
      frequency: 3,
      lastOccurrence: new Date(Date.now() - 86400000),
      category: {
        type: 'invalid_request',
        severity: 'low',
        recoverable: true,
        retryable: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        recoveryActions: [
          'Validate request format',
          'Check parameter values',
          'Update request schema',
          'Review API documentation'
        ],
        preventionStrategies: [
          'Implement request validation',
          'Use type-safe APIs',
          'Test with sample data',
          'Monitor request patterns'
        ]
      }
    }
  ]

  return NextResponse.json({ patterns })
} 