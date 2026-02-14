export interface UsageMetrics {
  provider: string
  requests: number
  tokens: number
  cost: number
  errors: number
  successRate: number
  averageResponseTime: number
  lastUsed: Date
  dailyUsage: {
    date: string
    requests: number
    tokens: number
    cost: number
    errors: number
  }[]
  hourlyUsage: {
    hour: number
    requests: number
    tokens: number
    cost: number
  }[]
}

export interface CostAnalysis {
  totalCost: number
  costByProvider: Record<string, number>
  costByModel: Record<string, number>
  costTrend: {
    date: string
    cost: number
  }[]
  budgetAlerts: {
    provider: string
    threshold: number
    currentCost: number
    percentage: number
  }[]
}

export interface PerformanceMetrics {
  averageResponseTime: number
  responseTimeByProvider: Record<string, number>
  successRateByProvider: Record<string, number>
  errorRateByProvider: Record<string, number>
  throughputByHour: {
    hour: number
    requests: number
  }[]
}

export interface UsageAlert {
  id: string
  type: 'cost_threshold' | 'error_spike' | 'rate_limit' | 'performance_degradation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  provider?: string
  timestamp: Date
  resolved: boolean
  resolutionTime?: Date
}

export class UsageAnalytics {
  private usageData: Map<string, UsageMetrics> = new Map()
  private alerts: UsageAlert[] = []
  private costThresholds: Record<string, number> = {}
  private performanceThresholds: Record<string, number> = {}

  constructor() {
    this.initializeDefaultThresholds()
  }

  private initializeDefaultThresholds() {
    // Default cost thresholds (in cents)
    this.costThresholds = {
      'openrouter': 10000, // $100
      'deepseek': 5000,    // $50
      'qwen': 3000,        // $30
      'google-cli': 15000  // $150
    }

    // Default performance thresholds (in ms)
    this.performanceThresholds = {
      'openrouter': 5000,  // 5 seconds
      'deepseek': 8000,    // 8 seconds
      'qwen': 10000,       // 10 seconds
      'google-cli': 3000   // 3 seconds
    }
  }

  // Record a new API request
  public recordRequest(provider: string, model: string, tokens: number, cost: number, responseTime: number, success: boolean, error?: string) {
    const timestamp = new Date()
    const hour = timestamp.getHours()
    const date = timestamp.toISOString().split('T')[0]

    // Get or create provider metrics
    let metrics = this.usageData.get(provider)
    if (!metrics) {
      metrics = {
        provider,
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
        successRate: 100,
        averageResponseTime: 0,
        lastUsed: timestamp,
        dailyUsage: [],
        hourlyUsage: []
      }
      this.usageData.set(provider, metrics)
    }

    // Update metrics
    metrics.requests++
    metrics.tokens += tokens
    metrics.cost += cost
    metrics.lastUsed = timestamp

    if (!success) {
      metrics.errors++
    }

    // Update success rate
    const totalRequests = metrics.requests
    const successfulRequests = totalRequests - metrics.errors
    metrics.successRate = (successfulRequests / totalRequests) * 100

    // Update average response time
    const totalResponseTime = metrics.averageResponseTime * (totalRequests - 1) + responseTime
    metrics.averageResponseTime = totalResponseTime / totalRequests

    // Update daily usage
    this.updateDailyUsage(metrics, date, tokens, cost, success)

    // Update hourly usage
    this.updateHourlyUsage(metrics, hour, tokens, cost)

    // Check for alerts
    this.checkAlerts(provider, metrics, cost, responseTime, success)

    return metrics
  }

  private updateDailyUsage(metrics: UsageMetrics, date: string, tokens: number, cost: number, success: boolean) {
    let dailyEntry = metrics.dailyUsage.find(entry => entry.date === date)
    
    if (!dailyEntry) {
      dailyEntry = {
        date,
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0
      }
      metrics.dailyUsage.push(dailyEntry)
    }

    dailyEntry.requests++
    dailyEntry.tokens += tokens
    dailyEntry.cost += cost
    if (!success) {
      dailyEntry.errors++
    }
  }

