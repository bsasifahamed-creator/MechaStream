'use client'

import React, { useState } from 'react'
import { 
  Upload, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Copy,
  Download,
  GitBranch,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'github-pages' | 'custom'
  domain?: string
  environment?: 'production' | 'preview'
  buildCommand?: string
  outputDirectory?: string
}

interface DeploymentStatus {
  id: string
  status: 'pending' | 'building' | 'deployed' | 'failed'
  url?: string
  createdAt: Date
  updatedAt: Date
  logs?: string[]
}

interface DeploymentManagerProps {
  projectId: string
  projectName: string
  code: string
  dependencies: string[]
  onDeploy?: (status: DeploymentStatus) => void
}

const DeploymentManager: React.FC<DeploymentManagerProps> = ({
  projectId,
  projectName,
  code,
  dependencies,
  onDeploy
}) => {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null)
  const [config, setConfig] = useState<DeploymentConfig>({
    platform: 'vercel',
    environment: 'production',
    buildCommand: 'npm run build',
    outputDirectory: 'dist'
  })

  const platforms = [
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deploy to Vercel with automatic builds',
      icon: Zap,
      color: 'bg-black text-white'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Deploy to Netlify with form handling',
      icon: Globe,
      color: 'bg-green-600 text-white'
    },
    {
      id: 'github-pages',
      name: 'GitHub Pages',
      description: 'Deploy to GitHub Pages for free',
      icon: GitBranch,
      color: 'bg-gray-800 text-white'
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Deploy to your own server',
      icon: Settings,
      color: 'bg-gray-600 text-white'
    }
  ]

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploymentStatus({
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectName,
          code,
          dependencies,
          config
        })
      })

      if (!response.ok) {
        throw new Error('Deployment failed')
      }

      const result = await response.json()
      
      const status: DeploymentStatus = {
        id: result.deploymentId,
        status: 'building',
        url: result.url,
        createdAt: new Date(),
        updatedAt: new Date(),
        logs: result.logs || []
      }

      setDeploymentStatus(status)
      onDeploy?.(status)
      toast.success('Deployment started!')

      // Poll for status updates
      pollDeploymentStatus(result.deploymentId)

    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus({
        id: Date.now().toString(),
        status: 'failed',
        createdAt: new Date(),
        updatedAt: new Date(),
        logs: [error instanceof Error ? error.message : 'Deployment failed']
      })
      toast.error('Deployment failed')
    } finally {
      setIsDeploying(false)
    }
  }

  const pollDeploymentStatus = async (deploymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/deploy/${deploymentId}`)
        if (response.ok) {
          const status = await response.json()
          setDeploymentStatus(status)
          
          if (status.status === 'deployed' || status.status === 'failed') {
            clearInterval(pollInterval)
            if (status.status === 'deployed') {
              toast.success('Deployment successful!')
            } else {
              toast.error('Deployment failed')
            }
          }
        }
      } catch (error) {
        console.error('Error polling deployment status:', error)
      }
    }, 2000)

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 5 * 60 * 1000)
  }

  const getStatusIcon = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
      case 'building':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
    }
  }

  const getStatusColor = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'building':
        return 'bg-blue-100 text-blue-800'
      case 'deployed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyDeploymentUrl = () => {
    if (deploymentStatus?.url) {
      navigator.clipboard.writeText(deploymentStatus.url)
      toast.success('URL copied to clipboard!')
    }
  }

  const downloadProject = () => {
    const projectData = {
      name: projectName,
      code,
      dependencies,
      packageJson: {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        dependencies: dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.0.0',
          'vite': '^4.0.0'
        }
      },
      viteConfig: {
        plugins: ['@vitejs/plugin-react'],
        build: {
          outDir: 'dist'
        }
      }
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Project downloaded!')
  }

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Platform</h3>
        <div className="grid grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <button
                key={platform.id}
                onClick={() => setConfig(prev => ({ ...prev, platform: platform.id as any }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.platform === platform.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${platform.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-sm text-gray-500">{platform.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain (optional)
            </label>
            <input
              type="text"
              value={config.domain || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="my-app.vercel.app"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={config.environment}
              onChange={(e) => setConfig(prev => ({ ...prev, environment: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="production">Production</option>
              <option value="preview">Preview</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Build Command
            </label>
            <input
              type="text"
              value={config.buildCommand}
              onChange={(e) => setConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Directory
            </label>
            <input
              type="text"
              value={config.outputDirectory}
              onChange={(e) => setConfig(prev => ({ ...prev, outputDirectory: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Deploy Button */}
      <div>
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Deploy to {platforms.find(p => p.id === config.platform)?.name}</span>
            </>
          )}
        </button>
      </div>

      {/* Deployment Status */}
      {deploymentStatus && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(deploymentStatus.status)}
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(deploymentStatus.status)}`}>
                {deploymentStatus.status.charAt(0).toUpperCase() + deploymentStatus.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {deploymentStatus.url && (
                <>
                  <button
                    onClick={copyDeploymentUrl}
                    className="p-1 text-gray-600 hover:text-gray-800"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={deploymentStatus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-600 hover:text-gray-800"
                    title="Open deployment"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          </div>

          {deploymentStatus.logs && deploymentStatus.logs.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Build Logs</h4>
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {deploymentStatus.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Project */}
      <div className="border-t pt-4">
        <button
          onClick={downloadProject}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Project</span>
        </button>
      </div>
    </div>
  )
}

export default DeploymentManager 