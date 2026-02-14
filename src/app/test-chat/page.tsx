'use client'

import React, { useState } from 'react'
import ConversationalChatbot from '@/components/ConversationalChatbot'

export default function TestChatPage() {
  const [testInput, setTestInput] = useState('')
  
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Chatbot Test Page</h1>
        
        {/* Simple input test */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-white mb-2">Test Input:</h2>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="Type something..."
          />
          <p className="text-gray-400 text-sm mt-2">
            Input value: "{testInput}" (length: {testInput.length})
          </p>
        </div>
        
        {/* Chatbot */}
        <ConversationalChatbot isCodeIDE={true} />
      </div>
    </div>
  )
} 