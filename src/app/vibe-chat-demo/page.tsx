'use client'

import React, { useState } from 'react'
import VibeChatInterface from '@/components/VibeChatInterface'

interface Message {
  id: string
  text: string
  attachments: any[]
  timestamp: Date
  sender: 'user' | 'bot'
}

const VibeChatDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. Try out the new chat interface with attachments, voice input, and more!",
      attachments: [],
      timestamp: new Date(0),
      sender: 'bot'
    }
  ])

  const handleSendMessage = (text: string, attachments: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      attachments,
      timestamp: new Date(0),
      sender: 'user'
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${text}"${attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''}`,
        attachments: [],
        timestamp: new Date(0),
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleFilesSelected = (files: any[]) => {
    console.log('Files selected:', files)
  }

  const handleSpeechResult = (text: string) => {
    console.log('Speech result:', text)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vibe Chat Interface Demo</h1>
          <p className="text-gray-400">
            Experience the new chat interface with attachments, voice input, and modern UI
          </p>
        </div>

        {/* Chat container */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.attachments.length > 0 && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.attachments.length} attachment(s)
                    </div>
                  )}
                  <div className="text-xs opacity-50 mt-1">
                   {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat interface */}
          <VibeChatInterface
            onSendMessage={handleSendMessage}
            onFilesSelected={handleFilesSelected}
            onSpeechResult={handleSpeechResult}
            placeholder="Type your message or use voice input..."
          />
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 Perfect Alignment</h3>
            <p className="text-gray-400 text-sm">
              Send button and tool icons are perfectly aligned with the input field, with consistent spacing and no floating misalignment.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎨 Rounded UI</h3>
            <p className="text-gray-400 text-sm">
              Smooth rounded corners throughout the interface with a modern dark theme and subtle shadows for depth.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📎 File Attachments</h3>
            <p className="text-gray-400 text-sm">
              Support for images, documents, and folders with drag-and-drop, preview thumbnails, and easy removal.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎤 Voice Input</h3>
            <p className="text-gray-400 text-sm">
              Speech-to-text using Web Speech API with visual feedback, live transcription, and keyboard shortcuts.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">♿ Accessibility</h3>
            <p className="text-gray-400 text-sm">
              Full keyboard navigation, ARIA labels, focus indicators, and screen reader support for all interactive elements.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📱 Responsive</h3>
            <p className="text-gray-400 text-sm">
              Works perfectly on mobile devices with adaptive layouts, touch-friendly buttons, and graceful scaling.
            </p>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⌨️ Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Enter</kbd>
              <span className="text-gray-400">Send message</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Shift + M</kbd>
              <span className="text-gray-400">Toggle voice recording</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd>
              <span className="text-gray-400">Send message</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift + Enter</kbd>
              <span className="text-gray-400">New line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VibeChatDemo 