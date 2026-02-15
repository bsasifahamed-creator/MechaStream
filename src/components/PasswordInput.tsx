'use client'

import { Eye, EyeOff, Lock, CheckCircle2, Circle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

import InputField from '@/components/InputField'
import { getPasswordChecks, getPasswordStrength } from '@/lib/validations'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
  showStrength?: boolean
  showChecklist?: boolean
}

function strengthLabel(score: number) {
  if (score <= 1) return 'Weak'
  if (score === 2) return 'Fair'
  if (score === 3) return 'Good'
  return 'Strong'
}

export default function PasswordInput({
  label,
  error,
  value = '',
  showStrength = false,
  showChecklist = false,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const passwordValue = typeof value === 'string' ? value : String(value ?? '')

  const checks = useMemo(() => getPasswordChecks(passwordValue), [passwordValue])
  const score = useMemo(() => getPasswordStrength(passwordValue), [passwordValue])
  const allChecksPass = Object.values(checks).every(Boolean)

  return (
    <div className="space-y-2">
      <InputField
        {...props}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        error={error}
        icon={<Lock className="h-4 w-4" />}
        success={Boolean(passwordValue) && !error && (!showChecklist || allChecksPass)}
        rightAdornment={
          <button
            type="button"
            onClick={() => setVisible((state) => !state)}
            className="text-slate-400 transition hover:text-slate-200 focus:outline-none"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {showStrength ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, index) => {
                const active = score > index
                const color =
                  score <= 1
                    ? 'bg-rose-400'
                    : score === 2
                      ? 'bg-orange-400'
                      : score === 3
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                return (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition ${
                      active ? color : 'bg-slate-700'
                    }`}
                  />
                )
              })}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              {strengthLabel(score)}
            </span>
          </div>

          {showChecklist ? (
            <ul className="space-y-1 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                {checks.minLength ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <span className={checks.minLength ? 'text-emerald-300' : ''}>Min 8 characters</span>
              </li>
              <li className="flex items-center gap-1.5">
                {checks.hasUppercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <span className={checks.hasUppercase ? 'text-emerald-300' : ''}>
                  1 uppercase letter
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                {checks.hasNumber ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <span className={checks.hasNumber ? 'text-emerald-300' : ''}>1 number</span>
              </li>
              <li className="flex items-center gap-1.5">
                {checks.hasSpecial ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <span className={checks.hasSpecial ? 'text-emerald-300' : ''}>1 special character</span>
              </li>
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
