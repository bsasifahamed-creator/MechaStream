'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1220] p-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-400 mb-6">{error.message || 'An error occurred while loading.'}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
