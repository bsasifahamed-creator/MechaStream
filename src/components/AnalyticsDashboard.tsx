'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Activity,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  Zap,
  Target,
  PieChart,
  LineChart
} from 'lucide-react'

interface UsageMetrics {
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

interface CostAnalysis {
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

interface PerformanceMetrics {
  averageResponseTime: number
  responseTimeByProvider: Record<string, number>
  successRateByProvider: Record<string, number>
  errorRateByProvider: Record<string, number>
  throughputByHour: {
    hour: number
    requests: number
  }[]
}

interface UsageAlert {
  id: string
  type: 'cost_threshold' | 'error_spike' | 'rate_limit' | 'performance_degradation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  provider?: string
  timestamp: Date
  resolved: boolean
  resolutionTime?: Date
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cost' | 'performance' | 'alerts'>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics[]>([])
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<UsageAlert[]>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Load usage metrics
      const metricsResponse = await fetch('/api/analytics/metrics')
      if (metricsResponse.ok) {
        const data = await metricsResponse.json()
        setUsageMetrics(data.metrics || [])
      }

      // Load cost analysis
      const costResponse = await fetch('/api/analytics/cost')
      if (costResponse.ok) {
        const data = await costResponse.json()
        setCostAnalysis(data)
      }

      // Load performance metrics
      const perfResponse = await fetch('/api/analytics/performance')
      if (perfResponse.ok) {
        const data = await perfResponse.json()
        setPerformanceMetrics(data)
      }

      // Load alerts
      const alertsResponse = await fetch('/api/analytics/alerts')
      if (alertsResponse.ok) {
        const data = await alertsResponse.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/analytics/export')
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/analytics/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      })
      
      if (response.ok) {
        loadAnalyticsData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const formatCost = (cost: number) => {
    return `$${(cost / 100).toFixed(2)}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cost_threshold':
        return <DollarSign className="w-4 h-4" />
      case 'error_spike':
        return <AlertTriangle className="w-4 h-4" />
      case 'performance_degradation':
        return <Clock className="w-4 h-4" />
      case 'rate_limit':
        return <Zap className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const totalRequests = usageMetrics.reduce((sum, metric) => sum + metric.requests, 0)
  const totalTokens = usageMetrics.reduce((sum, metric) => sum + metric.tokens, 0)
  const totalCost = usageMetrics.reduce((sum, metric) => sum + metric.cost, 0)
  const totalErrors = usageMetrics.reduce((sum, metric) => sum + metric.errors, 0)
  const averageSuccessRate = usageMetrics.length > 0 
    ? usageMetrics.reduce((sum, metric) => sum + metric.successRate, 0) / usageMetrics.length 
    : 0

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor usage, costs, and performance across all providers</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={loadAnalyticsData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: Activity },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTokens.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCost(totalCost)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{averageSuccessRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>
              <div className="space-y-4">
                {usageMetrics.map((metric) => (
                  <div key={metric.provider} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{metric.provider.replace('-', ' ')}</h4>
                      <span className="text-sm text-gray-500">
                        Last used: {formatTime(metric.lastUsed)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Requests:</span>
                        <p className="font-medium">{metric.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <p className="font-medium">{metric.successRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Response:</span>
                        <p className="font-medium">{metric.averageResponseTime.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <p className="font-medium">{formatCost(metric.cost)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Trend Chart */}
            {costAnalysis && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend</h3>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {costAnalysis.costTrend.slice(-14).map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max((day.cost / 100) / 10, 4)}px`,
                          minHeight: '4px'
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cost' && costAnalysis && (
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cost</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCost(costAnalysis.totalCost)}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost by Provider</h3>
                <div className="space-y-2">
                  {Object.entries(costAnalysis.costByProvider).map(([provider, cost]) => (
                    <div key={provider} className="flex justify-between">
                      <span className="capitalize">{provider.replace('-', ' ')}</span>
                      <span className="font-medium">{formatCost(cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Alerts</h3>
                <div className="space-y-2">
                  {costAnalysis.budgetAlerts.map((alert) => (
                    <div key={alert.provider} className="flex justify-between items-center">
                      <span className="capitalize text-sm">{alert.provider.replace('-', ' ')}</span>
                      <span className={`text-sm px-2 py-1 rounded ${alert.percentage > 80 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {alert.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend (Last 30 Days)</h3>
              <div className="h-80 flex items-end justify-between space-x-1">
                {costAnalysis.costTrend.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ 
                        height: `${Math.max((day.cost / 100) / 5, 4)}px`,
                        minHeight: '4px'
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {index % 7 === 0 ? formatDate(day.date) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && performanceMetrics && (
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Response Time</h3>
                <p className="text-3xl font-bold text-green-600">{performanceMetrics.averageResponseTime.toFixed(0)}ms</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Rates</h3>
                <div className="space-y-2">
                  {Object.entries(performanceMetrics.successRateByProvider).map(([provider, rate]) => (
                    <div key={provider} className="flex justify-between">
                      <span className="capitalize">{provider.replace('-', ' ')}</span>
                      <span className="font-medium">{rate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Rates</h3>
                <div className="space-y-2">
                  {Object.entries(performanceMetrics.errorRateByProvider).map(([provider, rate]) => (
                    <div key={provider} className="flex justify-between">
                      <span className="capitalize">{provider.replace('-', ' ')}</span>
                      <span className="font-medium text-red-600">{rate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Throughput Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Throughput</h3>
              <div className="h-64 flex items-end justify-between space-x-1">
                {performanceMetrics.throughputByHour.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ 
                        height: `${Math.max(hour.requests / 10, 4)}px`,
                        minHeight: '4px'
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {hour.hour}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Alerts Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Cost Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.type === 'cost_threshold').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Performance Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.type === 'performance_degradation').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Error Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.type === 'error_spike').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-4">
                {alerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{alert.message}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {alert.provider && `Provider: ${alert.provider.replace('-', ' ')}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.resolved && (
                          <span className="text-sm text-green-600">Resolved</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 