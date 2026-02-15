'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import LoadingButton from '@/components/LoadingButton'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { resetPasswordSchema } from '@/lib/validations'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { resetPassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => {
      router.replace('/login')
    }, 1800)
    return () => clearTimeout(timeout)
  }, [router, success])

  if (!token) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-slate-900/75 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-400">This reset token is missing or malformed.</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword })
    if (!parsed.success) {
      const mapped = parsed.error.flatten().fieldErrors
      setFieldErrors({
        password: mapped.password?.[0] ?? '',
        confirmPassword: mapped.confirmPassword?.[0] ?? '',
      })
      return
    }

    setIsSubmitting(true)
    const result = await resetPassword(parsed.data)
    setIsSubmitting(false)

    if (!result.ok) {
      setServerError(result.error ?? 'Unable to reset password.')
      if (result.fieldErrors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(result.fieldErrors).map(([key, value]) => [key, value?.[0] ?? 'Invalid']),
          ),
        )
      }
      return
    }

    setSuccess(true)
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-700/70 bg-slate-900/75 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.55)] backdrop-blur-md">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Reset password</h1>
      <p className="mt-1.5 text-sm tracking-wide text-slate-400">
        Choose a new password for your account.
      </p>

      {success ? (
        <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Password reset successful. Redirecting to login...
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <PasswordInput
            name="password"
            label="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            showStrength
            showChecklist
            error={fieldErrors.password}
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          {serverError ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {serverError}
            </div>
          ) : null}

          <LoadingButton type="submit" loading={isSubmitting}>
            Reset password
          </LoadingButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="font-medium text-amber-300 transition hover:text-amber-200">
          Back to login
        </Link>
      </p>
    </div>
  )
}
