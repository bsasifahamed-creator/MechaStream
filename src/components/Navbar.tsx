'use client'

import { LogOut, UserCircle2 } from 'lucide-react'

import type { AuthUser } from '@/hooks/useAuth'

type NavbarProps = {
  user: AuthUser
  onLogout: () => Promise<void>
  isLoggingOut?: boolean
}

export default function Navbar({ user, onLogout, isLoggingOut = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Authenticated Area</p>
          <p className="text-lg font-semibold tracking-tight text-white">Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 sm:flex">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/90 text-xs font-semibold text-slate-950">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-slate-100">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-300" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </button>
        </div>

        <button
          type="button"
          className="rounded-full border border-slate-700 p-2 text-slate-300 sm:hidden"
          aria-label="Current user"
        >
          <UserCircle2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
