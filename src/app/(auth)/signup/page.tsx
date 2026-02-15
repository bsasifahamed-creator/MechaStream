'use client'

import { useRouter } from 'next/navigation'

import AuthForm from '@/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Create Account</p>
        <h2 className="mt-1 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Join with secure authentication
        </h2>
      </div>

      <AuthForm
        variant="signup"
        onSubmit={async (payload) => {
          const result = await signup(payload)
          if (result.ok) {
            router.replace('/dashboard')
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
