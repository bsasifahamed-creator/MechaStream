'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, X, FileText, Image, Folder, Code, Palette, Rocket, Settings, Zap, Globe, Database } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  attachments?: FileAttachment[]
}

interface FileAttachment {
  id: string
  file: File
  type: 'image' | 'document' | 'folder'
  preview?: string
}

interface Tool {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  action: () => void
}

const ChatGPTStyleInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. I can help you build websites, create code, design interfaces, and much more. What would you like to work on today?",
      sender: 'assistant',
      timestamp: new Date(0)
    }
  ])
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const tools: Tool[] = [
    {
      id: 'web-search',
      name: 'Web Search',
      icon: <Globe className="w-5 h-5" />,
      description: 'Search the web for real-time information',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setSelectedTool('web-search')
    },
    {
      id: 'agent-mode',
      name: 'Agent Mode',
      icon: <Zap className="w-5 h-5" />,
      description: 'Enable AI agent with autonomous capabilities',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => setSelectedTool('agent-mode')
    },
    {
      id: 'code-gen',
      name: 'Code Generator',
      icon: <Code className="w-5 h-5" />,
      description: 'Generate code for any language or framework',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setSelectedTool('code-gen')
    },
    {
      id: 'ui-designer',
      name: 'UI Designer',
      icon: <Palette className="w-5 h-5" />,
      description: 'Create beautiful user interfaces',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => setSelectedTool('ui-designer')
    },
    {
      id: 'deploy',
      name: 'Deploy App',
      icon: <Rocket className="w-5 h-5" />,
      description: 'Deploy your application to the web',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => setSelectedTool('deploy')
    },
    {
      id: 'api-builder',
      name: 'API Builder',
      icon: <Database className="w-5 h-5" />,
      description: 'Build and test APIs',
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => setSelectedTool('api-builder')
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configure your preferences',
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => setSelectedTool('settings')
    }
  ]

  const handleSendMessage = async () => {
    if (!inputText.trim() && attachments.length === 0) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(0),
      attachments: [...attachments]
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setAttachments([])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you're looking to build something amazing! I can help you create web applications, APIs, and more. What specific project would you like to work on?",
        "That's a great idea! I can generate the code for you. Would you like me to create a full-stack application with modern UI/UX design?",
        "I can help you build that. Let me create a complete project structure with all the necessary files. Just give me a moment...",
        "Perfect! I'll generate a modern, responsive application for you. The code will include proper styling, animations, and best practices.",
        "Great choice! I'll create an application with a beautiful design system, smooth animations, and excellent user experience."
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'assistant',
        timestamp: new Date(0)
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (files: FileList | null, type: 'file' | 'folder') => {
    if (!files) return

    Array.from(files).forEach(file => {
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        file,
        type: type === 'folder' ? 'folder' : file.type.startsWith('image/') ? 'image' : 'document'
      }
      setAttachments(prev => [...prev, attachment])
    })
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) return

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />
    }
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="flex flex-col h-full bg-mono-black">
      {/* Header */}
      <div className="bg-mono-sidebar-bg border-b border-mono-border-grey px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-mono-accent-blue to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-mono-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-semibold text-mono-white">MechaStream AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-mono-medium-grey mr-2">Tools:</span>
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-mono-accent-blue text-mono-white border border-mono-accent-blue'
                    : 'text-mono-medium-grey hover:bg-mono-light-grey border border-mono-border-grey'
                }`}
                title={tool.description}
              >
                {tool.icon}
                <span className="text-sm font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-mono-accent-blue text-mono-white'
                  : 'bg-mono-sidebar-bg border border-mono-border-grey text-mono-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-mono-light-grey rounded-lg">
                        {attachment.preview ? (
                          <img src={attachment.preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                        ) : (
                          getFileIcon(attachment.file.type)
                        )}
                        <span className="text-xs truncate text-mono-black">{attachment.file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-xs text-mono-medium-grey mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-mono-sidebar-bg border border-mono-border-grey rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-mono-medium-grey rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-mono-medium-grey rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-mono-medium-grey rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-mono-sidebar-bg border-t border-mono-border-grey px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center space-x-2 bg-mono-light-grey rounded-lg px-3 py-2">
                  {attachment.preview ? (
                    <img src={attachment.preview} alt="Preview" className="w-6 h-6 object-cover rounded" />
                  ) : (
                    getFileIcon(attachment.file.type)
                  )}
                  <span className="text-sm text-mono-black truncate max-w-32">{attachment.file.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-mono-medium-grey hover:text-mono-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end space-x-3 bg-mono-light-grey border border-mono-border-grey rounded-2xl px-4 py-3 focus-within:border-mono-accent-blue focus-within:ring-1 focus-within:ring-mono-accent-blue">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message MechaStream AI..."
                className="w-full resize-none border-none outline-none text-black placeholder-gray-500 bg-mono-light-grey"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
            </div>

            <div className="flex items-center space-x-2">
              {/* File Attachment */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-mono-medium-grey hover:text-mono-white transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Folder Selection */}
              <button
                onClick={() => folderInputRef.current?.click()}
                className="p-2 text-mono-medium-grey hover:text-mono-white transition-colors"
                title="Select folder"
              >
                <Folder className="w-5 h-5" />
              </button>

              {/* Voice Input */}
              <button
                onClick={toggleRecording}
                className={`p-2 transition-colors ${
                  isRecording
                    ? 'text-red-500 animate-pulse'
                    : 'text-mono-medium-grey hover:text-mono-white'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  inputText.trim() || attachments.length > 0
                    ? 'bg-mono-accent-blue text-mono-white hover:bg-mono-accent-blue/80'
                    : 'bg-mono-medium-grey text-mono-medium-grey cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileSelect(e.target.files, 'file')}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '' } as any)}
        onChange={(e) => handleFileSelect(e.target.files, 'folder')}
        className="hidden"
      />
    </div>
  )
}

export default ChatGPTStyleInterface 