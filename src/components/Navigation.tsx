'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Code IDE', href: '/ide' },
    { name: 'Simulation', href: '/simulation' },
    { name: 'Vibe Chat Demo', href: '/vibe-chat-demo' },
    { name: 'Deploy', href: '/deploy' },
    { name: 'Settings', href: '/settings' },
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className="bg-mono-black border-b border-mono-border-grey w-full overflow-hidden sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 w-full">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-mono-white truncate">
                MechaStream
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 min-w-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.href)
                    ? 'bg-mono-sidebar-bg text-mono-accent-blue'
                    : 'text-mono-medium-grey hover:text-mono-white hover:bg-mono-sidebar-bg'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center space-x-4 min-w-0">
              <button className="bg-mono-accent-blue text-mono-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-mono-accent-blue/80 transition-colors whitespace-nowrap">
                Login
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center min-w-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-sm text-mono-medium-grey hover:text-mono-white hover:bg-mono-sidebar-bg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-mono-accent-blue"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden w-full overflow-hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-mono-black border-t border-mono-border-grey w-full">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-sm text-base font-medium transition-colors w-full ${
                  isActive(item.href)
                    ? 'bg-mono-sidebar-bg text-mono-accent-blue'
                    : 'text-mono-medium-grey hover:text-mono-white hover:bg-mono-sidebar-bg'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-mono-border-grey w-full">
              <button className="w-full bg-mono-accent-blue text-mono-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-mono-accent-blue/80 transition-colors">
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}