import { EventEmitter } from 'events'

// Types and Interfaces
export interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
}

export interface ProviderConfig {
  name: string
  apiKey: string
  baseURL: string
  models: string[]
  rateLimits: RateLimitConfig
  priority: number
  enabled: boolean
  lastUsed?: Date
  successRate?: number
  averageResponseTime?: number
  totalRequests?: number
  failedRequests?: number
}

export interface ProviderStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: Date
  responseTime: number
  error?: string
  available: boolean
}

export interface ProviderUsage {
  provider: string
  requests: number
  tokens: number
  cost: number
  errors: number
  lastUsed: Date
}

// Provider Manager Class
export class ProviderManager extends EventEmitter {
  private providers: Map<string, ProviderConfig> = new Map()
  private status: Map<string, ProviderStatus> = new Map()
  private usage: Map<string, ProviderUsage> = new Map()
  private currentProvider: string | null = null
  private fallbackProviders: string[] = []

  constructor() {
    super()
    this.initializeDefaultProviders()
  }

  // Initialize default providers
  private initializeDefaultProviders() {
    const defaultProviders: ProviderConfig[] = [
      {
        name: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseURL: 'https://openrouter.ai/api/v1',
        models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
        rateLimits: { requestsPerMinute: 60, requestsPerHour: 1000, requestsPerDay: 10000 },
        priority: 1,
        enabled: true
      },
      {
        name: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder'],
        rateLimits: { requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5000 },
        priority: 2,
        enabled: true
      },
      {
        name: 'qwen',
        apiKey: process.env.QWEN_API_KEY || '',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
        rateLimits: { requestsPerMinute: 40, requestsPerHour: 800, requestsPerDay: 8000 },
        priority: 3,
        enabled: true
      },
      {
        name: 'google-cli',
        apiKey: process.env.GOOGLE_CLI_API_KEY || '',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        rateLimits: { requestsPerMinute: 50, requestsPerHour: 1000, requestsPerDay: 10000 },
        priority: 4,
        enabled: true
      }
    ]

    defaultProviders.forEach(provider => {
      this.registerProvider(provider)
    })

    // Set initial provider
    this.currentProvider = this.getBestAvailableProvider()
    this.updateFallbackProviders()
  }

  // Register a new provider
  public registerProvider(config: ProviderConfig): void {
    if (!this.validateProviderConfig(config)) {
      throw new Error(`Invalid provider configuration for ${config.name}`)
    }

    this.providers.set(config.name, config)
    this.status.set(config.name, {
      name: config.name,
      status: 'unknown',
      lastCheck: new Date(),
      responseTime: 0,
      available: false
    })

    this.usage.set(config.name, {
      provider: config.name,
      requests: 0,
      tokens: 0,
      cost: 0,
      errors: 0,
      lastUsed: new Date()
    })

    this.emit('providerRegistered', config.name)
    this.updateFallbackProviders()
  }

  // Validate provider configuration
  private validateProviderConfig(config: ProviderConfig): boolean {
    return !!(
      config.name &&
      config.apiKey &&
      config.baseURL &&
      config.models.length > 0 &&
      config.rateLimits &&
      config.priority > 0
    )
  }

  // Get provider configuration
  public getProvider(name: string): ProviderConfig | undefined {
    return this.providers.get(name)
  }

  // Get all providers
  public getAllProviders(): ProviderConfig[] {
    return Array.from(this.providers.values())
  }

  // Get enabled providers
  public getEnabledProviders(): ProviderConfig[] {
    return this.getAllProviders().filter(p => p.enabled)
  }

  // Get provider status
  public getProviderStatus(name: string): ProviderStatus | undefined {
    return this.status.get(name)
  }

  // Get all provider statuses
  public getAllProviderStatuses(): ProviderStatus[] {
    return Array.from(this.status.values())
  }

  // Update provider status
  public updateProviderStatus(name: string, status: Partial<ProviderStatus>): void {
    const currentStatus = this.status.get(name)
    if (currentStatus) {
      const updatedStatus: ProviderStatus = {
        ...currentStatus,
        ...status,
        lastCheck: new Date()
      }
      this.status.set(name, updatedStatus)
      this.emit('statusUpdated', name, updatedStatus)
    }
  }

  // Get current provider
  public getCurrentProvider(): string | null {
    return this.currentProvider
  }

  // Set current provider
  public setCurrentProvider(name: string): boolean {
    const provider = this.providers.get(name)
    if (provider && provider.enabled) {
      this.currentProvider = name
      this.emit('providerChanged', name)
      return true
    }
    return false
  }

  // Get best available provider based on priority and health
  public getBestAvailableProvider(): string | null {
    const enabledProviders = this.getEnabledProviders()
    const healthyProviders = enabledProviders.filter(provider => {
      const status = this.status.get(provider.name)
      return status?.available && status?.status === 'healthy'
    })

    if (healthyProviders.length === 0) {
      return null
    }

    // Sort by priority and success rate
    const sortedProviders = healthyProviders.sort((a, b) => {
      const aStatus = this.status.get(a.name)!
      const bStatus = this.status.get(b.name)!
      
      // First by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      
      // Then by success rate
      const aSuccessRate = a.successRate || 0
      const bSuccessRate = b.successRate || 0
      return bSuccessRate - aSuccessRate
    })

    return sortedProviders[0].name
  }

