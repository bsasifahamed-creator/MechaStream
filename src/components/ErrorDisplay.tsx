'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertCircle, 
  XCircle, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Copy,
  Clock,
  Zap,
  Shield
} from 'lucide-react'

interface ApiError {
  provider: string
  type: 'auth' | 'rate_limit' | 'model' | 'network' | 'service' | 'unknown'
  message: string
  statusCode?: number
  timestamp: Date
  context?: {
    requestId?: string
    model?: string
    endpoint?: string
    userAgent?: string
    ip?: string
    sessionId?: string
  }
  retryable: boolean
  recoveryStrategy: {
    action: 'retry' | 'switch_provider' | 'fallback' | 'user_notification' | 'none'
    delay?: number
    maxRetries?: number
    provider?: string
    message?: string
    suggestion?: string
  }
}

interface ErrorLog {
  id: string
  error: ApiError
  resolved: boolean
  resolutionTime?: Date
  resolutionStrategy?: string
}

export default function ErrorDisplay() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)

  useEffect(() => {
    loadRecentErrors()
  }, [])

  const loadRecentErrors = async () => {
    try {
      const response = await fetch('/api/errors/recent')
      if (response.ok) {
        const data = await response.json()
        setErrors(data.errors || [])
      }
    } catch (error) {
      console.error('Failed to load errors:', error)
    }
  }

  const handleRetry = async (errorId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/errors/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId })
      })
      
      if (response.ok) {
        alert('Retry initiated successfully!')
        loadRecentErrors() // Refresh the list
      } else {
        alert('Failed to retry')
      }
    } catch (error) {
      alert('Failed to retry')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async (errorId: string) => {
    try {
      const response = await fetch('/api/errors/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId })
      })
      
      if (response.ok) {
        alert('Error marked as resolved!')
        loadRecentErrors() // Refresh the list
      } else {
        alert('Failed to resolve error')
      }
    } catch (error) {
      alert('Failed to resolve error')
    }
  }

  const handleCopyError = (error: ApiError) => {
    const errorText = `Provider: ${error.provider}\nType: ${error.type}\nMessage: ${error.message}\nTimestamp: ${new Date(error.timestamp).toLocaleString()}`
    navigator.clipboard.writeText(errorText)
    alert('Error details copied to clipboard!')
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <Shield className="w-5 h-5 text-red-500" />
      case 'rate_limit':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'model':
        return <Settings className="w-5 h-5 text-blue-500" />
      case 'network':
        return <Zap className="w-5 h-5 text-orange-500" />
      case 'service':
        return <AlertCircle className="w-5 h-5 text-purple-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'auth':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'rate_limit':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'model':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'service':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getErrorTitle = (type: string) => {
    switch (type) {
      case 'auth':
        return 'Authentication Error'
      case 'rate_limit':
        return 'Rate Limit Exceeded'
      case 'model':
        return 'Model Not Available'
      case 'network':
        return 'Network Error'
      case 'service':
        return 'Service Error'
      default:
        return 'Unknown Error'
    }
  }

  const getRecoveryAction = (strategy: any) => {
    switch (strategy.action) {
      case 'retry':
        return 'Retry Request'
      case 'switch_provider':
        return 'Switch Provider'
      case 'fallback':
        return 'Use Fallback'
      case 'user_notification':
        return 'Check Settings'
      default:
        return 'Manual Action Required'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const unresolvedErrors = errors.filter(error => !error.resolved)
  const resolvedErrors = errors.filter(error => error.resolved)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Management</h1>
        <p className="text-gray-600">Monitor and resolve API errors with intelligent recovery suggestions</p>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{errors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unresolved</p>
              <p className="text-2xl font-bold text-gray-900">{unresolvedErrors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedErrors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Retryable</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors.filter(e => e.error.retryable).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unresolved Errors */}
      {unresolvedErrors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Unresolved Errors</h2>
          <div className="space-y-4">
            {unresolvedErrors.map((errorLog) => (
              <div key={errorLog.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getErrorIcon(errorLog.error.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {getErrorTitle(errorLog.error.type)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getErrorColor(errorLog.error.type)}`}>
                          {errorLog.error.provider}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{errorLog.error.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(errorLog.error.timestamp)}</span>
                        {errorLog.error.retryable && (
                          <span className="text-blue-600">Retryable</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedError(errorLog)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleCopyError(errorLog.error)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Recovery Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {errorLog.error.recoveryStrategy.message}
                      </p>
                      <p className="text-sm text-gray-600">
                        {errorLog.error.recoveryStrategy.suggestion}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {errorLog.error.retryable && (
                        <button
                          onClick={() => handleRetry(errorLog.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Retrying...' : getRecoveryAction(errorLog.error.recoveryStrategy)}
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(errorLog.id)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Errors */}
      {resolvedErrors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Resolved Errors</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showDetails && (
            <div className="space-y-4">
              {resolvedErrors.map((errorLog) => (
                <div key={errorLog.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {getErrorTitle(errorLog.error.type)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Resolved {errorLog.resolutionTime && formatDate(errorLog.resolutionTime)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{errorLog.error.message}</p>
                      {errorLog.resolutionStrategy && (
                        <p className="text-sm text-gray-500 mt-1">
                          Resolution: {errorLog.resolutionStrategy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Error Details</h3>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Error Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium capitalize">{selectedError.error.provider.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedError.error.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Code:</span>
                      <span className="font-medium">{selectedError.error.statusCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retryable:</span>
                      <span className="font-medium">{selectedError.error.retryable ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="font-medium">{formatDate(selectedError.error.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Error Message</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{selectedError.error.message}</p>
                  </div>
                </div>
                
                {selectedError.error.context && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      {selectedError.error.context.requestId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Request ID:</span>
                          <span className="font-mono">{selectedError.error.context.requestId}</span>
                        </div>
                      )}
                      {selectedError.error.context.model && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{selectedError.error.context.model}</span>
                        </div>
                      )}
                      {selectedError.error.context.endpoint && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endpoint:</span>
                          <span className="font-mono text-xs">{selectedError.error.context.endpoint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recovery Strategy</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 mb-2">{selectedError.error.recoveryStrategy.message}</p>
                    <p className="text-blue-700 text-sm">{selectedError.error.recoveryStrategy.suggestion}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCopyError(selectedError.error)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Copy Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 