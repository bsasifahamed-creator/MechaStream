'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink,
  Shield,
  Activity,
  Zap,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface ProviderConfig {
  name: string
  apiKey: string
  baseURL: string
  models: string[]
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  priority: number
  enabled: boolean
  lastUsed?: Date
  successRate?: number
  averageResponseTime?: number
  totalRequests?: number
  failedRequests?: number
}

interface ProviderStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: Date
  responseTime: number
  error?: string
  available: boolean
}

interface ProviderUsage {
  provider: string
  requests: number
  tokens: number
  cost: number
  errors: number
  lastUsed: Date
}

export default function APISettingsDashboard() {
  const [activeTab, setActiveTab] = useState<'providers' | 'health' | 'analytics' | 'settings'>('providers')
  const [showKeys, setShowKeys] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<ProviderConfig[]>([])
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([])
  const [usageStats, setUsageStats] = useState<ProviderUsage[]>([])
  const [apiKeys, setApiKeys] = useState({
    openrouter: '',
    deepseek: '',
    qwen: '',
    'google-cli': ''
  })

  // Load initial data
  useEffect(() => {
    loadProviders()
    loadHealthStatus()
    loadUsageStats()
    loadApiKeys()
  }, [])

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setProviderStatuses(data.statuses || [])
      }
    } catch (error) {
      console.error('Failed to load health status:', error)
    }
  }

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data.usage || [])
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    }
  }

  const loadApiKeys = () => {
    // In a real app, this would load from secure storage
    const keys = {
      openrouter: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
      deepseek: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
      qwen: process.env.NEXT_PUBLIC_QWEN_API_KEY || '',
      'google-cli': process.env.NEXT_PUBLIC_GOOGLE_CLI_API_KEY || ''
    }
    setApiKeys(keys)
  }

  const handleSaveKeys = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would save to secure storage
      console.log('Saving API keys...')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('API keys saved successfully!')
    } catch (error) {
      alert('Failed to save API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestProvider = async (providerName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName })
      })
      
      if (response.ok) {
        alert(`${providerName} test successful!`)
      } else {
        const error = await response.json()
        alert(`Test failed: ${error.message}`)
      }
    } catch (error) {
      alert(`Test failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    alert('API key copied to clipboard!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCost = (cost: number) => {
    return `$${(cost / 100).toFixed(2)}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Settings Dashboard</h1>
        <p className="text-gray-600">Manage your AI providers, monitor health, and track usage</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'providers', label: 'Providers', icon: Settings },
            { id: 'health', label: 'Health Monitor', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Shield }
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
        {activeTab === 'providers' && (
          <div className="space-y-6">
            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {providers.map((provider) => {
                const status = providerStatuses.find(s => s.name === provider.name)
                return (
                  <div key={provider.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {provider.name.replace('-', ' ')}
                      </h3>
                      {status && getStatusIcon(status.status)}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status?.status || 'unknown')}`}>
                          {status?.status || 'unknown'}
                        </span>
                      </div>
                      
                      {status?.responseTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Response Time</span>
                          <span className="text-sm font-medium">{status.responseTime}ms</span>
                        </div>
                      )}
                      
                      {provider.successRate !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Success Rate</span>
                          <span className="text-sm font-medium">{provider.successRate.toFixed(1)}%</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Priority</span>
                        <span className="text-sm font-medium">{provider.priority}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleTestProvider(provider.name)}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* API Keys Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
              <div className="space-y-4">
                {Object.entries(apiKeys).map(([provider, key]) => (
                  <div key={provider} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {provider.replace('-', ' ')} API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys ? 'text' : 'password'}
                          value={key}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter ${provider} API key`}
                        />
                        <button
                          onClick={() => handleCopyKey(key)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`https://${provider}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowKeys(!showKeys)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    {showKeys ? 'Hide' : 'Show'} Keys
                  </button>
                  <button
                    onClick={handleSaveKeys}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Keys'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* System Health Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {providerStatuses.map((status) => (
                  <div key={status.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(status.status)}
                    <div>
                      <p className="font-medium capitalize">{status.name.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-500">{status.responseTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Health Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Health Status</h3>
              <div className="space-y-4">
                {providerStatuses.map((status) => (
                  <div key={status.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{status.name.replace('-', ' ')}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status.status)}`}>
                        {status.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Response Time:</span>
                        <p className="font-medium">{status.responseTime}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Check:</span>
                        <p className="font-medium">{formatDate(status.lastCheck)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Available:</span>
                        <p className="font-medium">{status.available ? 'Yes' : 'No'}</p>
                      </div>
                      {status.error && (
                        <div className="col-span-2 md:col-span-4">
                          <span className="text-gray-500">Error:</span>
                          <p className="font-medium text-red-600">{status.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.reduce((sum, stat) => sum + stat.requests, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.reduce((sum, stat) => sum + stat.tokens, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCost(usageStats.reduce((sum, stat) => sum + stat.cost, 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Errors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.reduce((sum, stat) => sum + stat.errors, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Usage Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Usage Details</h3>
              <div className="space-y-4">
                {usageStats.map((stat) => (
                  <div key={stat.provider} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{stat.provider.replace('-', ' ')}</h4>
                      <span className="text-sm text-gray-500">Last used: {formatDate(stat.lastUsed)}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Requests:</span>
                        <p className="font-medium">{stat.requests}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tokens:</span>
                        <p className="font-medium">{stat.tokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <p className="font-medium">{formatCost(stat.cost)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Errors:</span>
                        <p className="font-medium">{stat.errors}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Check Interval (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-switch"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-switch" className="ml-2 block text-sm text-gray-900">
                    Auto-switch providers on failure
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                    Enable error notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 