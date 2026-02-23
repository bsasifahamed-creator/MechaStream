import { providerManager, ProviderStatus } from './ProviderManager'

export interface HealthCheckResult {
  provider: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  responseTime: number
  error?: string
  available: boolean
  lastCheck: Date
  details?: {
    model?: string
    endpoint?: string
    statusCode?: number
    errorType?: 'auth' | 'rate_limit' | 'model' | 'network' | 'service'
  }
}

export interface HealthCheckConfig {
  timeout: number
  retries: number
  interval: number
  endpoints: {
    [provider: string]: string[]
  }
}

export class HealthMonitor {
  private _running: boolean = false
  private checkInterval: NodeJS.Timeout | null = null
  private config: HealthCheckConfig
  private lastResults: Map<string, HealthCheckResult> = new Map()

  constructor(config?: Partial<HealthCheckConfig>) {
    this.config = {
      timeout: 10000, // 10 seconds
      retries: 2,
      interval: 30000, // 30 seconds
      endpoints: {
        openrouter: ['https://openrouter.ai/api/v1/models'],
        deepseek: ['https://api.deepseek.com/v1/models'],
        qwen: ['https://dashscope.aliyuncs.com/compatible-mode/v1/models'],
        'google-cli': ['https://generativelanguage.googleapis.com/v1beta/models']
      },
      ...config
    }
  }

  // Start health monitoring
  public start(): void {
    if (this._running) return

    this._running = true
    this.performHealthCheck() // Initial check
    this.checkInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.interval)

    console.log('Health monitoring started')
  }

  // Stop health monitoring
  public stop(): void {
    if (!this._running) return

    this._running = false
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    console.log('Health monitoring stopped')
  }

  // Perform health check for all providers
  private async performHealthCheck(): Promise<void> {
    const providers = providerManager.getAllProviders()
    
    for (const provider of providers) {
      if (!provider.enabled) continue

      try {
        const result = await this.checkProviderHealth(provider.name)
        this.lastResults.set(provider.name, result)
        
        // Update provider status in ProviderManager
        providerManager.updateProviderStatus(provider.name, {
          status: result.status,
          responseTime: result.responseTime,
          error: result.error,
          available: result.available
        })

        console.log(`Health check for ${provider.name}: ${result.status} (${result.responseTime}ms)`)
      } catch (error) {
        console.error(`Health check failed for ${provider.name}:`, error)
        
        const errorResult: HealthCheckResult = {
          provider: provider.name,
          status: 'down',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          available: false,
          lastCheck: new Date()
        }
        
        this.lastResults.set(provider.name, errorResult)
        providerManager.updateProviderStatus(provider.name, {
          status: 'down',
          responseTime: 0,
          error: errorResult.error,
          available: false
        })
      }
    }
  }

  // Check health for a specific provider
  private async checkProviderHealth(providerName: string): Promise<HealthCheckResult> {
    const provider = providerManager.getProvider(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`)
    }

    const endpoints = this.config.endpoints[providerName] || []
    if (endpoints.length === 0) {
      throw new Error(`No health check endpoints configured for ${providerName}`)
    }

    let bestResult: HealthCheckResult | null = null

    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        const result = await this.checkEndpoint(provider, endpoint)
        if (!bestResult || result.responseTime < bestResult.responseTime) {
          bestResult = result
        }
      } catch (error) {
        console.warn(`Health check failed for ${providerName} at ${endpoint}:`, error)
      }
    }

    if (!bestResult) {
      throw new Error(`All health check endpoints failed for ${providerName}`)
    }

    return bestResult
  }

  // Check a specific endpoint
  private async checkEndpoint(provider: any, endpoint: string): Promise<HealthCheckResult> {
    const startTime = Date.now()
    let responseTime = 0
    let status: 'healthy' | 'degraded' | 'down' = 'healthy'
    let error: string | undefined
    let available = true
    let details: any = {}

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        error = `HTTP ${response.status}: ${errorText}`
        status = this.determineStatusFromResponse(response.status)
        available = false
        details = {
          statusCode: response.status,
          errorType: this.categorizeError(response.status)
        }
      } else {
        // Check response time for performance
        if (responseTime > 5000) {
          status = 'degraded'
        }
      }
    } catch (fetchError: any) {
      responseTime = Date.now() - startTime
      
      if (fetchError.name === 'AbortError') {
        error = 'Request timeout'
        status = 'down'
      } else if (fetchError.code === 'ENOTFOUND') {
        error = 'Network error: DNS resolution failed'
        status = 'down'
      } else if (fetchError.code === 'ECONNREFUSED') {
        error = 'Network error: Connection refused'
        status = 'down'
      } else {
        error = fetchError.message || 'Unknown network error'
        status = 'down'
      }
      
      available = false
      details = {
        errorType: 'network'
      }
    }

    return {
      provider: provider.name,
      status,
      responseTime,
      error,
      available,
      lastCheck: new Date(),
      details
    }
  }

  // Determine status based on HTTP response
  private determineStatusFromResponse(statusCode: number): 'healthy' | 'degraded' | 'down' {
    if (statusCode >= 200 && statusCode < 300) {
      return 'healthy'
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'degraded' // Client errors might be temporary
    } else {
      return 'down' // Server errors indicate problems
    }
  }

  // Categorize error type
  private categorizeError(statusCode: number): 'auth' | 'rate_limit' | 'model' | 'network' | 'service' {
    if (statusCode === 401 || statusCode === 403) {
      return 'auth'
    } else if (statusCode === 429) {
      return 'rate_limit'
    } else if (statusCode === 400 || statusCode === 404) {
      return 'model'
    } else if (statusCode >= 500) {
      return 'service'
    } else {
      return 'network'
    }
  }

  // Get last health check results
  public getLastResults(): HealthCheckResult[] {
    return Array.from(this.lastResults.values())
  }

  // Get health check result for specific provider
  public getProviderHealth(providerName: string): HealthCheckResult | undefined {
    return this.lastResults.get(providerName)
  }

  // Force a health check for a specific provider
  public async forceHealthCheck(providerName: string): Promise<HealthCheckResult> {
    const provider = providerManager.getProvider(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`)
    }

    const result = await this.checkProviderHealth(providerName)
    this.lastResults.set(providerName, result)
    
    // Update provider status
    providerManager.updateProviderStatus(providerName, {
      status: result.status,
      responseTime: result.responseTime,
      error: result.error,
      available: result.available
    })

    return result
  }

  // Get overall system health
  public getSystemHealth(): {
    healthy: number
    degraded: number
    down: number
    total: number
    averageResponseTime: number
  } {
    const results = this.getLastResults()
    const counts = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0)
    const averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0

    return {
      healthy: counts.healthy || 0,
      degraded: counts.degraded || 0,
      down: counts.down || 0,
      total: results.length,
      averageResponseTime
    }
  }

  // Check if system is healthy
  public isSystemHealthy(): boolean {
    const health = this.getSystemHealth()
    return health.healthy > 0 && health.down === 0
  }

  // Get providers that need attention
  public getProvidersNeedingAttention(): HealthCheckResult[] {
    return this.getLastResults().filter(result => 
      result.status === 'down' || result.status === 'degraded'
    )
  }

  // Update configuration
  public updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Get current configuration
  public getConfig(): HealthCheckConfig {
    return { ...this.config }
  }

  // Check if monitoring is running
  public isRunning(): boolean {
    return this._running
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor() 