  private updateHourlyUsage(metrics: UsageMetrics, hour: number, tokens: number, cost: number) {
    let hourlyEntry = metrics.hourlyUsage.find(entry => entry.hour === hour)
    
    if (!hourlyEntry) {
      hourlyEntry = {
        hour,
        requests: 0,
        tokens: 0,
        cost: 0
      }
      metrics.hourlyUsage.push(hourlyEntry)
    }

    hourlyEntry.requests++
    hourlyEntry.tokens += tokens
    hourlyEntry.cost += cost
  }

  private checkAlerts(provider: string, metrics: UsageMetrics, cost: number, responseTime: number, success: boolean) {
    const timestamp = new Date()

    // Cost threshold alert
    const costThreshold = this.costThresholds[provider] || 10000
    if (metrics.cost >= costThreshold) {
      const alert: UsageAlert = {
        id: `cost-${provider}-${timestamp.getTime()}`,
        type: 'cost_threshold',
        severity: metrics.cost >= costThreshold * 1.5 ? 'high' : 'medium',
        message: `${provider} cost threshold exceeded: $${(metrics.cost / 100).toFixed(2)}`,
        provider,
        timestamp,
        resolved: false
      }
      this.alerts.push(alert)
    }

    // Performance degradation alert
    const performanceThreshold = this.performanceThresholds[provider] || 5000
    if (responseTime > performanceThreshold) {
      const alert: UsageAlert = {
        id: `perf-${provider}-${timestamp.getTime()}`,
        type: 'performance_degradation',
        severity: responseTime > performanceThreshold * 2 ? 'high' : 'medium',
        message: `${provider} response time degraded: ${responseTime}ms`,
        provider,
        timestamp,
        resolved: false
      }
      this.alerts.push(alert)
    }

    // Error spike alert
    const recentErrors = metrics.dailyUsage
      .slice(-7) // Last 7 days
      .reduce((sum, day) => sum + day.errors, 0)
    
    if (recentErrors > 50) {
      const alert: UsageAlert = {
        id: `error-${provider}-${timestamp.getTime()}`,
        type: 'error_spike',
        severity: recentErrors > 100 ? 'critical' : 'high',
        message: `${provider} error spike detected: ${recentErrors} errors in last 7 days`,
        provider,
        timestamp,
        resolved: false
      }
      this.alerts.push(alert)
    }
  }

  // Get usage metrics for a specific provider
  public getProviderMetrics(provider: string): UsageMetrics | undefined {
    return this.usageData.get(provider)
  }

  // Get all provider metrics
  public getAllMetrics(): UsageMetrics[] {
    return Array.from(this.usageData.values())
  }

  // Get cost analysis
  public getCostAnalysis(): CostAnalysis {
    const totalCost = Array.from(this.usageData.values())
      .reduce((sum, metrics) => sum + metrics.cost, 0)

    const costByProvider: Record<string, number> = {}
    const costByModel: Record<string, number> = {}
    
    this.usageData.forEach((metrics, provider) => {
      costByProvider[provider] = metrics.cost
    })

    // Generate cost trend (last 30 days)
    const costTrend = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dailyCost = Array.from(this.usageData.values())
        .reduce((sum, metrics) => {
          const dailyEntry = metrics.dailyUsage.find(entry => entry.date === dateStr)
          return sum + (dailyEntry?.cost || 0)
        }, 0)
      
      costTrend.push({
        date: dateStr,
        cost: dailyCost
      })
    }

    // Generate budget alerts
    const budgetAlerts = Object.entries(this.costThresholds).map(([provider, threshold]) => {
      const metrics = this.usageData.get(provider)
      const currentCost = metrics?.cost || 0
      const percentage = (currentCost / threshold) * 100

      return {
        provider,
        threshold,
        currentCost,
        percentage
      }
    }).filter(alert => alert.percentage > 50) // Only show alerts above 50%

