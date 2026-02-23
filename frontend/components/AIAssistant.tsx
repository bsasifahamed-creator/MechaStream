'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Search, Brain, Copy, Camera, Image, BookOpen, Zap, Globe, Lightbulb, Wrench, Settings, Plus, ChevronDown, ChevronUp, Share, MoreHorizontal, Mic, Paperclip, Sparkles, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isTyping?: boolean
  code?: string
  suggestions?: string[]
}

interface FeatureToggle {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface AIAssistantProps {
  onCodeGenerated: (code: string) => void
  onSuggestionApplied: (suggestion: string) => void
  currentCode?: string
  projectContext?: string
  initialPrompt?: string | null
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  onCodeGenerated,
  onSuggestionApplied,
  currentCode = '',
  projectContext = '',
  initialPrompt = null
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you with your code today?",
      sender: 'bot',
      timestamp: new Date(0)
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false)

  const [features, setFeatures] = useState<FeatureToggle[]>([
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for real-time information',
      icon: <Globe className="w-4 h-4" />,
      enabled: false
    },
    {
      id: 'agent-mode',
      name: 'Agent Mode',
      description: 'Advanced AI agent with memory and reasoning',
      icon: <Brain className="w-4 h-4" />,
      enabled: false
    },
    {
      id: 'clone-website',
      name: 'Clone Website',
      description: 'Analyze and recreate website structure',
      icon: <Copy className="w-4 h-4" />,
      enabled: false
    },
    {
      id: 'think-longer',
      name: 'Think Longer',
      description: 'Deep analysis with extended reasoning',
      icon: <Lightbulb className="w-4 h-4" />,
      enabled: false
    },
    {
      id: 'deep-research',
      name: 'Deep Research',
      description: 'Comprehensive research and analysis',
      icon: <Search className="w-4 h-4" />,
      enabled: false
    },
    {
      id: 'study-learn',
      name: 'Study & Learn',
      description: 'Educational content and explanations',
      icon: <BookOpen className="w-4 h-4" />,
      enabled: false
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle initial prompt from homepage redirect
  useEffect(() => {
    if (initialPrompt && !hasProcessedInitialPrompt) {
      setInput(initialPrompt)
      setHasProcessedInitialPrompt(true)
      
      // Auto-send the prompt after a short delay
      setTimeout(() => {
        handleSendWithPrompt(initialPrompt)
      }, 500)
    }
  }, [initialPrompt, hasProcessedInitialPrompt])

  const handleSendWithPrompt = async (promptText: string) => {
    if (!promptText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: promptText,
      sender: 'user',
      timestamp: new Date(0)
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const enabledFeatures = features.filter(f => f.enabled).map(f => f.id)
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          operation: 'generate',
          features: enabledFeatures,
          currentCode,
          context: projectContext
        })
      })

      const data = await response.json()
      
      let botResponseText = ''
      
      if (!response.ok) {
        botResponseText = data.error || `Request failed (${response.status}). Make sure Ollama is running (ollama serve) and try again.`
      } else if (data.code) {
        // Check if the code contains multiple files (has markdown code blocks)
        if (data.code.includes('```') && (data.code.includes('html') || data.code.includes('css') || data.code.includes('javascript'))) {
          // Multi-file response - display as is
          botResponseText = `${data.explanation}\n\n${data.code}`
          console.log('Multi-file response detected');
        } else {
          // Single file response - wrap in code block
          botResponseText = `${data.explanation}\n\n\`\`\`jsx\n${data.code}\n\`\`\``
          console.log('Single file response detected');
        }
        
        console.log('AI Response preview:', data.code.substring(0, 200));
        
        if (data.suggestions && data.suggestions.length > 0) {
          botResponseText += '\n\n**Suggestions:**\n'
          data.suggestions.forEach((suggestion: string) => {
            botResponseText += `• ${suggestion}\n`
          })
        }

        // Apply the generated code
        onCodeGenerated(data.code)
        toast.success('Code generated and applied!')
      } else {
        botResponseText = data.explanation || 'I can help you with that! What would you like to create or learn about?'
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(0),
        code: data.code,
        suggestions: data.suggestions
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(0)
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    await handleSendWithPrompt(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ))
  }

  const applySuggestion = (suggestion: string) => {
    onSuggestionApplied(suggestion)
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
        <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
        </div>
      </div>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 border border-gray-600'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className={`rounded-2xl px-6 py-4 shadow-lg max-w-md ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
              
              {message.code && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Generated Code
                      </span>
                    <button
                      onClick={() => copyCode(message.code!)}
                        className="text-xs text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto border border-gray-700 shadow-inner">
                    {message.code}
                  </pre>
                </div>
              )}

              {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold mb-3 text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      Suggestions
                    </p>
                    <div className="space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(suggestion)}
                          className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        • {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
                
                <div className={`text-xs mt-3 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-700 border border-gray-600 shadow-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-300" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-6 py-4 shadow-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <div className="flex space-x-1">
                    <span className="text-sm text-gray-300">AI is thinking</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tools Panel */}
          {showTools && (
            <div className="mb-6 p-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  Tools
                </h3>
                <button
                  onClick={() => setShowTools(false)}
                  className="text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-700 rounded-lg text-gray-300">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{feature.name}</div>
                        <div className="text-xs text-gray-400">{feature.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        feature.enabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          feature.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
            placeholder="Ask me to create components, add features, or improve your code..."
                  className="w-full px-6 py-4 pr-16 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm bg-gray-700 text-white placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '120px' }}
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-xl transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-xl transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTools(!showTools)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  showTools 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                }`}
                title="Tools"
              >
                <Wrench className="w-5 h-5" />
              </button>
              
          <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="w-5 h-5" />
          </button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400 text-center">
            AI Assistant can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant 