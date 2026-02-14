'use client'

import React from 'react'

interface LoadingAnimationProps {
  message?: string
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ message = "Loading MechaStream..." }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center relative">
        {/* MechaStream Logo with enhanced animation */}
        <div className="mb-8">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-pulse">
            MechaStream
          </div>
          <div className="text-sm text-gray-400 mt-2 animate-pulse">AI-Powered Code Generation</div>
        </div>

        {/* Enhanced Animated Three Dots */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
        </div>

        {/* Loading Message with typewriter effect */}
        <div className="text-gray-300 text-xl font-medium mb-6">
          {message}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-80 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 rounded-full animate-pulse shadow-lg"
            style={{
              animation: 'progress 2s ease-in-out infinite'
            }}
          ></div>
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70 animate-ping shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Glowing Orb Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default LoadingAnimation 