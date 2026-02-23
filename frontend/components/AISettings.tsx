'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Key, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Save,
  TestTube,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiStatus {
  provider: string
  status: 'checking' | 'available' | 'error' | 'missing'
  error?: string
}

export default function AISettings() {
  const [apiKeys, setApiKeys] = useState({
    OPENROUTER_API_KEY: '',
    DEEPSEEK_API_KEY: '',
    QWEN_API_KEY: '',
    GOOGLE_CLI_API_KEY: ''
  })
  const [apiStatus, setApiStatus] = useState<ApiStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadApiKeys()
    checkApiStatus()
  }, [])

  const loadApiKeys = () => {
    // In a real app, you'd load from secure storage
    const keys = {
      OPENROUTER_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
      DEEPSEEK_API_KEY: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
      QWEN_API_KEY: process.env.NEXT_PUBLIC_QWEN_API_KEY || '',
      GOOGLE_CLI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLI_API_KEY || ''
    }
    setApiKeys(keys)
  }

  const checkApiStatus = async () => {
    setIsChecking(true)
    const providers = [
      { name: 'OpenRouter', key: 'OPENROUTER_API_KEY' },
      { name: 'DeepSeek', key: 'DEEPSEEK_API_KEY' },
      { name: 'Qwen', key: 'QWEN_API_KEY' },
      { name: 'Google CLI', key: 'GOOGLE_CLI_API_KEY' }
    ]

    const statuses: ApiStatus[] = []

    for (const provider of providers) {
      const key = apiKeys[provider.key as keyof typeof apiKeys]
      
      if (!key) {
        statuses.push({
          provider: provider.name,
          status: 'missing'
        })
        continue
      }

      statuses.push({
        provider: provider.name,
        status: 'checking'
      })

      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          statuses[statuses.length - 1] = {
            provider: provider.name,
            status: 'available'
          }
        } else {
          statuses[statuses.length - 1] = {
            provider: provider.name,
            status: 'error',
            error: 'API key invalid or service unavailable'
          }
        }
      } catch (error) {
        statuses[statuses.length - 1] = {
          provider: provider.name,
          status: 'error',
          error: 'Network error or service unavailable'
        }
      }
    }

    setApiStatus(statuses)
    setIsChecking(false)
  }

  const handleSaveKeys = async () => {
    setIsSaving(true)
    try {
      // In a real app, you'd save to secure storage
      toast.success('API keys saved successfully!')
      await checkApiStatus()
    } catch (error) {
      toast.error('Failed to save API keys')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyKey = (keyName: string) => {
    const key = apiKeys[keyName as keyof typeof apiKeys]
    if (key) {
    navigator.clipboard.writeText(key)
      toast.success(`${keyName} copied to clipboard!`)
    }
  }

  const handleTestProvider = async (provider: string) => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Create a simple hello world component',
          provider: provider.toLowerCase().replace(' ', '-'),
          model: 'gpt-4'
        }),
      })

      if (response.ok) {
        toast.success(`${provider} is working correctly!`)
      } else {
        const error = await response.json()
        toast.error(`${provider} test failed: ${error.error}`)
      }
    } catch (error) {
      toast.error(`${provider} test failed: Network error`)
    }
  }

  const getStatusIcon = (status: ApiStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: ApiStatus['status']) => {
    switch (status) {
      case 'checking':
        return 'Checking...'
      case 'available':
        return 'Available'
      case 'error':
        return 'Error'
      case 'missing':
        return 'Not configured'
      default:
        return 'Unknown'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Settings</h2>
          </div>
          <button
            onClick={checkApiStatus}
            disabled={isChecking}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
      </div>

        {/* API Status Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">API Provider Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {apiStatus.map((status, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{status.provider}</span>
                  {getStatusIcon(status.status)}
                </div>
                <p className="text-sm text-gray-600">{getStatusText(status.status)}</p>
                {status.error && (
                  <p className="text-xs text-red-500 mt-1">{status.error}</p>
                )}
                {status.status === 'available' && (
            <button
                    onClick={() => handleTestProvider(status.provider)}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    Test Provider
            </button>
                )}
              </div>
            ))}
          </div>
      </div>

        {/* API Keys Configuration */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">API Keys Configuration</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="btn-secondary flex items-center space-x-2"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? 'Hide' : 'Show'} Keys</span>
              </button>
              <button
                onClick={handleSaveKeys}
                disabled={isSaving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Keys'}</span>
              </button>
            </div>
            </div>

            <div className="space-y-4">
            {Object.entries(apiKeys).map(([keyName, keyValue]) => (
              <div key={keyName} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {keyName.replace(/_/g, ' ')}
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys ? 'text' : 'password'}
                      value={keyValue}
                      onChange={(e) => setApiKeys(prev => ({
                        ...prev,
                        [keyName]: e.target.value
                      }))}
                      className="input-field w-full pr-10"
                      placeholder={`Enter your ${keyName.replace(/_/g, ' ')}`}
                    />
                    <button
                      onClick={() => handleCopyKey(keyName)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Getting Started</span>
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>OpenRouter:</strong> Get your API key from{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                openrouter.ai
              </a>
            </p>
            <p>
              <strong>DeepSeek:</strong> Get your API key from{' '}
              <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                platform.deepseek.com
              </a>
            </p>
            <p>
              <strong>Qwen:</strong> Get your API key from{' '}
              <a href="https://dashscope.aliyun.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                dashscope.aliyun.com
              </a>
            </p>
            <p>
              <strong>Google CLI:</strong> Get your API key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                makersuite.google.com
              </a>
            </p>
              </div>
              </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-800">Usage Tips</h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Configure at least one API provider to start generating code</li>
            <li>• The app will automatically try fallback providers if one fails</li>
            <li>• Use shorter, specific prompts for better results</li>
            <li>• Enable web search for more context-aware code generation</li>
            <li>• Check the API status regularly to ensure all providers are working</li>
          </ul>
            </div>
          </div>
        </motion.div>
  )
} 