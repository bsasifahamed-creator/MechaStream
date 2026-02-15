'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-300">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-amber-300" />
          Checking authentication...
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
