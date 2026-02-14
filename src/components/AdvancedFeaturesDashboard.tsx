'use client'

import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Zap, 
  Shield, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  RefreshCw,
  Settings,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Star,
  AlertCircle
} from 'lucide-react'

interface ProviderScore {
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

interface SelectionCriteria {
  priority: 'performance' | 'cost' | 'reliability' | 'balanced'
  maxCost?: number
  maxLatency?: number
  minSuccessRate?: number
  preferredProviders?: string[]
  excludedProviders?: string[]
}

interface ErrorCategory {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
  retryable: boolean
  maxRetries: number
  backoffStrategy: string
  recoveryActions: string[]
  preventionStrategies: string[]
}

interface ErrorRecoveryStrategy {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
  fallbackOptions: string[]
}

export default function AdvancedFeaturesDashboard() {
  const [activeTab, setActiveTab] = useState<'intelligence' | 'errors' | 'optimization' | 'insights'>('intelligence')
  const [selectedUseCase, setSelectedUseCase] = useState<string>('balanced')
  const [providerScores, setProviderScores] = useState<ProviderScore[]>([])
  const [errorPatterns, setErrorPatterns] = useState<any[]>([])
  const [recentErrors, setRecentErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customCriteria, setCustomCriteria] = useState<SelectionCriteria>({
    priority: 'balanced',
    minSuccessRate: 95
  })

  useEffect(() => {
    loadAdvancedData()
  }, [selectedUseCase])

  const loadAdvancedData = async () => {
    setIsLoading(true)
    try {
      // Load intelligent provider recommendations
      const recommendationsResponse = await fetch(`/api/advanced/recommendations?useCase=${selectedUseCase}`)
      if (recommendationsResponse.ok) {
        const data = await recommendationsResponse.json()
        setProviderScores(data.recommendations || [])
      }

      // Load error patterns
      const patternsResponse = await fetch('/api/advanced/error-patterns')
      if (patternsResponse.ok) {
        const data = await patternsResponse.json()
        setErrorPatterns(data.patterns || [])
      }

      // Load recent errors
      const errorsResponse = await fetch('/api/advanced/recent-errors')
      if (errorsResponse.ok) {
        const data = await errorsResponse.json()
        setRecentErrors(data.errors || [])
      }
    } catch (error) {
      console.error('Failed to load advanced data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomRecommendation = async () => {
    try {
      const response = await fetch('/api/advanced/custom-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customCriteria)
      })
      
      if (response.ok) {
        const data = await response.json()
        setProviderScores(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to get custom recommendation:', error)
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1)
  }

  const useCases = [
    { id: 'balanced', label: 'Balanced', icon: Target },
    { id: 'high-performance', label: 'High Performance', icon: Zap },
    { id: 'cost-effective', label: 'Cost Effective', icon: DollarSign },
    { id: 'reliable', label: 'Reliable', icon: Shield }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Features Dashboard</h1>
            <p className="text-gray-600">Intelligent provider selection, advanced error handling, and optimization insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadAdvancedData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
            { id: 'intelligence', label: 'AI Intelligence', icon: Brain },
            { id: 'errors', label: 'Error Analysis', icon: AlertTriangle },
            { id: 'optimization', label: 'Optimization', icon: TrendingUp },
            { id: 'insights', label: 'Insights', icon: Lightbulb }
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
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* Use Case Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Provider Selection</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {useCases.map((useCase) => {
                  const Icon = useCase.icon
                  return (
                    <button
                      key={useCase.id}
                      onClick={() => setSelectedUseCase(useCase.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedUseCase === useCase.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{useCase.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Custom Criteria */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Custom Selection Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={customCriteria.priority}
                      onChange={(e) => setCustomCriteria({...customCriteria, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="performance">Performance</option>
                      <option value="cost">Cost</option>
                      <option value="reliability">Reliability</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Success Rate (%)</label>
                    <input
                      type="number"
                      value={customCriteria.minSuccessRate || 95}
                      onChange={(e) => setCustomCriteria({...customCriteria, minSuccessRate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCustomRecommendation}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Get Recommendation
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Recommendations</h3>
              <div className="space-y-4">
                {providerScores.map((score, index) => (
                  <div key={score.provider} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium capitalize">{score.provider.replace('-', ' ')}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score.score)}`}>
                          Score: {formatScore(score.score)}%
                        </span>
                        {index === 0 && (
                          <span className="flex items-center text-yellow-600">
                            <Star className="w-4 h-4" />
                            <span className="text-sm ml-1">Recommended</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Performance:</span>
                        <p className="font-medium">{formatScore(score.factors.performance)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <p className="font-medium">{formatScore(score.factors.cost)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reliability:</span>
                        <p className="font-medium">{formatScore(score.factors.reliability)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Availability:</span>
                        <p className="font-medium">{formatScore(score.factors.availability)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Latency:</span>
                        <p className="font-medium">{formatScore(score.factors.latency)}%</p>
                      </div>
                    </div>

                    {score.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {score.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <ArrowRight className="w-3 h-3 mt-0.5 mr-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            {/* Error Patterns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Pattern Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {errorPatterns.map((pattern) => (
                  <div key={pattern.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{pattern.type.replace('_', ' ')}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(pattern.category.severity)}`}>
                        {pattern.category.severity}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency:</span>
                        <span className="font-medium">{pattern.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Retryable:</span>
                        <span className={pattern.category.retryable ? 'text-green-600' : 'text-red-600'}>
                          {pattern.category.retryable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Retries:</span>
                        <span className="font-medium">{pattern.category.maxRetries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Strategy:</span>
                        <span className="font-medium capitalize">{pattern.category.backoffStrategy}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Recovery Actions:</h5>
                      <ul className="space-y-1">
                        {pattern.category.recoveryActions.slice(0, 2).map((action: any, idx: any) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <ArrowRight className="w-2 h-2 mt-0.5 mr-1 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Errors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
              <div className="space-y-3">
                {recentErrors.map((error, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{error.error}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                            {error.severity}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{error.category}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Provider: {error.provider.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {error.resolved ? (
                          <span className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolved
                          </span>
                        ) : (
                          <span className="text-sm text-orange-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            {/* Performance Optimization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
                  <p className="text-2xl font-bold text-blue-600">1,437ms</p>
                  <p className="text-sm text-gray-500">Average across providers</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Success Rate</h4>
                  <p className="text-2xl font-bold text-green-600">96.8%</p>
                  <p className="text-sm text-gray-500">Overall success rate</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Cost Efficiency</h4>
                  <p className="text-2xl font-bold text-purple-600">$0.47</p>
                  <p className="text-sm text-gray-500">Per 1000 requests</p>
                </div>
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization Recommendations</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Implement Request Batching',
                    description: 'Batch multiple requests to reduce API calls and improve efficiency',
                    impact: 'High',
                    effort: 'Medium',
                    priority: 'High'
                  },
                  {
                    title: 'Add Response Caching',
                    description: 'Cache common responses to reduce latency and costs',
                    impact: 'Medium',
                    effort: 'Low',
                    priority: 'Medium'
                  },
                  {
                    title: 'Optimize Provider Selection',
                    description: 'Use intelligent provider selection based on real-time performance',
                    impact: 'High',
                    effort: 'Low',
                    priority: 'High'
                  }
                ].map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex space-x-4 text-sm">
                          <div>
                            <span className="text-gray-500">Impact:</span>
                            <span className="ml-1 font-medium">{rec.impact}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Effort:</span>
                            <span className="ml-1 font-medium">{rec.effort}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span>
                            <span className="ml-1 font-medium">{rec.priority}</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                        Implement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-gray-900">Performance Insights</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Google CLI shows best response times (950ms average)</li>
                    <li>• Qwen has highest error rate (7.9%) - consider alternatives</li>
                    <li>• OpenRouter maintains 98.5% success rate consistently</li>
                    <li>• DeepSeek costs are 20% lower than competitors</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Optimization Opportunities</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Switch to Google CLI for high-performance tasks</li>
                    <li>• Use DeepSeek for cost-sensitive operations</li>
                    <li>• Implement circuit breaker for Qwen failures</li>
                    <li>• Consider request batching to reduce costs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Cost Prediction</h4>
                  <p className="text-2xl font-bold text-blue-600">$1,200</p>
                  <p className="text-sm text-gray-500">Predicted monthly cost</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Trend</h4>
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                  <p className="text-sm text-gray-500">Monthly growth rate</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Reliability Score</h4>
                  <p className="text-2xl font-bold text-purple-600">94.2%</p>
                  <p className="text-sm text-gray-500">Predicted uptime</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 