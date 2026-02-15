'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import AuthForm from '@/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const nextPath = searchParams.get('next') || '/dashboard'

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Secure Access</p>
        <h2 className="mt-1 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Sign in to continue
        </h2>
      </div>

      <AuthForm
        variant="login"
        onSubmit={async (payload) => {
          const result = await login(payload)
          if (result.ok) {
            router.replace(nextPath)
            return { ok: true }
          }
          return {
            ok: false,
            error: result.error,
            fieldErrors: result.fieldErrors,
          }
        }}
      />
    </div>
  )
}
