'use client'

import type { ButtonHTMLAttributes } from 'react'

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export default function LoadingButton({
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold tracking-wide text-slate-950 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700/30 border-t-slate-900" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
