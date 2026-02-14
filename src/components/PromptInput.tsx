'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, Globe, Sparkles, Zap } from 'lucide-react'

interface PromptInputProps {
  onSubmit: (prompt: string, enableWebSearch: boolean) => void
  isGenerating: boolean
  enableWebSearch: boolean
  onToggleWebSearch: (enabled: boolean) => void
}

export default function PromptInput({ onSubmit, isGenerating, enableWebSearch, onToggleWebSearch }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt.trim(), enableWebSearch)
      setPrompt('')
    }
  }

  const examples = [
    'Create a React todo app with drag and drop',
    'Build a responsive navigation menu',
    'Make a contact form with validation',
    'Create a dark mode toggle component',
    'Build a search filter component',
    'Make a carousel/slider component'
  ]

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Prompt</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>•</span>
              <span>Describe your app in natural language</span>
              <span>•</span>
              <span>AI will generate the code for you</span>
            </div>
          </div>
          
          {/* Web Search Toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Web Search</span>
            </div>
            <button
              onClick={() => onToggleWebSearch(!enableWebSearch)}
              disabled={isGenerating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                enableWebSearch ? 'bg-primary-600' : 'bg-gray-200'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableWebSearch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Search className="w-3 h-3" />
              <span>{enableWebSearch ? 'ON' : 'OFF'}</span>
              {isGenerating && <span className="text-orange-500">(disabled)</span>}
            </div>
          </div>
        </div>

        {/* Web Search Info */}
        {enableWebSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <Search className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <span className="font-medium">Web Search Enabled:</span> AI will search for relevant code examples and combine them with generation for better results.
              </div>
            </div>
          </motion.div>
        )}

        {/* Prompt Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build... (e.g., 'Create a React todo app with drag and drop functionality')"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-3 top-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <Zap className="w-4 h-4" />
                <span>Quick Examples</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Press Enter to generate</span>
              <span>•</span>
              <span>Web search: {enableWebSearch ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          {/* Examples */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </motion.div>
          )}
        </form>

        {/* Status Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Generation</span>
            </div>
            {enableWebSearch && (
              <div className="flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span>Web Search</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Powered by multiple AI providers</span>
            <span>•</span>
            <span>Real-time preview</span>
          </div>
        </div>
      </div>
    </div>
  )
} 