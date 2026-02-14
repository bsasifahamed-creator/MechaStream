import { providerManager } from './ProviderManager'

export interface ApiError {
  provider: string
  type: 'auth' | 'rate_limit' | 'model' | 'network' | 'service' | 'unknown'
  message: string
  statusCode?: number
  timestamp: Date
  context?: ErrorContext
  retryable: boolean
  recoveryStrategy: RecoveryStrategy
}

export interface ErrorContext {
  requestId?: string
  model?: string
  endpoint?: string
  userAgent?: string
  ip?: string
  sessionId?: string
}

export interface RecoveryStrategy {
  action: 'retry' | 'switch_provider' | 'fallback' | 'user_notification' | 'none'
  delay?: number
  maxRetries?: number
  provider?: string
  message?: string
  suggestion?: string
}

export interface ErrorLog {
  id: string
  error: ApiError
  resolved: boolean
  resolutionTime?: Date
  resolutionStrategy?: string
}

export class ErrorHandler {
  private errorLogs: Map<string, ErrorLog> = new Map()
  private errorPatterns: Map<string, RegExp> = new Map()
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map()

  constructor() {
    this.initializeErrorPatterns()
    this.initializeRecoveryStrategies()
  }

  // Initialize error patterns for categorization
  private initializeErrorPatterns(): void {
    this.errorPatterns.set('auth', /(invalid.*api.*key|unauthorized|forbidden|authentication.*failed)/i)
    this.errorPatterns.set('rate_limit', /(rate.*limit|too.*many.*requests|quota.*exceeded|429)/i)
    this.errorPatterns.set('model', /(model.*not.*exist|model.*not.*found|invalid.*model|400)/i)
    this.errorPatterns.set('network', /(network.*error|connection.*failed|timeout|dns.*error)/i)
    this.errorPatterns.set('service', /(internal.*server.*error|service.*unavailable|502|503|504)/i)
  }

  // Initialize recovery strategies
  private initializeRecoveryStrategies(): void {
    // Authentication errors
    this.recoveryStrategies.set('auth', {
      action: 'user_notification',
      message: 'API key is invalid or expired',
      suggestion: 'Please check your API key configuration in the settings'
    })

    // Rate limit errors
    this.recoveryStrategies.set('rate_limit', {
      action: 'switch_provider',
      delay: 60000, // 1 minute delay
      message: 'Rate limit exceeded',
      suggestion: 'Switching to alternative provider'
    })

    // Model errors
    this.recoveryStrategies.set('model', {
      action: 'switch_provider',
      message: 'Model not available',
      suggestion: 'Switching to provider with available models'
    })

    // Network errors
    this.recoveryStrategies.set('network', {
      action: 'retry',
      maxRetries: 3,
      delay: 2000, // 2 second delay
      message: 'Network connection issue',
      suggestion: 'Retrying with exponential backoff'
    })

    // Service errors
    this.recoveryStrategies.set('service', {
      action: 'switch_provider',
      message: 'Service temporarily unavailable',
      suggestion: 'Switching to alternative provider'
    })

    // Unknown errors
    this.recoveryStrategies.set('unknown', {
      action: 'fallback',
      message: 'Unexpected error occurred',
      suggestion: 'Using fallback generation method'
    })
  }

  // Handle an API error
  public handleError(
    provider: string,
    error: Error | string,
    context?: ErrorContext
  ): ApiError {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorType = this.categorizeError(errorMessage)
    const recoveryStrategy = this.getRecoveryStrategy(errorType)

    const apiError: ApiError = {
      provider,
      type: errorType,
      message: errorMessage,
      timestamp: new Date(),
      context,
      retryable: this.isRetryable(errorType),
      recoveryStrategy
    }

    // Log the error
    this.logError(apiError)

    // Execute recovery strategy
    this.executeRecoveryStrategy(apiError)

    return apiError
  }

  // Categorize error based on message patterns
  private categorizeError(message: string): 'auth' | 'rate_limit' | 'model' | 'network' | 'service' | 'unknown' {
    for (const [type, pattern] of this.errorPatterns) {
      if (pattern.test(message)) {
        return type as any
      }
    }
    return 'unknown'
  }

  // Get recovery strategy for error type
  private getRecoveryStrategy(errorType: string): RecoveryStrategy {
    return this.recoveryStrategies.get(errorType) || this.recoveryStrategies.get('unknown')!
  }

  // Check if error is retryable
  private isRetryable(errorType: string): boolean {
    return ['network', 'service'].includes(errorType)
  }

  // Execute recovery strategy
  private async executeRecoveryStrategy(error: ApiError): Promise<void> {
    const { recoveryStrategy } = error

    switch (recoveryStrategy.action) {
      case 'retry':
        await this.handleRetry(error)
        break
      case 'switch_provider':
        await this.handleProviderSwitch(error)
        break
      case 'fallback':
        await this.handleFallback(error)
        break
      case 'user_notification':
        this.handleUserNotification(error)
        break
      case 'none':
        // No action needed
        break
    }
  }

  // Handle retry strategy
  private async handleRetry(error: ApiError): Promise<void> {
    const { recoveryStrategy } = error
    const maxRetries = recoveryStrategy.maxRetries || 3
    const delay = recoveryStrategy.delay || 1000

    console.log(`Retrying ${error.provider} after ${delay}ms (${maxRetries} attempts remaining)`)
    
    // In a real implementation, you would implement actual retry logic here
    // For now, we'll just log the retry attempt
    setTimeout(() => {
      console.log(`Retry attempt for ${error.provider}`)
    }, delay)
  }

