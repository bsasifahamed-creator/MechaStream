'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Code, 
  BookOpen, 
  Lightbulb, 
  Package,
  ExternalLink,
  Copy,
  Star,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface SearchResult {
  title: string
  url: string
  snippet: string
  code?: string
  content?: string
  source: string
  stars?: number
  language?: string
  votes?: number
  answers?: number
  downloads?: string
  version?: string
}

export default function WebSearch() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('code')
  const [language, setLanguage] = useState('javascript')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showCode, setShowCode] = useState<{ [key: number]: boolean }>({})

  const searchTypes = [
    { id: 'code', label: 'Code Examples', icon: Code },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
    { id: 'solutions', label: 'Solutions', icon: Lightbulb },
    { id: 'libraries', label: 'Libraries', icon: Package }
  ]

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'react', label: 'React' },
    { id: 'python', label: 'Python' },
    { id: 'nodejs', label: 'Node.js' }
  ]

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
          language
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const toggleCodeVisibility = (index: number) => {
    setShowCode(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <Search className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold">Web Search & Code Discovery</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Search for code examples, documentation, and solutions from across the web to help build your app.
        </p>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for code examples, libraries, or solutions..."
                className="input-field w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {/* Search Options */}
          <div className="flex flex-wrap gap-4">
            {/* Search Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <div className="flex space-x-2">
                {searchTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSearchType(type.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchType === type.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </h3>

          {results.map((result, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {result.title}
                  </h4>
                  <p className="text-gray-600 mb-2">{result.snippet}</p>
                  
                  {/* Source Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{result.source}</span>
                    </span>
                    
                    {result.stars && (
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{result.stars.toLocaleString()}</span>
                      </span>
                    )}
                    
                    {result.votes && (
                      <span className="flex items-center space-x-1">
                        <span>↑ {result.votes}</span>
                      </span>
                    )}
                    
                    {result.downloads && (
                      <span className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{result.downloads}</span>
                      </span>
                    )}
                    
                    {result.version && (
                      <span className="flex items-center space-x-1">
                        <span>v{result.version}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.code && (
                    <button
                      onClick={() => toggleCodeVisibility(index)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      {showCode[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showCode[index] ? 'Hide' : 'Show'} Code</span>
                    </button>
                  )}
                  
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
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
                      onClick={() => handleCopyCode(result.code!)}
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

              {/* Content Display */}
              {result.content && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{result.content}</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isSearching && results.length === 0 && query && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or search type to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
} 