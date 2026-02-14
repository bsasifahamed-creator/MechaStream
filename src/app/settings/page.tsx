'use client'

import { useState } from 'react'

export default function Settings() {
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('javascript')
  const [fontSize, setFontSize] = useState('14')
  const [autoSave, setAutoSave] = useState(true)
  const [aiAssistance, setAiAssistance] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [vibeMode, setVibeMode] = useState(false)

  const themes = [
    { id: 'dark', name: 'Dark Mode', icon: '🌙' },
    { id: 'light', name: 'Light Mode', icon: '☀️' },
    { id: 'auto', name: 'Auto', icon: '🌓' },
  ]

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'vue', name: 'Vue.js', icon: '💚' },
  ]

  const fontSizes = ['12', '14', '16', '18', '20']

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            MechaStream
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Settings
          </h2>
          <p className="text-gray-300">
            Customize your AI-powered coding experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              💻 Editor Settings
            </h3>
            
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map(themeOption => (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        theme === themeOption.id
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{themeOption.icon}</div>
                      <div className="text-sm font-medium">{themeOption.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Default Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {fontSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        fontSize === size
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Save</div>
                    <div className="text-sm text-gray-600">Automatically save your work</div>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSave ? 'bg-cyan-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-gray-800 border border-gray-700 transition-transform ${
                        autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Vibe Mode</div>
                    <div className="text-sm text-gray-600">Distraction-free coding experience</div>
                  </div>
                  <button
                    onClick={() => setVibeMode(!vibeMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      vibeMode ? 'bg-cyan-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-gray-800 border border-gray-700 transition-transform ${
                        vibeMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI & Features */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              🤖 AI & Features
            </h3>
            
            <div className="space-y-6">
              {/* AI Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">AI Code Assistance</div>
                    <div className="text-sm text-gray-600">Get AI-powered code suggestions</div>
                  </div>
                  <button
                    onClick={() => setAiAssistance(!aiAssistance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiAssistance ? 'bg-cyan-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-gray-800 border border-gray-700 transition-transform ${
                        aiAssistance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-gray-600">Receive updates and alerts</div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-cyan-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-gray-800 border border-gray-700 transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* AI Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  AI Model Preference
                </label>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <div>
                          <div className="font-medium">Groq (Fast)</div>
                          <div className="text-sm text-gray-600">0.2s response time</div>
                        </div>
                      </div>
                      <input type="radio" name="aiModel" defaultChecked className="text-cyan-600" />
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧠</span>
                        <div>
                          <div className="font-medium">GPT-4 (Smart)</div>
                          <div className="text-sm text-gray-600">Advanced reasoning</div>
                        </div>
                      </div>
                      <input type="radio" name="aiModel" className="text-cyan-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Performance Mode
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                  <option>⚡ High Performance</option>
                  <option>⚖️ Balanced</option>
                  <option>🔋 Battery Saver</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              👤 Account Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue="developer@mechastream"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="developer@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan
                </label>
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cyan-800">Pro Developer</div>
                      <div className="text-sm text-cyan-600">Unlimited projects & AI assistance</div>
                    </div>
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 border-2 border-red-100">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 text-red-600">
              ⚠️ Danger Zone
            </h3>
            
            <div className="space-y-4">
              <button className="w-full p-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Reset All Settings
              </button>
              <button className="w-full p-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Clear All Projects
              </button>
              <button className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}