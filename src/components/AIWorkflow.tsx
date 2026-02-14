'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Sparkles, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Star, 
  Lightbulb, 
  Brain 
} from 'lucide-react'

interface SearchResult {
  title: string
  url: string
  snippet: string
  code?: string
  source: string
  stars?: number
  language?: string
}

interface AIWorkflowProps {
  searchResults: any[]
  isSearching: boolean
  isGenerating: boolean
  generatedCode: string
  onCopyCode: (code: string) => void
  enableWebSearch: boolean
  fallbackMethod?: string
  fallbackProvider?: string
}

export default function AIWorkflow({
  searchResults,
  isSearching,
  isGenerating,
  generatedCode,
  onCopyCode,
  enableWebSearch = true,
  fallbackMethod,
  fallbackProvider
}: AIWorkflowProps) {
  const [showCode, setShowCode] = useState<{ [key: number]: boolean }>({})
  const [showGeneratedCode, setShowGeneratedCode] = useState(false)

  const toggleCodeVisibility = (index: number) => {
    setShowCode(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleGeneratedCode = () => {
    setShowGeneratedCode(!showGeneratedCode)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Workflow</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Intelligent code generation with web search</span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {/* Step 1: Search (only if web search is enabled) */}
        {enableWebSearch && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              {isSearching ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Step 1: Intelligent Code Search</h3>
              <p className="text-blue-700 text-sm">
                {isSearching 
                  ? 'Searching for relevant code examples and patterns...'
                  : `Found ${searchResults.length} relevant code examples from web sources`
                }
              </p>
            </div>
            {!isSearching && searchResults.length > 0 && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </motion.div>
        )}

        {/* Step 2: AI Generation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: enableWebSearch ? 0.2 : 0 }}
          className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg"
        >
          <div className="flex-shrink-0">
            {isGenerating ? (
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900">
              {enableWebSearch ? 'Step 2: AI-Powered Code Generation' : 'AI-Powered Code Generation'}
            </h3>
            <p className="text-purple-700 text-sm">
              {isGenerating 
                ? enableWebSearch 
                  ? 'Combining search results with AI to generate optimal code...'
                  : 'Generating code using AI...'
                : enableWebSearch
                  ? 'Generated intelligent code solution using web patterns and AI'
                  : 'Generated code using AI generation'
              }
            </p>
          </div>
          {!isGenerating && generatedCode && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </motion.div>
      </div>

      {/* Search Results */}
      {enableWebSearch && searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Code Examples Found</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {searchResults.length} results
            </span>
          </div>

          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {result.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">{result.snippet}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>{result.source}</span>
                      </span>
                      
                      {result.stars && (
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{result.stars.toLocaleString()}</span>
                        </span>
                      )}
                      
                      {result.language && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {result.language}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {result.code && (
                      <button
                        onClick={() => toggleCodeVisibility(index)}
                        className="btn-secondary text-xs flex items-center space-x-1"
                      >
                        {showCode[index] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showCode[index] ? 'Hide' : 'Show'} Code</span>
                      </button>
                    )}
                    
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Visit</span>
                    </a>
                  </div>
                </div>

                {/* Code Display */}
                {result.code && showCode[index] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <button
                        onClick={() => onCopyCode(result.code!)}
                        className="absolute top-2 right-2 btn-secondary text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{result.code}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Generated Code */}
      {generatedCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">AI-Generated Solution</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                enableWebSearch 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {enableWebSearch 
                  ? `Enhanced with ${searchResults.length} patterns`
                  : 'AI Generation Only'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleGeneratedCode}
                className="btn-secondary flex items-center space-x-2"
              >
                {showGeneratedCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showGeneratedCode ? 'Hide' : 'Show'} Code</span>
              </button>
              
              <button
                onClick={() => onCopyCode(generatedCode)}
                className="btn-primary flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </button>
            </div>
          </div>

          {showGeneratedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">AI Insights</h4>
            <p className="text-blue-700 text-sm">
              {enableWebSearch && searchResults.length > 0 
                ? fallbackMethod === 'search-results-only'
                  ? `Generated code directly from ${searchResults.length} web search results due to API credit limits. The code combines the best patterns found online.`
                  : `AI analyzed ${searchResults.length} code examples and combined the best patterns to create this solution.`
                : 'AI generated this code using advanced patterns and best practices.'
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isSearching && !isGenerating && searchResults.length === 0 && !generatedCode && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {enableWebSearch ? 'Ready to Generate' : 'Ready for AI Generation'}
          </h3>
          <p className="text-gray-500">
            {enableWebSearch 
              ? 'Enter a prompt to start the intelligent workflow that searches for code examples and generates optimal solutions.'
              : 'Enter a prompt to generate code using AI only.'
            }
          </p>
        </div>
      )}
    </div>
  )
} 