export interface ErrorContext {
  provider: string
  endpoint: string
  timestamp: Date
  userAgent?: string
  requestId?: string
  retryCount: number
  previousErrors: string[]
}

export interface ErrorCategory {
  type: 'authentication' | 'rate_limit' | 'quota_exceeded' | 'network' | 'server_error' | 'timeout' | 'invalid_request' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
  retryable: boolean
  maxRetries: number
  backoffStrategy: 'immediate' | 'linear' | 'exponential' | 'none'
  recoveryActions: string[]
  preventionStrategies: string[]
}

export interface ErrorRecoveryStrategy {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
  fallbackOptions: string[]
}

export interface ErrorPattern {
  pattern: string
  category: ErrorCategory
  frequency: number
  lastOccurrence: Date
}

export class AdvancedErrorHandler {
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private errorHistory: Array<{
    error: string
    context: ErrorContext
    category: ErrorCategory
    resolved: boolean
    resolutionTime?: Date
  }> = []
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map()

  constructor() {
    this.initializeErrorCategories()
    this.initializeRecoveryStrategies()
  }

  private initializeErrorCategories() {
    const categories: Record<string, ErrorCategory> = {
      authentication: {
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
      },
      rate_limit: {
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
      },
      quota_exceeded: {
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
      },
      network: {
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
      },
      server_error: {
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
      },
      timeout: {
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
      },
      invalid_request: {
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
      },
      unknown: {
        type: 'unknown',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        maxRetries: 2,
        backoffStrategy: 'linear',
        recoveryActions: [
          'Log error for analysis',
          'Retry with backoff',
          'Switch to alternative provider',
          'Contact support'
        ],
        preventionStrategies: [
          'Implement comprehensive logging',
          'Monitor error patterns',
          'Use multiple providers',
          'Implement graceful degradation'
        ]
      }
    }

    // Initialize error patterns
    Object.entries(categories).forEach(([type, category]) => {
      this.errorPatterns.set(type, {
        pattern: type,
        category,
        frequency: 0,
        lastOccurrence: new Date()
      })
    })
  }

  private initializeRecoveryStrategies() {
    this.recoveryStrategies.set('authentication', {
      immediate: [
        'Validate API key format',
        'Check API key permissions',
        'Test with minimal request'
      ],
      shortTerm: [
        'Rotate API key',
        'Update authentication method',
        'Contact provider support'
      ],
      longTerm: [
        'Implement key rotation',
        'Set up monitoring',
        'Use multiple API keys'
      ],
      fallbackOptions: [
        'Switch to alternative provider',
        'Use cached responses',
        'Implement offline mode'
      ]
    })

    this.recoveryStrategies.set('rate_limit', {
      immediate: [
        'Implement exponential backoff',
        'Reduce request frequency',
        'Queue requests'
      ],
      shortTerm: [
        'Switch to alternative provider',
        'Implement request batching',
        'Use rate limiting'
      ],
      longTerm: [
        'Implement circuit breaker',
        'Set up multiple providers',
        'Optimize request patterns'
      ],
      fallbackOptions: [
        'Use cached responses',
        'Switch to offline mode',
        'Implement graceful degradation'
      ]
    })

    this.recoveryStrategies.set('quota_exceeded', {
      immediate: [
        'Switch to alternative provider',
        'Use cached responses',
        'Implement usage monitoring'
      ],
      shortTerm: [
        'Upgrade provider plan',
        'Contact provider support',
        'Implement usage alerts'
      ],
      longTerm: [
        'Set up multiple providers',
        'Implement usage optimization',
        'Set up automatic scaling'
      ],
      fallbackOptions: [
        'Use offline mode',
        'Implement graceful degradation',
        'Switch to free tier'
      ]
    })
  }

  // Categorize an error based on error message and context
  public categorizeError(error: string, context: ErrorContext): ErrorCategory {
    const errorLower = error.toLowerCase()
    
    // Check for specific error patterns
    if (errorLower.includes('authentication') || errorLower.includes('invalid key') || errorLower.includes('401')) {
      return this.errorPatterns.get('authentication')!.category
    }
    
    if (errorLower.includes('rate limit') || errorLower.includes('429') || errorLower.includes('too many requests')) {
      return this.errorPatterns.get('rate_limit')!.category
    }
    
    if (errorLower.includes('quota') || errorLower.includes('billing') || errorLower.includes('402')) {
      return this.errorPatterns.get('quota_exceeded')!.category
    }
    
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
      return this.errorPatterns.get('network')!.category
    }
    
    if (errorLower.includes('server error') || errorLower.includes('500') || errorLower.includes('503')) {
      return this.errorPatterns.get('server_error')!.category
    }
    
