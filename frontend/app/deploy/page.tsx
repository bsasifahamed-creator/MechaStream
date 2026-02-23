'use client'

import { useState } from 'react'

export default function Deploy() {
  const [selectedProject, setSelectedProject] = useState('current-project')
  const [selectedPlatform, setSelectedPlatform] = useState('vercel')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'building' | 'deploying' | 'success' | 'error'>('idle')

  const projects = [
    { id: 'current-project', name: 'Current Project', description: 'React App with AI features', lastModified: '2 minutes ago' },
    { id: 'portfolio-site', name: 'Portfolio Site', description: 'Personal portfolio website', lastModified: '1 hour ago' },
    { id: 'dashboard-app', name: 'Dashboard App', description: 'Analytics dashboard', lastModified: '3 hours ago' },
    { id: 'ecommerce-store', name: 'E-commerce Store', description: 'Online shopping platform', lastModified: '1 day ago' },
  ]

  const platforms = [
    { 
      id: 'vercel', 
      name: 'Vercel', 
      icon: '▲', 
      description: 'Frontend cloud platform',
      buildTime: '~2 minutes',
      pricing: 'Free tier available'
    },
    { 
      id: 'netlify', 
      name: 'Netlify', 
      icon: '🌐', 
      description: 'Modern web development platform',
      buildTime: '~3 minutes',
      pricing: 'Free tier available'
    },
    { 
      id: 'github-pages', 
      name: 'GitHub Pages', 
      icon: '🐙', 
      description: 'Static site hosting',
      buildTime: '~5 minutes',
      pricing: 'Free for public repos'
    },
    { 
      id: 'aws', 
      name: 'AWS S3', 
      icon: '☁️', 
      description: 'Amazon Web Services',
      buildTime: '~4 minutes',
      pricing: 'Pay as you go'
    },
  ]

  const deploymentLogs = [
    '[14:32:01] Starting deployment process...',
    '[14:32:02] Preparing build environment',
    '[14:32:05] Installing dependencies',
    '[14:32:15] Building application',
    '[14:32:45] Optimizing assets',
    '[14:32:50] Uploading to platform',
    '[14:33:10] Deployment successful!',
  ]

  const handleDeploy = () => {
    setIsDeploying(true)
    setDeploymentStatus('building')
    
    // Simulate deployment process
    setTimeout(() => setDeploymentStatus('deploying'), 2000)
    setTimeout(() => {
      setDeploymentStatus('success')
      setIsDeploying(false)
    }, 5000)
  }

  const getStatusColor = (status: typeof deploymentStatus) => {
    switch (status) {
      case 'building': return 'text-yellow-400 bg-yellow-900/20'
      case 'deploying': return 'text-blue-400 bg-blue-900/20'
      case 'success': return 'text-green-400 bg-green-900/20'
      case 'error': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            MechaStream
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Deploy
          </h2>
          <p className="text-gray-300">
            Deploy your applications to the cloud with one click
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Selection */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📁 Select Project
            </h3>
            <div className="space-y-3">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedProject === project.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-600">{project.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Modified {project.lastModified}</div>
                </button>
              ))}
            </div>

            {/* Project Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Project Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Files:</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">12.4 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Framework:</span>
                  <span className="font-medium">React</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build Tool:</span>
                  <span className="font-medium">Vite</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🚀 Deployment Platform
            </h3>
            <div className="space-y-3">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedPlatform === platform.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <div className="font-medium text-gray-900">{platform.name}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{platform.description}</div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Build: {platform.buildTime}</span>
                    <span>{platform.pricing}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Environment Variables */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Environment Variables</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="KEY"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="VALUE"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <button className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    +
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Add environment variables for your deployment
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Control */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              ⚡ Deployment Control
            </h3>
            
            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deploymentStatus)}`}>
                  {deploymentStatus === 'idle' ? 'Ready' : 
                   deploymentStatus === 'building' ? 'Building...' :
                   deploymentStatus === 'deploying' ? 'Deploying...' :
                   deploymentStatus === 'success' ? 'Deployed' : 'Error'}
                </span>
              </div>
              
              {deploymentStatus === 'success' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800 font-medium">Deployment Successful!</div>
                  <div className="text-sm text-green-600 mt-1">
                    Live at: <a href="#" className="underline">https://your-app.vercel.app</a>
                  </div>
                </div>
              )}
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                isDeploying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {isDeploying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deploying...
                </div>
              ) : (
                '🚀 Deploy Now'
              )}
            </button>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                📋 Preview Build
              </button>
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                📊 View Analytics
              </button>
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                🔧 Custom Domain
              </button>
            </div>

            {/* Recent Deployments */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Recent Deployments</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <div className="font-medium">v1.2.3</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Live</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <div className="font-medium">v1.2.2</div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Previous</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Logs */}
        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📝 Deployment Logs
          </h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {deploymentLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            {isDeploying && (
              <div className="animate-pulse">
                {deploymentStatus === 'building' && '[14:33:15] Building application...'}
                {deploymentStatus === 'deploying' && '[14:33:45] Uploading to platform...'}
              </div>
            )}
          </div>
        </div>

        {/* Deployment Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-cyan-600">12</div>
            <div className="text-sm text-gray-600">Total Deployments</div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-green-600">2.3s</div>
            <div className="text-sm text-gray-600">Avg Build Time</div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600">98.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Global Regions</div>
          </div>
        </div>

        {/* Deployment Tips */}
        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            💡 Deployment Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Before Deploying</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test your application locally</li>
                <li>• Check for console errors</li>
                <li>• Optimize images and assets</li>
                <li>• Set up environment variables</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use semantic versioning</li>
                <li>• Enable automatic deployments</li>
                <li>• Monitor performance metrics</li>
                <li>• Set up custom domains</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}