type LoginAttemptState = {
  failures: number
  firstFailureAt: number
}

const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000

const loginAttemptsByEmail = new Map<string, LoginAttemptState>()

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function checkLoginRateLimit(email: string) {
  const key = normalizeEmail(email)
  const state = loginAttemptsByEmail.get(key)
  if (!state) {
    return { blocked: false, retryAfterSeconds: 0 }
  }

  const now = Date.now()
  const elapsed = now - state.firstFailureAt
  if (elapsed > LOGIN_WINDOW_MS) {
    loginAttemptsByEmail.delete(key)
    return { blocked: false, retryAfterSeconds: 0 }
  }

  if (state.failures >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterMs = LOGIN_WINDOW_MS - elapsed
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    }
  }

  return { blocked: false, retryAfterSeconds: 0 }
}

export function recordLoginFailure(email: string) {
  const key = normalizeEmail(email)
  const now = Date.now()
  const current = loginAttemptsByEmail.get(key)

  if (!current || now - current.firstFailureAt > LOGIN_WINDOW_MS) {
    loginAttemptsByEmail.set(key, {
      failures: 1,
      firstFailureAt: now,
    })
    return
  }

  loginAttemptsByEmail.set(key, {
    failures: current.failures + 1,
    firstFailureAt: current.firstFailureAt,
  })
}

export function clearLoginFailures(email: string) {
  loginAttemptsByEmail.delete(normalizeEmail(email))
}
