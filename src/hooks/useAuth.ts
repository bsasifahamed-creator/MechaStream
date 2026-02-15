'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type AuthUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

type AuthResponse<T = Record<string, unknown>> = {
  ok: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

let inMemoryAccessToken: string | null = null
let refreshInFlight: Promise<string | null> | null = null

function setAccessToken(token: string | null) {
  inMemoryAccessToken = token
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function refreshAccessToken() {
  if (refreshInFlight) {
    return refreshInFlight
  }

  refreshInFlight = (async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      setAccessToken(null)
      return null
    }

    const payload = await parseJsonSafe<{ accessToken?: string }>(response)
    const nextToken = payload?.accessToken ?? null
    setAccessToken(nextToken)
    return nextToken
  })()

  const token = await refreshInFlight
  refreshInFlight = null
  return token
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {})

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`)
  }

  const baseResponse = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  })

  if (baseResponse.status !== 401) {
    return baseResponse
  }

  const refreshedToken = await refreshAccessToken()
  if (!refreshedToken) {
    return baseResponse
  }

  const retryHeaders = new Headers(init?.headers ?? {})
  retryHeaders.set('Authorization', `Bearer ${refreshedToken}`)

  return fetch(input, {
    ...init,
    headers: retryHeaders,
    credentials: 'include',
    cache: 'no-store',
  })
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authFetch('/api/auth/me', { method: 'GET' })
      if (!response.ok) {
        setUser(null)
        return
      }

      const payload = await parseJsonSafe<{ user?: AuthUser }>(response)
      setUser(payload?.user ?? null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCurrentUser()
  }, [fetchCurrentUser])

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })

      const payload = await parseJsonSafe<{
        user?: AuthUser
        accessToken?: string
        error?: string
        fieldErrors?: Record<string, string[]>
      }>(response)

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error ?? 'Signup failed.',
          fieldErrors: payload?.fieldErrors,
        } satisfies AuthResponse
      }

      setAccessToken(payload?.accessToken ?? null)
      setUser(payload?.user ?? null)
      return { ok: true, data: payload } satisfies AuthResponse
    },
    [],
  )

  const login = useCallback(
    async (input: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })

      const payload = await parseJsonSafe<{
        user?: AuthUser
        accessToken?: string
        error?: string
        fieldErrors?: Record<string, string[]>
        retryAfterSeconds?: number
      }>(response)

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error ?? 'Login failed.',
          fieldErrors: payload?.fieldErrors,
          data: payload,
        } satisfies AuthResponse
      }

      setAccessToken(payload?.accessToken ?? null)
      setUser(payload?.user ?? null)
      return { ok: true, data: payload } satisfies AuthResponse
    },
    [],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    setAccessToken(null)
    setUser(null)
  }, [])

  const forgotPassword = useCallback(async (input: { email: string }) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const payload = await parseJsonSafe<{
      error?: string
      message?: string
      previewUrl?: string | null
    }>(response)

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? 'Failed to send reset link.',
      } satisfies AuthResponse
    }

    return { ok: true, data: payload } satisfies AuthResponse
  }, [])

  const resetPassword = useCallback(
    async (input: { token: string; password: string; confirmPassword: string }) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const payload = await parseJsonSafe<{
        error?: string
        fieldErrors?: Record<string, string[]>
      }>(response)

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error ?? 'Failed to reset password.',
          fieldErrors: payload?.fieldErrors,
        } satisfies AuthResponse
      }

      return { ok: true, data: payload } satisfies AuthResponse
    },
    [],
  )

  const updateProfileName = useCallback(async (name: string) => {
    const response = await authFetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const payload = await parseJsonSafe<{
      user?: AuthUser
      error?: string
      fieldErrors?: Record<string, string[]>
    }>(response)

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? 'Failed to update profile.',
        fieldErrors: payload?.fieldErrors,
      } satisfies AuthResponse
    }

    setUser(payload?.user ?? null)
    return { ok: true, data: payload } satisfies AuthResponse
  }, [])

  const changePassword = useCallback(
    async (input: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const payload = await parseJsonSafe<{
        error?: string
        message?: string
        fieldErrors?: Record<string, string[]>
      }>(response)

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error ?? 'Failed to change password.',
          fieldErrors: payload?.fieldErrors,
        } satisfies AuthResponse
      }

      // Password change invalidates sessions server-side.
      setAccessToken(null)
      setUser(null)

      return { ok: true, data: payload } satisfies AuthResponse
    },
    [],
  )

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      fetchCurrentUser,
      signup,
      login,
      logout,
      forgotPassword,
      resetPassword,
      updateProfileName,
      changePassword,
    }),
    [
      user,
      isLoading,
      fetchCurrentUser,
      signup,
      login,
      logout,
      forgotPassword,
      resetPassword,
      updateProfileName,
      changePassword,
    ],
  )
}
