'use client'

import ChatbotUISimple from '@/components/ChatbotUISimple'

export default function ChatbotSimple() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen p-4">
        <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <ChatbotUISimple />
        </div>
      </div>
    </div>
  )
} 