    return {
      totalCost,
      costByProvider,
      costByModel,
      costTrend,
      budgetAlerts
    }
  }

  // Get performance metrics
  public getPerformanceMetrics(): PerformanceMetrics {
    const allMetrics = Array.from(this.usageData.values())
    
    if (allMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        responseTimeByProvider: {},
        successRateByProvider: {},
        errorRateByProvider: {},
        throughputByHour: []
      }
    }

    const averageResponseTime = allMetrics.reduce((sum, metrics) => sum + metrics.averageResponseTime, 0) / allMetrics.length

    const responseTimeByProvider: Record<string, number> = {}
    const successRateByProvider: Record<string, number> = {}
    const errorRateByProvider: Record<string, number> = {}

    allMetrics.forEach(metrics => {
      responseTimeByProvider[metrics.provider] = metrics.averageResponseTime
      successRateByProvider[metrics.provider] = metrics.successRate
      errorRateByProvider[metrics.provider] = 100 - metrics.successRate
    })

    // Generate throughput by hour
    const throughputByHour = Array.from({ length: 24 }, (_, hour) => {
      const requests = allMetrics.reduce((sum, metrics) => {
        const hourlyEntry = metrics.hourlyUsage.find(entry => entry.hour === hour)
        return sum + (hourlyEntry?.requests || 0)
      }, 0)

      return { hour, requests }
    })

    return {
      averageResponseTime,
      responseTimeByProvider,
      successRateByProvider,
      errorRateByProvider,
      throughputByHour
    }
  }

  // Get active alerts
  public getActiveAlerts(): UsageAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  // Resolve an alert
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolutionTime = new Date()
      return true
    }
    return false
  }

  // Set cost threshold for a provider
  public setCostThreshold(provider: string, threshold: number): void {
    this.costThresholds[provider] = threshold
  }

  // Set performance threshold for a provider
  public setPerformanceThreshold(provider: string, threshold: number): void {
    this.performanceThresholds[provider] = threshold
  }

  // Get usage summary
  public getUsageSummary(): {
    totalRequests: number
    totalTokens: number
    totalCost: number
    totalErrors: number
    averageSuccessRate: number
    averageResponseTime: number
  } {
    const allMetrics = Array.from(this.usageData.values())
    
    if (allMetrics.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        totalErrors: 0,
        averageSuccessRate: 0,
        averageResponseTime: 0
      }
    }

    const totalRequests = allMetrics.reduce((sum, metrics) => sum + metrics.requests, 0)
    const totalTokens = allMetrics.reduce((sum, metrics) => sum + metrics.tokens, 0)
    const totalCost = allMetrics.reduce((sum, metrics) => sum + metrics.cost, 0)
    const totalErrors = allMetrics.reduce((sum, metrics) => sum + metrics.errors, 0)
    const averageSuccessRate = allMetrics.reduce((sum, metrics) => sum + metrics.successRate, 0) / allMetrics.length
    const averageResponseTime = allMetrics.reduce((sum, metrics) => sum + metrics.averageResponseTime, 0) / allMetrics.length

    return {
      totalRequests,
      totalTokens,
      totalCost,
      totalErrors,
      averageSuccessRate,
      averageResponseTime
    }
  }

  // Export usage data
  public exportUsageData(): string {
    const data = {
      metrics: Array.from(this.usageData.values()),
      alerts: this.alerts,
      costAnalysis: this.getCostAnalysis(),
      performanceMetrics: this.getPerformanceMetrics(),
      summary: this.getUsageSummary(),
      exportDate: new Date().toISOString()
    }
    
    return JSON.stringify(data, null, 2)
  }

  // Clear old data (older than 90 days)
  public cleanupOldData(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    this.usageData.forEach(metrics => {
      metrics.dailyUsage = metrics.dailyUsage.filter(entry => 
        new Date(entry.date) > cutoffDate
      )
    })

    // Remove resolved alerts older than 30 days
    const alertCutoff = new Date()
    alertCutoff.setDate(alertCutoff.getDate() - 30)
    
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || (alert.resolutionTime && alert.resolutionTime > alertCutoff)
    )
  }
}

// Export singleton instance
export const usageAnalytics = new UsageAnalytics() 