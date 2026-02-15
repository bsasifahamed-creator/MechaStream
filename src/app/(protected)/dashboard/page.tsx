'use client'

import Link from 'next/link'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Navbar from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, router, user])

  const createdDate = useMemo(() => formatDate(user?.createdAt ?? null), [user?.createdAt])
  const lastLoginDate = useMemo(() => formatDate(user?.lastLoginAt ?? null), [user?.lastLoginAt])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-amber-300" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#020617,#0f172a_55%,#111827)] text-slate-100">
      <Navbar
        user={user}
        isLoggingOut={isLoggingOut}
        onLogout={async () => {
          setIsLoggingOut(true)
          await logout()
          setIsLoggingOut(false)
          router.replace('/login')
        }}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Welcome back</p>
          <h1 className="mt-1 bg-gradient-to-r from-slate-100 via-slate-200 to-amber-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            Hello, {user.name}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            This is a protected page. You&apos;re authenticated!
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Email</p>
            <p className="mt-1 text-sm text-slate-100">{user.email}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Account created</p>
            <p className="mt-1 text-sm text-slate-100">{createdDate}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Last login</p>
            <p className="mt-1 text-sm text-slate-100">{lastLoginDate}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-emerald-200">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              JWT + refresh rotation active
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-amber-100">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Session protected by secure httpOnly cookies
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/profile"
            className="inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Go to profile settings
          </Link>
        </div>
      </main>
    </div>
  )
}