  // Handle provider switch strategy
  private async handleProviderSwitch(error: ApiError): Promise<void> {
    const fallbackProviders = providerManager.getFallbackProviders()
    const availableProvider = fallbackProviders.find(provider => {
      const status = providerManager.getProviderStatus(provider)
      return status?.available && status?.status === 'healthy'
    })

    if (availableProvider) {
      providerManager.setCurrentProvider(availableProvider)
      console.log(`Switched from ${error.provider} to ${availableProvider}`)
    } else {
      console.log('No healthy fallback providers available')
    }
  }

  // Handle fallback strategy
  private async handleFallback(error: ApiError): Promise<void> {
    console.log(`Using fallback generation method due to error in ${error.provider}`)
    // In a real implementation, this would trigger fallback generation
  }

  // Handle user notification strategy
  private handleUserNotification(error: ApiError): void {
    console.log(`User notification: ${error.recoveryStrategy.message}`)
    // In a real implementation, this would show a user-friendly notification
  }

  // Log error for tracking
  private logError(error: ApiError): void {
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      error,
      resolved: false
    }

    this.errorLogs.set(errorLog.id, errorLog)
    console.error(`API Error logged: ${error.type} - ${error.message}`)
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Mark error as resolved
  public resolveError(errorId: string, resolutionStrategy?: string): boolean {
    const errorLog = this.errorLogs.get(errorId)
    if (errorLog) {
      errorLog.resolved = true
      errorLog.resolutionTime = new Date()
      errorLog.resolutionStrategy = resolutionStrategy
      return true
    }
    return false
  }

  // Get error statistics
  public getErrorStats(): {
    total: number
    resolved: number
    unresolved: number
    byType: Record<string, number>
    byProvider: Record<string, number>
  } {
    const logs = Array.from(this.errorLogs.values())
    const byType: Record<string, number> = {}
    const byProvider: Record<string, number> = {}

    logs.forEach(log => {
      byType[log.error.type] = (byType[log.error.type] || 0) + 1
      byProvider[log.error.provider] = (byProvider[log.error.provider] || 0) + 1
    })

    return {
      total: logs.length,
      resolved: logs.filter(log => log.resolved).length,
      unresolved: logs.filter(log => !log.resolved).length,
      byType,
      byProvider
    }
  }

  // Get recent errors
  public getRecentErrors(limit: number = 10): ErrorLog[] {
    return Array.from(this.errorLogs.values())
      .sort((a, b) => b.error.timestamp.getTime() - a.error.timestamp.getTime())
      .slice(0, limit)
  }

  // Get errors by provider
  public getErrorsByProvider(provider: string): ErrorLog[] {
    return Array.from(this.errorLogs.values())
      .filter(log => log.error.provider === provider)
  }

  // Get errors by type
  public getErrorsByType(type: string): ErrorLog[] {
    return Array.from(this.errorLogs.values())
      .filter(log => log.error.type === type)
  }

  // Clear old error logs (older than 30 days)
  public clearOldLogs(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    let clearedCount = 0

    for (const [id, log] of this.errorLogs) {
      if (log.error.timestamp < thirtyDaysAgo) {
        this.errorLogs.delete(id)
        clearedCount++
      }
    }

    return clearedCount
  }

  // Get user-friendly error message
  public getUserFriendlyMessage(error: ApiError): string {
    const messages: Record<string, string> = {
      auth: 'Your API key appears to be invalid. Please check your settings.',
      rate_limit: 'You\'ve reached the rate limit for this provider. We\'ll switch to an alternative.',
      model: 'The requested model is not available. We\'ll use an alternative provider.',
      network: 'There was a network connection issue. We\'ll retry automatically.',
      service: 'The service is temporarily unavailable. We\'ll switch to an alternative provider.',
      unknown: 'An unexpected error occurred. We\'ll try alternative methods.'
    }

    return messages[error.type] || messages.unknown
  }

  // Get error suggestions
  public getErrorSuggestions(error: ApiError): string[] {
    const suggestions: Record<string, string[]> = {
      auth: [
        'Check your API key in the settings',
        'Verify the API key is correct and active',
        'Ensure the API key has the necessary permissions'
      ],
      rate_limit: [
        'Wait a few minutes before trying again',
        'Consider upgrading your API plan',
        'Check your usage limits in the provider dashboard'
      ],
      model: [
        'Try using a different model',
        'Check if the model is available in your region',
        'Verify the model name is correct'
      ],
      network: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the issue persists'
      ],
      service: [
        'The service should be back online shortly',
        'Try again in a few minutes',
        'Check the provider\'s status page'
      ],
      unknown: [
        'Try again in a few moments',
        'Check your internet connection',
        'Contact support if the issue persists'
      ]
    }

    return suggestions[error.type] || suggestions.unknown
  }

  // Add custom error pattern
  public addErrorPattern(type: string, pattern: RegExp): void {
    this.errorPatterns.set(type, pattern)
  }

  // Add custom recovery strategy
  public addRecoveryStrategy(type: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(type, strategy)
  }

  // Export error logs
  public exportErrorLogs(): ErrorLog[] {
    return Array.from(this.errorLogs.values())
  }

  // Import error logs
  public importErrorLogs(logs: ErrorLog[]): void {
    logs.forEach(log => {
      this.errorLogs.set(log.id, log)
    })
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler() 