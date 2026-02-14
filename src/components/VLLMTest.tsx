'use client'

import { useState } from 'react'
import { useVLLM } from '@/lib/vllm-client'

export default function VLLMTest() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { client, health, isAvailable } = useVLLM()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setStatus('idle')
    
    try {
      const result = await client.generateText({
        prompt,
        max_tokens: 150,
        temperature: 0.7
      })
      
      setResponse(result.text)
      setStatus('success')
    } catch (error) {
      console.error('Error:', error)
      setResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setStatus('idle')
    
    try {
      const result = await client.chatCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that responds in English.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
      
      setResponse(result.message.content)
      setStatus('success')
    } catch (error) {
      console.error('Error:', error)
      setResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const healthData = await health()
      setResponse(`API Status: ${JSON.stringify(healthData, null, 2)}`)
      setStatus('success')
    } catch (error) {
      setResponse(`Error checking health: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStatus('error')
    }
  }

  const checkAvailability = async () => {
    const available = await isAvailable()
    setResponse(`API available: ${available ? 'Yes' : 'No'}`)
    setStatus(available ? 'success' : 'error')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          🤖 vLLM API Test
        </h2>
        
        {/* Status controls */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={checkHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Health
          </button>
          <button
            onClick={checkAvailability}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Check Availability
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your prompt here..."
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
          <button
            onClick={handleChat}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Chatting...' : 'Chat Completion'}
          </button>
        </div>

        {/* Response */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Response:
          </label>
          <div className={`p-4 rounded-lg border ${
            status === 'success' ? 'bg-green-900/20 border-green-700' :
            status === 'error' ? 'bg-red-900/20 border-red-700' :
            'bg-gray-700 border-gray-600'
          }`}>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <pre className="text-gray-200 whitespace-pre-wrap text-sm">
                {response || 'No response yet...'}
              </pre>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• The API must be running on http://localhost:8000</p>
          <p>• Use "Check Health" to verify the API status</p>
          <p>• "Generate Text" uses the /v1/generate endpoint</p>
          <p>• "Chat Completion" uses the /v1/chat/completions endpoint</p>
        </div>
      </div>
    </div>
  )
}