    if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
      return this.errorPatterns.get('timeout')!.category
    }
    
    if (errorLower.includes('invalid request') || errorLower.includes('400') || errorLower.includes('bad request')) {
      return this.errorPatterns.get('invalid_request')!.category
    }
    
    // Default to unknown
    return this.errorPatterns.get('unknown')!.category
  }

  // Get recovery strategy for an error
  public getRecoveryStrategy(errorType: string): ErrorRecoveryStrategy {
    return this.recoveryStrategies.get(errorType) || this.recoveryStrategies.get('unknown')!
  }

  // Record an error for pattern analysis
  public recordError(error: string, context: ErrorContext) {
    const category = this.categorizeError(error, context)
    
    // Update error pattern frequency
    const pattern = this.errorPatterns.get(category.type)
    if (pattern) {
      pattern.frequency++
      pattern.lastOccurrence = new Date()
    }
    
    // Add to error history
    this.errorHistory.push({
      error,
      context,
      category,
      resolved: false
    })
    
    // Keep only last 1000 errors
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000)
    }
  }

  // Resolve an error
  public resolveError(errorIndex: number) {
    if (errorIndex >= 0 && errorIndex < this.errorHistory.length) {
      this.errorHistory[errorIndex].resolved = true
      this.errorHistory[errorIndex].resolutionTime = new Date()
    }
  }

  // Get error analytics
  public getErrorAnalytics() {
    const totalErrors = this.errorHistory.length
    const resolvedErrors = this.errorHistory.filter(e => e.resolved).length
    const resolutionRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0

    const errorsByCategory = new Map<string, { count: number, resolved: number, avgRetryCount: number }>()
    
    this.errorHistory.forEach(error => {
      const category = error.category.type
      const stats = errorsByCategory.get(category) || { count: 0, resolved: 0, avgRetryCount: 0 }
      
      stats.count++
      if (error.resolved) {
        stats.resolved++
      }
      stats.avgRetryCount = (stats.avgRetryCount * (stats.count - 1) + error.context.retryCount) / stats.count
      
      errorsByCategory.set(category, stats)
    })

    return {
      totalErrors,
      resolvedErrors,
      resolutionRate,
      errorsByCategory: Array.from(errorsByCategory.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        resolved: stats.resolved,
        resolutionRate: (stats.resolved / stats.count) * 100,
        avgRetryCount: stats.avgRetryCount
      }))
    }
  }

  // Get error patterns
  public getErrorPatterns() {
    return Array.from(this.errorPatterns.values()).map(pattern => ({
      type: pattern.pattern,
      frequency: pattern.frequency,
      lastOccurrence: pattern.lastOccurrence,
      category: pattern.category
    }))
  }

  // Get recent errors
  public getRecentErrors(limit: number = 10) {
    return this.errorHistory
      .slice(-limit)
      .reverse()
      .map(error => ({
        error: error.error,
        provider: error.context.provider,
        timestamp: error.context.timestamp,
        category: error.category.type,
        severity: error.category.severity,
        resolved: error.resolved,
        resolutionTime: error.resolutionTime
      }))
  }

  // Get provider error summary
  public getProviderErrorSummary() {
    const providerStats = new Map<string, { errors: number, resolved: number, avgRetryCount: number }>()
    
    this.errorHistory.forEach(error => {
      const provider = error.context.provider
      const stats = providerStats.get(provider) || { errors: 0, resolved: 0, avgRetryCount: 0 }
      
      stats.errors++
      if (error.resolved) {
        stats.resolved++
      }
      stats.avgRetryCount = (stats.avgRetryCount * (stats.errors - 1) + error.context.retryCount) / stats.errors
      
      providerStats.set(provider, stats)
    })

    return Array.from(providerStats.entries()).map(([provider, stats]) => ({
      provider,
      errors: stats.errors,
      resolved: stats.resolved,
      resolutionRate: (stats.resolved / stats.errors) * 100,
      avgRetryCount: stats.avgRetryCount
    }))
  }

  // Get intelligent retry recommendations
  public getRetryRecommendations(error: string, context: ErrorContext): {
    shouldRetry: boolean
    maxRetries: number
    backoffStrategy: string
    nextRetryDelay: number
    recommendations: string[]
  } {
    const category = this.categorizeError(error, context)
    
    if (!category.retryable) {
      return {
        shouldRetry: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        nextRetryDelay: 0,
        recommendations: category.recoveryActions
      }
    }

    const currentRetryCount = context.retryCount
    const shouldRetry = currentRetryCount < category.maxRetries
    
    let nextRetryDelay = 0
    if (shouldRetry) {
      switch (category.backoffStrategy) {
        case 'immediate':
          nextRetryDelay = 0
          break
        case 'linear':
          nextRetryDelay = 1000 * (currentRetryCount + 1) // 1s, 2s, 3s...
          break
        case 'exponential':
          nextRetryDelay = 1000 * Math.pow(2, currentRetryCount) // 1s, 2s, 4s, 8s...
          break
        default:
          nextRetryDelay = 1000
      }
    }

    return {
      shouldRetry,
      maxRetries: category.maxRetries,
      backoffStrategy: category.backoffStrategy,
      nextRetryDelay,
      recommendations: category.recoveryActions
    }
  }

  // Export error data for analysis
  public exportErrorData() {
    return {
      patterns: this.getErrorPatterns(),
      analytics: this.getErrorAnalytics(),
      recentErrors: this.getRecentErrors(50),
      providerSummary: this.getProviderErrorSummary(),
      exportDate: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const advancedErrorHandler = new AdvancedErrorHandler() 