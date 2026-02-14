'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { 
  Eye, 
  Palette, 
  Moon, 
  Sun, 
  Package, 
  Settings,
  RefreshCw,
  Play,
  Square,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LivePreviewBuilderProps {
  initialCode?: string
  onCodeChange?: (code: string) => void
  onSave?: (code: string, settings: any) => void
}

const defaultCode = `export default function App() {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', {
    style: {
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'Hello from Live Preview!'),
    React.createElement('p', { key: 'count' }, \`Count: \${count}\`),
    React.createElement('button', {
      key: 'button',
      onClick: () => setCount(count + 1),
      style: {
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px'
      }
    }, 'Increment')
  ]);
}`

const LivePreviewBuilder: React.FC<LivePreviewBuilderProps> = ({
  initialCode = defaultCode,
  onCodeChange,
  onSave
}) => {
  const [code, setCode] = useState(initialCode)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [darkMode, setDarkMode] = useState(false)
  const [deps, setDeps] = useState(['react', 'react-dom'])
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [logs, setLogs] = useState<Array<{ level: string; message: string; timestamp: Date }>>([])
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Debounced update function
  const postUpdate = useCallback(
    debounce(() => {
      if (!iframeRef.current || !isPreviewReady) return
      
      setIsUpdating(true)
      iframeRef.current.contentWindow?.postMessage(
        {
          code,
          deps: deps.filter(d => d.trim()),
          settings: {
            backgroundColor,
            darkMode,
          },
        },
        '*'
      )
    }, 300),
    [code, deps, backgroundColor, darkMode, isPreviewReady]
  )

  // Trigger update when relevant state changes
  useEffect(() => {
    if (isPreviewReady) {
      postUpdate()
    }
  }, [code, deps, backgroundColor, darkMode, postUpdate, isPreviewReady])

  // Setup iframe and message handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, level, message, error, success } = event.data

      switch (type) {
        case 'preview-loaded':
          setIsPreviewReady(true)
          break
        case 'preview-ready':
          setIsUpdating(false)
          break
        case 'preview-error':
          setIsUpdating(false)
          toast.error(`Preview error: ${error}`)
          break
        case 'console':
          setLogs(prev => [...prev, {
            level,
            message,
            timestamp: new Date()
          }].slice(-50)) // Keep last 50 logs
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Setup iframe reload on mount
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '/preview.html?' + Date.now()
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
    if (!darkMode) {
      setBackgroundColor('#1e1e1e')
    } else {
      setBackgroundColor('#ffffff')
    }
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleDepsChange = (value: string) => {
    const newDeps = value
      .split(',')
      .map(d => d.trim())
      .filter(Boolean)
    setDeps(newDeps)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '🔴'
      case 'warn':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600'
      case 'warn':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Live Preview Builder</h1>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">
                {isPreviewReady ? 'Preview Ready' : 'Loading Preview...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button
              onClick={() => onSave?.(code, { backgroundColor, darkMode, deps })}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Editor and Controls */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Controls */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-8 p-0 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dependencies
                </label>
                <input
                  type="text"
                  value={deps.join(', ')}
                  onChange={(e) => handleDepsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="react, react-dom, lodash"
                />
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                scrollBeyondLastLine: false,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: {
                  enabled: true
                }
              }}
            />
          </div>
        </div>

        {/* Right Panel - Preview and Logs */}
        <div className="w-1/2 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                {isUpdating && (
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                Updates in ~300ms after typing stops
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              title="live-preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              src="/preview.html"
            />
            
            {/* Loading overlay */}
            {!isPreviewReady && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-gray-600">Loading preview...</span>
                </div>
              </div>
            )}
          </div>

          {/* Console Logs */}
          <div className="bg-gray-900 text-gray-100 h-48 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Console</span>
                {logs.length > 0 && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {logs.length}
                  </span>
                )}
              </div>
              
              <button
                onClick={clearLogs}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="mx-2">{getLogIcon(log.level)}</span>
                    <span className={getLogColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default LivePreviewBuilder 