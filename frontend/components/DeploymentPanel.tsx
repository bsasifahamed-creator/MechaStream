'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Play, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Download,
  Share2,
  Zap,
  Database,
  Shield,
  Clock,
  Users
} from 'lucide-react'

interface DeploymentPanelProps {
  code: string
  projectName: string
}

export default function DeploymentPanel({ code, projectName }: DeploymentPanelProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [selectedPlatform, setSelectedPlatform] = useState('replit')
  const [deploymentUrl, setDeploymentUrl] = useState('')

  const platforms = [
    {
      id: 'replit',
      name: 'Replit',
      description: 'Instant deployment with free hosting',
      icon: '🚀',
      features: ['Free hosting', 'Custom domain', 'Database included', 'HTTPS enabled'],
      status: 'connected'
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deploy to Vercel with Git integration',
      icon: '⚡',
      features: ['Git integration', 'Automatic deployments', 'Edge functions', 'Analytics'],
      status: 'available'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Deploy to Netlify with form handling',
      icon: '🌐',
      features: ['Form handling', 'CDN', 'Functions', 'Forms'],
      status: 'available'
    },
    {
      id: 'github-pages',
      name: 'GitHub Pages',
      description: 'Deploy to GitHub Pages',
      icon: '📚',
      features: ['Free hosting', 'Git integration', 'Custom domain', 'HTTPS'],
      status: 'available'
    }
  ]

  const deploymentSteps = [
    { id: 1, name: 'Build Project', status: 'pending' },
    { id: 2, name: 'Install Dependencies', status: 'pending' },
    { id: 3, name: 'Configure Database', status: 'pending' },
    { id: 4, name: 'Deploy to Platform', status: 'pending' },
    { id: 5, name: 'Setup Domain', status: 'pending' }
  ]

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploymentStatus('deploying')
    
    // Simulate deployment process
    for (let i = 0; i < deploymentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Update step status
    }
    
    // Simulate successful deployment
    await new Promise(resolve => setTimeout(resolve, 2000))
    setDeploymentStatus('success')
    setDeploymentUrl('https://my-ai-app.replit.co')
    setIsDeploying(false)
  }

  const handleShare = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Deploy Your App</h1>
        <p className="text-gray-600">Choose a platform and deploy your AI-generated app with one click</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Selection */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Choose Deployment Platform</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      platform.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  
                  <div className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Configuration */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Deployment Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  className="input-field"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="your-app.com"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable HTTPS</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-deploy on changes</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable analytics</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="space-y-6">
          {/* Deploy Button */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Deploy</h3>
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !code}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isDeploying ? (
                <>
                  <div className="loading-spinner" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Deploy to {platforms.find(p => p.id === selectedPlatform)?.name}</span>
                </>
              )}
            </button>
            
            {deploymentUrl && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Deployed Successfully!</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-800 flex items-center space-x-1 mt-2"
                >
                  <span>{deploymentUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Deployment Progress */}
          {isDeploying && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Deployment Progress</h3>
              <div className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.id}
                    </div>
                    <span className="text-sm text-gray-700">{step.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Built-in database</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">SSL certificate</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Global CDN</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">Collaboration tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 