'use client'

import { PencilLine, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import LoadingButton from '@/components/LoadingButton'
import Navbar from '@/components/Navbar'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { changePasswordSchema, nameSchema } from '@/lib/validations'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, logout, updateProfileName, changePassword } = useAuth()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSuccess, setNameSuccess] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, router, user])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-amber-300" />
          Loading profile...
        </div>
      </div>
    )
  }

  async function onSaveName() {
    setNameError(null)
    setNameSuccess(null)

    const parsedName = nameSchema.safeParse(name)
    if (!parsedName.success) {
      setNameError(parsedName.error.flatten().formErrors[0] ?? 'Please enter a valid name.')
      return
    }

    setIsSavingName(true)
    const result = await updateProfileName(parsedName.data)
    setIsSavingName(false)

    if (!result.ok) {
      setNameError(result.error ?? 'Failed to update name.')
      return
    }

    setNameSuccess('Name updated successfully.')
    setIsEditingName(false)
  }

  async function onChangePassword(event: React.FormEvent) {
    event.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess(null)

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      setPasswordErrors({
        currentPassword: errors.currentPassword?.[0] ?? '',
        newPassword: errors.newPassword?.[0] ?? '',
        confirmPassword: errors.confirmPassword?.[0] ?? '',
      })
      return
    }

    setIsChangingPassword(true)
    const result = await changePassword(parsed.data)
    setIsChangingPassword(false)

    if (!result.ok) {
      setPasswordErrors({
        currentPassword: result.error ?? 'Failed to change password.',
      })
      return
    }

    setPasswordSuccess('Password updated. Redirecting to login...')
    setTimeout(() => {
      router.replace('/login')
    }, 1200)
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

      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Profile</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your account information.</p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Email</p>
              <p className="mt-1 text-sm text-slate-100">{user.email}</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Name</p>
                {!isEditingName ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    Edit
                  </button>
                ) : null}
              </div>

              {isEditingName ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                  />
                  <button
                    type="button"
                    disabled={isSavingName}
                    onClick={onSaveName}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-100">{user.name}</p>
              )}

              {nameError ? <p className="mt-1 text-xs text-rose-300">{nameError}</p> : null}
              {nameSuccess ? <p className="mt-1 text-xs text-emerald-300">{nameSuccess}</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-white">Change password</h2>
          <p className="mt-1 text-sm text-slate-400">Use a strong password you don’t reuse elsewhere.</p>

          <form className="mt-5 space-y-4" onSubmit={onChangePassword} noValidate>
            <PasswordInput
              label="Current password"
              name="currentPassword"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              error={passwordErrors.currentPassword}
            />

            <PasswordInput
              label="New password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              showStrength
              showChecklist
              error={passwordErrors.newPassword}
            />

            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              error={passwordErrors.confirmPassword}
            />

            {passwordSuccess ? (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {passwordSuccess}
              </div>
            ) : null}

            <LoadingButton type="submit" loading={isChangingPassword}>
              Update password
            </LoadingButton>
          </form>
        </section>
      </main>
    </div>
  )
}
