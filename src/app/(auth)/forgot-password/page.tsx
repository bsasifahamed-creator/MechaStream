'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { useState } from 'react'

import InputField from '@/components/InputField'
import LoadingButton from '@/components/LoadingButton'
import { useAuth } from '@/hooks/useAuth'
import { forgotPasswordSchema } from '@/lib/validations'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? 'Please enter a valid email.')
      return
    }

    setIsSubmitting(true)
    const result = await forgotPassword({ email: parsed.data.email })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Failed to send reset link.')
      return
    }

    const message =
      (result.data as { message?: string } | undefined)?.message ??
      'Check your email for a reset link.'
    setSuccessMessage(message)
    setPreviewUrl((result.data as { previewUrl?: string | null } | undefined)?.previewUrl ?? null)
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-700/70 bg-slate-900/75 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.55)] backdrop-blur-md">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Forgot password</h1>
      <p className="mt-1.5 text-sm tracking-wide text-slate-400">
        Enter your account email and we’ll send a reset link.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <InputField
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={error ?? undefined}
        />

        <LoadingButton type="submit" loading={isSubmitting}>
          Send reset link
        </LoadingButton>
      </form>

      {successMessage ? (
        <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
          {previewUrl ? (
            <p className="mt-2 text-xs text-emerald-100/90">
              Dev preview:{' '}
              <a
                href={previewUrl}
                className="underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                open Ethereal message
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="font-medium text-amber-300 transition hover:text-amber-200">
          Back to login
        </Link>
      </p>
    </div>
  )
}