  // Get fallback providers
  public getFallbackProviders(): string[] {
    return this.fallbackProviders
  }

  // Update fallback providers list
  private updateFallbackProviders(): void {
    const enabledProviders = this.getEnabledProviders()
    this.fallbackProviders = enabledProviders
      .filter(p => p.name !== this.currentProvider)
      .sort((a, b) => a.priority - b.priority)
      .map(p => p.name)
  }

  // Switch to next available provider
  public switchToNextProvider(): string | null {
    const currentIndex = this.fallbackProviders.indexOf(this.currentProvider || '')
    const nextIndex = (currentIndex + 1) % this.fallbackProviders.length
    
    for (let i = 0; i < this.fallbackProviders.length; i++) {
      const providerName = this.fallbackProviders[(nextIndex + i) % this.fallbackProviders.length]
      const status = this.status.get(providerName)
      
      if (status?.available && status?.status === 'healthy') {
        this.setCurrentProvider(providerName)
        return providerName
      }
    }
    
    return null
  }

  // Record usage for a provider
  public recordUsage(providerName: string, tokens: number, cost: number, success: boolean): void {
    const usage = this.usage.get(providerName)
    if (usage) {
      usage.requests++
      usage.tokens += tokens
      usage.cost += cost
      usage.lastUsed = new Date()
      
      if (!success) {
        usage.errors++
      }
      
      this.usage.set(providerName, usage)
      this.emit('usageUpdated', providerName, usage)
    }

    // Update provider success rate
    const provider = this.providers.get(providerName)
    if (provider) {
      const totalRequests = (provider.totalRequests || 0) + 1
      const failedRequests = (provider.failedRequests || 0) + (success ? 0 : 1)
      const successRate = ((totalRequests - failedRequests) / totalRequests) * 100

      provider.totalRequests = totalRequests
      provider.failedRequests = failedRequests
      provider.successRate = successRate
      provider.lastUsed = new Date()

      this.providers.set(providerName, provider)
    }
  }

  // Get usage statistics
  public getUsageStats(providerName?: string): ProviderUsage[] {
    if (providerName) {
      const usage = this.usage.get(providerName)
      return usage ? [usage] : []
    }
    return Array.from(this.usage.values())
  }

  // Check if provider is rate limited
  public isRateLimited(providerName: string): boolean {
    const usage = this.usage.get(providerName)
    const provider = this.providers.get(providerName)
    
    if (!usage || !provider) return false

    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // This is a simplified check - in a real implementation, you'd track requests per time window
    return usage.requests > provider.rateLimits.requestsPerMinute
  }

  // Enable/disable provider
  public setProviderEnabled(name: string, enabled: boolean): boolean {
    const provider = this.providers.get(name)
    if (provider) {
      provider.enabled = enabled
      this.providers.set(name, provider)
      this.updateFallbackProviders()
      this.emit('providerToggled', name, enabled)
      return true
    }
    return false
  }

  // Update provider configuration
  public updateProviderConfig(name: string, updates: Partial<ProviderConfig>): boolean {
    const provider = this.providers.get(name)
    if (provider) {
      const updatedProvider = { ...provider, ...updates }
      if (this.validateProviderConfig(updatedProvider)) {
        this.providers.set(name, updatedProvider)
        this.emit('providerUpdated', name, updatedProvider)
        return true
      }
    }
    return false
  }

  // Remove provider
  public removeProvider(name: string): boolean {
    const removed = this.providers.delete(name)
    if (removed) {
      this.status.delete(name)
      this.usage.delete(name)
      this.updateFallbackProviders()
      this.emit('providerRemoved', name)
    }
    return removed
  }

  // Get overall system health
  public getSystemHealth(): {
    healthy: number
    degraded: number
    down: number
    total: number
  } {
    const statuses = this.getAllProviderStatuses()
    const counts = statuses.reduce((acc, status) => {
      acc[status.status] = (acc[status.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      healthy: counts.healthy || 0,
      degraded: counts.degraded || 0,
      down: counts.down || 0,
      total: statuses.length
    }
  }

  // Export configuration
  public exportConfiguration(): {
    providers: ProviderConfig[]
    currentProvider: string | null
    fallbackProviders: string[]
  } {
    return {
      providers: this.getAllProviders(),
      currentProvider: this.currentProvider,
      fallbackProviders: this.fallbackProviders
    }
  }

  // Import configuration
  public importConfiguration(config: {
    providers: ProviderConfig[]
    currentProvider?: string | null
  }): void {
    // Clear existing providers
    this.providers.clear()
    this.status.clear()
    this.usage.clear()

    // Register new providers
    config.providers.forEach(provider => {
      this.registerProvider(provider)
    })

    // Set current provider if provided
    if (config.currentProvider) {
      this.setCurrentProvider(config.currentProvider)
    }
  }
}

// Export singleton instance
export const providerManager = new ProviderManager() 