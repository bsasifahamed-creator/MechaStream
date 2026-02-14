'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  model?: 'groq' | 'gemini' | 'openai'
  responseTime?: number
}

export default function MechaStreamChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm MechaStream, your fast and smart AI assistant. I use Groq AI for instant responses and can fallback to more powerful models for complex questions. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      model: 'groq'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
        model: data.model,
        responseTime
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        model: 'groq'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getModelBadge = (model?: string, responseTime?: number) => {
    if (!model) return null

    const modelConfig = {
      groq: { name: 'Groq AI', color: 'bg-green-100 text-green-800', icon: '⚡' },
      gemini: { name: 'Gemini', color: 'bg-blue-100 text-blue-800', icon: '🧠' },
      openai: { name: 'GPT-4', color: 'bg-purple-100 text-purple-800', icon: '🤖' }
    }

    const config = modelConfig[model as keyof typeof modelConfig]
    if (!config) return null

    return (
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.icon} {config.name}
        </span>
        {responseTime && (
          <span className="text-xs text-gray-500">
            {responseTime}ms
          </span>
        )}
      </div>
    )
  }

  const handleRating = async (messageId: string, rating: 'up' | 'down') => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, rating }),
      })
      // You could update the UI to show the rating was recorded
    } catch (error) {
      console.error('Error recording feedback:', error)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-600 to-cyan-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div className="text-2xl text-cyan-300">〰️</div>
            <div>
              <h2 className="text-2xl font-bold">MechaStream Chat</h2>
              <p className="text-cyan-100">Fast responses with intelligent fallback</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {!message.isUser && (
                <div className="flex items-center justify-between">
                  {getModelBadge(message.model, message.responseTime)}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleRating(message.id, 'up')}
                      className="text-gray-500 hover:text-green-600 transition-colors"
                      title="Good response"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleRating(message.id, 'down')}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Poor response"
                    >
                      👎
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t p-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '→'
            )}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Powered by Groq AI with smart fallback to ChatGPT/Gemini
          </p>
        </div>
      </div>
    </div>
  )
}