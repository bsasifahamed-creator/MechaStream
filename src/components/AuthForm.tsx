'use client'

import Link from 'next/link'
import { Github, Mail, User } from 'lucide-react'
import { useMemo, useState } from 'react'

import InputField from '@/components/InputField'
import LoadingButton from '@/components/LoadingButton'
import PasswordInput from '@/components/PasswordInput'
import { loginSchema, signupClientSchema } from '@/lib/validations'

type FormResult = {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

type LoginPayload = {
  email: string
  password: string
  rememberMe: boolean
}

type SignupPayload = {
  name: string
  email: string
  password: string
}

type AuthFormProps =
  | {
      variant: 'login'
      onSubmit: (payload: LoginPayload) => Promise<FormResult>
    }
  | {
      variant: 'signup'
      onSubmit: (payload: SignupPayload) => Promise<FormResult>
    }

function flattenFieldErrors(input: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value?.[0] ?? 'Invalid value']),
  ) as Record<string, string>
}

export default function AuthForm(props: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const isLogin = props.variant === 'login'
  const title = isLogin ? 'Welcome back' : 'Create account'
  const subtitle = isLogin
    ? 'Sign in to continue to your dashboard'
    : 'Start your secure account in under a minute'

  const isFormValid = useMemo(() => {
    if (isLogin) return Boolean(email && password)
    return Boolean(name && email && password && confirmPassword)
  }, [confirmPassword, email, isLogin, name, password])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (isLoading) return

    if (isLogin) {
      const parsed = loginSchema.safeParse({ email, password, rememberMe })
      if (!parsed.success) {
        setFieldErrors(flattenFieldErrors(parsed.error.flatten().fieldErrors))
        return
      }

      setIsLoading(true)
      const result = await props.onSubmit(parsed.data)
      setIsLoading(false)

      if (!result.ok) {
        setServerError(result.error ?? 'Unable to sign in.')
        if (result.fieldErrors) {
          setFieldErrors(flattenFieldErrors(result.fieldErrors))
        }
      }

      return
    }

    const parsed = signupClientSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    })

    if (!parsed.success) {
      setFieldErrors(flattenFieldErrors(parsed.error.flatten().fieldErrors))
      return
    }

    setIsLoading(true)
    const result = await props.onSubmit({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    })
    setIsLoading(false)

    if (!result.ok) {
      setServerError(result.error ?? 'Unable to create account.')
      if (result.fieldErrors) {
        setFieldErrors(flattenFieldErrors(result.fieldErrors))
      }
    }
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-700/70 bg-slate-900/75 p-8 shadow-[0_24px_70px_rgba(2,6,23,0.55)] backdrop-blur-md">
      <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-1.5 text-sm tracking-wide text-slate-400">{subtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {!isLogin ? (
          <InputField
            name="name"
            label="Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            icon={<User className="h-4 w-4" />}
            error={fieldErrors.name}
          />
        ) : null}

        <InputField
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={fieldErrors.email}
        />

        <PasswordInput
          name="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          error={fieldErrors.password}
          showStrength={!isLogin}
          showChecklist={!isLogin}
        />

        {!isLogin ? (
          <PasswordInput
            name="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />
        ) : null}

        {isLogin ? (
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-300/40"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-amber-300 transition hover:text-amber-200 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        {serverError ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {serverError}
          </div>
        ) : null}

        <LoadingButton
          type="submit"
          loading={isLoading}
          disabled={!isFormValid}
          className="mt-1"
        >
          {isLogin ? 'Sign in' : 'Create account'}
        </LoadingButton>
      </form>

      {isLogin ? (
        <>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            <span className="h-px flex-1 bg-slate-700" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Google
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
          </div>
        </>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <Link
          href={isLogin ? '/signup' : '/login'}
          className="font-medium text-amber-300 transition hover:text-amber-200"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}
