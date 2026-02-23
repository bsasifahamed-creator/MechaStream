'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Search, Brain, Copy, Camera, Image, BookOpen, Zap, Globe, Lightbulb, Wrench, Settings, Plus, ChevronDown, ChevronUp, Share, MoreHorizontal, Mic, Paperclip } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isTyping?: boolean
}

interface FeatureToggle {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

const ChatbotUIChatGPT: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(0)
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    },
    {
      id: 'create-image',
      name: 'Create Image',
      description: 'Generate images from descriptions',
      icon: <Image className="w-4 h-4" />,
      enabled: false
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
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
          prompt: input,
          operation: 'generate',
          features: enabledFeatures
        })
      })

      const data = await response.json()
      
      let botResponseText = ''
      
      if (data.code) {
        botResponseText = `${data.explanation}\n\n\`\`\`jsx\n${data.code}\n\`\`\``
        
        if (data.suggestions && data.suggestions.length > 0) {
          botResponseText += '\n\n**Suggestions:**\n'
          data.suggestions.forEach((suggestion: string) => {
            botResponseText += `• ${suggestion}\n`
          })
        }
      } else {
        botResponseText = data.explanation || 'I can help you with that! What would you like to create or learn about?'
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(0)
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-900">ChatGPT</h1>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-green-500' 
                  : 'bg-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className={`rounded-lg px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                <div className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-green-100' : 'text-gray-400'
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
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Tools Panel */}
          {showTools && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Tools</h3>
                <button
                  onClick={() => setShowTools(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        feature.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
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
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message ChatGPT..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTools(!showTools)}
                className={`p-2 rounded-lg transition-colors ${
                  showTools 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Tools"
              >
                <Wrench className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            ChatGPT can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotUIChatGPT 