export interface ProviderScore {
  provider: string
  score: number
  factors: {
    performance: number
    cost: number
    reliability: number
    availability: number
    latency: number
  }
  recommendations: string[]
}

export interface SelectionCriteria {
  priority: 'performance' | 'cost' | 'reliability' | 'balanced'
  maxCost?: number
  maxLatency?: number
  minSuccessRate?: number
  preferredProviders?: string[]
  excludedProviders?: string[]
}

export interface ProviderMetrics {
  provider: string
  averageResponseTime: number
  successRate: number
  costPerToken: number
  availability: number
  lastUsed: Date
  errorRate: number
  totalRequests: number
}

export class IntelligentProviderSelector {
  private providerMetrics: Map<string, ProviderMetrics> = new Map()
  private selectionHistory: Array<{
    timestamp: Date
    selectedProvider: string
    criteria: SelectionCriteria
    result: 'success' | 'failure'
    responseTime: number
  }> = []

  constructor() {
    this.initializeDefaultMetrics()
  }

  private initializeDefaultMetrics() {
    // Initialize with default metrics for all providers
    const defaultProviders = [
      {
        provider: 'openrouter',
        averageResponseTime: 1200,
        successRate: 98.5,
        costPerToken: 0.0001,
        availability: 99.9,
        lastUsed: new Date(),
        errorRate: 1.5,
        totalRequests: 1250
      },
      {
        provider: 'deepseek',
        averageResponseTime: 1800,
        successRate: 95.2,
        costPerToken: 0.00008,
        availability: 98.5,
        lastUsed: new Date(Date.now() - 300000),
        errorRate: 4.8,
        totalRequests: 890
      },
      {
        provider: 'qwen',
        averageResponseTime: 2200,
        successRate: 92.1,
        costPerToken: 0.00006,
        availability: 97.0,
        lastUsed: new Date(Date.now() - 86400000),
        errorRate: 7.9,
        totalRequests: 567
      },
      {
        provider: 'google-cli',
        averageResponseTime: 950,
        successRate: 97.8,
        costPerToken: 0.00012,
        availability: 99.5,
        lastUsed: new Date(Date.now() - 60000),
        errorRate: 2.2,
        totalRequests: 2100
      }
    ]

    defaultProviders.forEach(metrics => {
      this.providerMetrics.set(metrics.provider, metrics)
    })
  }

  // Update provider metrics after a request
  public updateProviderMetrics(
    provider: string,
    responseTime: number,
    success: boolean,
    cost: number,
    tokens: number
  ) {
    const metrics = this.providerMetrics.get(provider)
    if (!metrics) return

    // Update response time (moving average)
    const alpha = 0.1 // Smoothing factor
    metrics.averageResponseTime = 
      alpha * responseTime + (1 - alpha) * metrics.averageResponseTime

    // Update success rate
    metrics.totalRequests++
    if (!success) {
      metrics.errorRate = (metrics.errorRate * (metrics.totalRequests - 1) + 1) / metrics.totalRequests
    }
    metrics.successRate = 100 - metrics.errorRate

    // Update cost per token
    if (tokens > 0) {
      metrics.costPerToken = cost / tokens
    }

    // Update last used
    metrics.lastUsed = new Date()

    // Update availability (simplified)
    metrics.availability = success ? Math.min(100, metrics.availability + 0.1) : Math.max(0, metrics.availability - 1)

    this.providerMetrics.set(provider, metrics)
  }

  // Select the best provider based on criteria
  public selectProvider(criteria: SelectionCriteria): ProviderScore[] {
    const availableProviders = Array.from(this.providerMetrics.values())
      .filter(provider => {
        // Filter by excluded providers
        if (criteria.excludedProviders?.includes(provider.provider)) {
          return false
        }

        // Filter by cost constraint
        if (criteria.maxCost && provider.costPerToken > criteria.maxCost) {
          return false
        }

        // Filter by latency constraint
        if (criteria.maxLatency && provider.averageResponseTime > criteria.maxLatency) {
          return false
        }

        // Filter by success rate constraint
        if (criteria.minSuccessRate && provider.successRate < criteria.minSuccessRate) {
          return false
        }

        return true
      })

    // Calculate scores for each provider
    const scoredProviders = availableProviders.map(provider => {
      const score = this.calculateProviderScore(provider, criteria)
      return score
    })

    // Sort by score (highest first)
    return scoredProviders.sort((a, b) => b.score - a.score)
  }

  private calculateProviderScore(provider: ProviderMetrics, criteria: SelectionCriteria): ProviderScore {
    const factors = {
      performance: 0,
      cost: 0,
      reliability: 0,
      availability: 0,
      latency: 0
    }

    const recommendations: string[] = []

    // Performance factor (response time)
    const maxResponseTime = Math.max(...Array.from(this.providerMetrics.values()).map(p => p.averageResponseTime))
    factors.performance = 1 - (provider.averageResponseTime / maxResponseTime)
    
    if (provider.averageResponseTime > 2000) {
      recommendations.push('High latency detected')
    }

    // Cost factor (lower is better)
    const maxCostPerToken = Math.max(...Array.from(this.providerMetrics.values()).map(p => p.costPerToken))
    factors.cost = 1 - (provider.costPerToken / maxCostPerToken)
    
    if (provider.costPerToken > 0.0001) {
      recommendations.push('Consider cost optimization')
    }

    // Reliability factor (success rate)
    factors.reliability = provider.successRate / 100
    
    if (provider.successRate < 95) {
      recommendations.push('Low success rate - consider alternatives')
    }

    // Availability factor
    factors.availability = provider.availability / 100
    
    if (provider.availability < 98) {
      recommendations.push('Availability concerns detected')
    }

    // Latency factor (lower is better)
    const minResponseTime = Math.min(...Array.from(this.providerMetrics.values()).map(p => p.averageResponseTime))
    factors.latency = 1 - ((provider.averageResponseTime - minResponseTime) / (maxResponseTime - minResponseTime))

    // Calculate weighted score based on priority
    let score = 0
    switch (criteria.priority) {
      case 'performance':
        score = factors.performance * 0.4 + factors.latency * 0.3 + factors.reliability * 0.2 + factors.availability * 0.1
        break
      case 'cost':
        score = factors.cost * 0.5 + factors.reliability * 0.3 + factors.availability * 0.2
        break
      case 'reliability':
        score = factors.reliability * 0.4 + factors.availability * 0.3 + factors.performance * 0.2 + factors.cost * 0.1
        break
      case 'balanced':
      default:
        score = factors.performance * 0.25 + factors.cost * 0.25 + factors.reliability * 0.25 + factors.availability * 0.25
        break
    }

    // Boost score for preferred providers
    if (criteria.preferredProviders?.includes(provider.provider)) {
      score *= 1.2
      recommendations.push('Preferred provider - boosted score')
    }

    return {
      provider: provider.provider,
      score,
      factors,
      recommendations
    }
  }

  // Get provider recommendations for a specific use case
  public getRecommendations(useCase: string): ProviderScore[] {
    let criteria: SelectionCriteria

    switch (useCase) {
      case 'high-performance':
        criteria = {
          priority: 'performance',
          maxLatency: 1500,
          minSuccessRate: 95
        }
        break
      case 'cost-effective':
        criteria = {
          priority: 'cost',
          maxCost: 0.0001,
          minSuccessRate: 90
        }
        break
      case 'reliable':
        criteria = {
          priority: 'reliability',
          minSuccessRate: 98,
          maxLatency: 3000
        }
        break
      case 'balanced':
      default:
        criteria = {
          priority: 'balanced',
          minSuccessRate: 92
        }
        break
    }

    return this.selectProvider(criteria)
  }

  // Record selection result for learning
  public recordSelectionResult(
    selectedProvider: string,
    criteria: SelectionCriteria,
    success: boolean,
    responseTime: number
  ) {
    this.selectionHistory.push({
      timestamp: new Date(),
      selectedProvider,
      criteria,
      result: success ? 'success' : 'failure',
      responseTime
    })

    // Keep only last 1000 selections
    if (this.selectionHistory.length > 1000) {
      this.selectionHistory = this.selectionHistory.slice(-1000)
    }
  }

  // Get selection analytics
  public getSelectionAnalytics() {
    const totalSelections = this.selectionHistory.length
    const successfulSelections = this.selectionHistory.filter(s => s.result === 'success').length
    const successRate = totalSelections > 0 ? (successfulSelections / totalSelections) * 100 : 0

    const providerStats = new Map<string, { selections: number, successes: number, avgResponseTime: number }>()
    
    this.selectionHistory.forEach(selection => {
      const stats = providerStats.get(selection.selectedProvider) || {
        selections: 0,
        successes: 0,
        avgResponseTime: 0
      }
      
      stats.selections++
      if (selection.result === 'success') {
        stats.successes++
      }
      stats.avgResponseTime = (stats.avgResponseTime * (stats.selections - 1) + selection.responseTime) / stats.selections
      
      providerStats.set(selection.selectedProvider, stats)
    })

    return {
      totalSelections,
      successRate,
      providerStats: Array.from(providerStats.entries()).map(([provider, stats]) => ({
        provider,
        selections: stats.selections,
        successRate: (stats.successes / stats.selections) * 100,
        avgResponseTime: stats.avgResponseTime
      }))
    }
  }

  // Get provider health summary
  public getProviderHealthSummary() {
    return Array.from(this.providerMetrics.values()).map(provider => ({
      provider: provider.provider,
      status: this.getProviderStatus(provider),
      metrics: {
        responseTime: provider.averageResponseTime,
        successRate: provider.successRate,
        costPerToken: provider.costPerToken,
        availability: provider.availability,
        totalRequests: provider.totalRequests
      },
      lastUsed: provider.lastUsed
    }))
  }

  private getProviderStatus(provider: ProviderMetrics): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = (provider.successRate * 0.4) + 
                  ((100 - provider.averageResponseTime / 50) * 0.3) + 
                  (provider.availability * 0.3)

    if (score >= 95) return 'excellent'
    if (score >= 85) return 'good'
    if (score >= 70) return 'fair'
    return 'poor'
  }

  // Get intelligent fallback recommendations
  public getFallbackRecommendations(failedProvider: string, errorType: string): ProviderScore[] {
    // Exclude the failed provider
    const criteria: SelectionCriteria = {
      priority: 'reliability',
      excludedProviders: [failedProvider],
      minSuccessRate: 95
    }

    // Adjust criteria based on error type
    if (errorType.includes('rate_limit')) {
      criteria.priority = 'performance'
      criteria.maxLatency = 2000
    } else if (errorType.includes('cost') || errorType.includes('billing')) {
      criteria.priority = 'cost'
      criteria.maxCost = 0.00008
    } else if (errorType.includes('authentication') || errorType.includes('invalid_key')) {
      // For auth errors, prefer providers with high availability
      criteria.priority = 'reliability'
      criteria.minSuccessRate = 98
    }

    return this.selectProvider(criteria)
  }

  // Export provider data for analysis
  public exportProviderData() {
    return {
      metrics: Array.from(this.providerMetrics.values()),
      selectionHistory: this.selectionHistory,
      analytics: this.getSelectionAnalytics(),
      healthSummary: this.getProviderHealthSummary(),
      exportDate: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const intelligentProviderSelector = new IntelligentProviderSelector() 