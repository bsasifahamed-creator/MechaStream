'use client'

import { CheckCircle2 } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  icon?: ReactNode
  success?: boolean
  rightAdornment?: ReactNode
}

export default function InputField({
  label,
  error,
  icon,
  success = false,
  className = '',
  rightAdornment,
  id,
  ...props
}: InputFieldProps) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-300"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-slate-950/70 py-2.5 text-sm text-slate-100 shadow-sm transition placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${rightAdornment || success ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-rose-400/90 focus:border-rose-300 focus:ring-rose-300/40 [animation:shake_0.24s_ease-in-out]'
              : 'border-slate-700 focus:border-amber-300/70 focus:ring-amber-300/30'
          } ${className}`}
          {...props}
        />

        {(rightAdornment || success) && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightAdornment ??
              (success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden /> : null)}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
