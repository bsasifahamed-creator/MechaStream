'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'
import LivePreviewBuilder from '@/components/LivePreviewBuilder'

export default function LivePreviewPage() {
  const handleSave = (code: string, settings: any) => {
    console.log('Saving project:', { code, settings })
    // Here you could save to localStorage or send to backend
    localStorage.setItem('livePreviewProject', JSON.stringify({ code, settings }))
  }

  return (
    <div className="h-screen">
      <LivePreviewBuilder
        onSave={handleSave}
      />
      <Toaster position="top-right" />
    </div>
  )
} 