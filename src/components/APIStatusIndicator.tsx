'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Activity,
  Settings
} from 'lucide-react'

interface ProviderStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: Date
  responseTime: number
  error?: string
  available: boolean
}

interface SystemHealth {
  healthy: number
  degraded: number
  down: number
  total: number
  averageResponseTime: number
}

export default function APIStatusIndicator() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    healthy: 0,
    degraded: 0,
    down: 0,
    total: 0,
    averageResponseTime: 0
  })
  const [currentProvider, setCurrentProvider] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadHealthStatus()
    loadCurrentProvider()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadHealthStatus()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setProviderStatuses(data.statuses || [])
        
        // Calculate system health
        const health = calculateSystemHealth(data.statuses || [])
        setSystemHealth(health)
      }
    } catch (error) {
      console.error('Failed to load health status:', error)
    }
  }

  const loadCurrentProvider = async () => {
    try {
      const response = await fetch('/api/providers/current')
      if (response.ok) {
        const data = await response.json()
        setCurrentProvider(data.currentProvider)
      }
    } catch (error) {
      console.error('Failed to load current provider:', error)
    }
  }

  const calculateSystemHealth = (statuses: ProviderStatus[]): SystemHealth => {
    const counts = statuses.reduce((acc, status) => {
      acc[status.status] = (acc[status.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalResponseTime = statuses.reduce((sum, status) => sum + status.responseTime, 0)
    const averageResponseTime = statuses.length > 0 ? totalResponseTime / statuses.length : 0

    return {
      healthy: counts.healthy || 0,
      degraded: counts.degraded || 0,
      down: counts.down || 0,
      total: statuses.length,
      averageResponseTime
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await loadHealthStatus()
    setIsLoading(false)
  }

  const handleProviderSwitch = async (providerName: string) => {
    try {
      const response = await fetch('/api/providers/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName })
      })
      
      if (response.ok) {
        setCurrentProvider(providerName)
        alert(`Switched to ${providerName}`)
      } else {
        alert('Failed to switch provider')
      }
    } catch (error) {
      alert('Failed to switch provider')
    }
  }

  const getOverallStatus = () => {
    if (systemHealth.down > 0) return 'down'
    if (systemHealth.degraded > 0) return 'degraded'
    if (systemHealth.healthy > 0) return 'healthy'
    return 'unknown'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'down':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational'
      case 'degraded':
        return 'Some Issues Detected'
      case 'down':
        return 'Systems Down'
      default:
        return 'Status Unknown'
    }
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="relative">
      {/* Main Status Indicator */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          {getStatusIcon(overallStatus)}
          <span className="text-sm font-medium">API Status</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Expanded Status Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Health Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Status */}
            <div className="mb-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(overallStatus)}
                <span className="font-medium">{getStatusText(overallStatus)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {systemHealth.healthy} healthy, {systemHealth.degraded} degraded, {systemHealth.down} down
              </div>
              {systemHealth.averageResponseTime > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Avg response: {systemHealth.averageResponseTime.toFixed(0)}ms
                </div>
              )}
            </div>

            {/* Current Provider */}
            {currentProvider && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-900">Current Provider</span>
                    <p className="text-sm text-blue-700 capitalize">{currentProvider.replace('-', ' ')}</p>
                  </div>
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}

            {/* Provider Status List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Provider Status</h4>
              {providerStatuses.map((status) => (
                <div key={status.name} className="flex items-center justify-between p-2 rounded border border-gray-100">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium capitalize">{status.name.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{status.responseTime}ms</span>
                    <button
                      onClick={() => handleProviderSwitch(status.name)}
                      disabled={!status.available}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Switch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => window.open('/api-settings', '_blank')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Settings className="w-3 h-3" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Status Badge (when collapsed) */}
      {!isExpanded && (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(overallStatus)}`}>
          {systemHealth.healthy}/{systemHealth.total}
        </div>
      )}
    </div>
  )
} 