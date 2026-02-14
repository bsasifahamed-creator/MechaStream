'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Search, Brain, Copy, Camera, Image, BookOpen, Zap, Globe, Lightbulb, Search as Telescope, PenTool, Settings, Plus } from 'lucide-react'

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

const ChatbotUIAdvanced: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "What can I help with?",
      sender: 'bot',
      timestamp: new Date(0)
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [features, setFeatures] = useState<FeatureToggle[]>([
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for real-time information',
      icon: <Globe className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'agent-mode',
      name: 'Agent Mode',
      description: 'Advanced AI agent with memory and reasoning',
      icon: <Brain className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'clone-website',
      name: 'Clone Website',
      description: 'Analyze and recreate website structure',
      icon: <Copy className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'think-longer',
      name: 'Think Longer',
      description: 'Deep analysis with extended reasoning',
      icon: <Lightbulb className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'deep-research',
      name: 'Deep Research',
      description: 'Comprehensive research and analysis',
      icon: <Telescope className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'study-learn',
      name: 'Study & Learn',
      description: 'Educational content and explanations',
      icon: <BookOpen className="w-5 h-5" />,
      enabled: false
    },
    {
      id: 'create-image',
      name: 'Create Image',
      description: 'Generate images from descriptions',
      icon: <Image className="w-5 h-5" />,
      enabled: false
    }
  ])

  const quickActions = [
    { label: 'Camera', icon: <Camera className="w-5 h-5" />, action: () => handleCamera() },
    { label: 'Photos', icon: <Image className="w-5 h-5" />, action: () => handlePhotos() },
    { label: 'Files', icon: <Copy className="w-5 h-5" />, action: () => handleFiles() }
  ]

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

  const handleCamera = () => {
    // Camera functionality
    console.log('Camera activated')
  }

  const handlePhotos = () => {
    // Photos functionality
    console.log('Photos accessed')
  }

  const handleFiles = () => {
    // Files functionality
    console.log('Files accessed')
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <button className="p-2 text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Get Plus</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowFeatures(!showFeatures)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Prompt Area */}
        <div className="bg-gray-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">What can I help with?</h1>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-900 p-4">
          <div className="flex justify-center space-x-4 mb-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center space-y-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="text-white">
                  {action.icon}
                </div>
                <span className="text-xs text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Feature Toggles */}
          {showFeatures && (
            <div className="space-y-3 mb-6">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-purple-400">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{feature.name}</div>
                      <div className="text-xs text-gray-400">{feature.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feature.enabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feature.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-64">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-purple-600' 
                      : 'bg-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                    <div className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-700 rounded-2xl px-4 py-2">
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
          <div className="mt-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-white placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotUIAdvanced 