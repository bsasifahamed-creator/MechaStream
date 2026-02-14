'use client'

import React, { useState } from 'react'
import LoadingAnimation from '@/components/LoadingAnimation'

export default function TestLoadingPage() {
  const [showLoading, setShowLoading] = useState(false)

  const triggerLoading = () => {
    setShowLoading(true)
    setTimeout(() => {
      setShowLoading(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Loading Animation Test</h1>
        <button
          onClick={triggerLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Loading Animation
        </button>
        
        {showLoading && <LoadingAnimation message="Testing MechaStream Loading..." />}
      </div>
    </div>
  )
} 