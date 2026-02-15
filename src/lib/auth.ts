import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import type { NextRequest, NextResponse } from 'next/server'

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

export const ACCESS_TOKEN_EXPIRES_IN = '15m'
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60
export const DEFAULT_REFRESH_TOKEN_DAYS = 7
export const REMEMBER_ME_REFRESH_TOKEN_DAYS = 30

export type AccessTokenPayload = {
  sub: string
  email: string
  name: string
  type: 'access'
}

export type AuthUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Missing JWT_ACCESS_SECRET (or JWT_SECRET) environment variable.')
  }

  return secret
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Missing JWT_REFRESH_SECRET (or JWT_SECRET) environment variable.')
  }

  return secret
}

export function getJwtAccessSecretForMiddleware() {
  return getAccessSecret()
}

export function signAccessToken(user: Pick<AuthUser, 'id' | 'email' | 'name'>) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'access',
    } satisfies AccessTokenPayload,
    getAccessSecret(),
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  )
}

export function verifyAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, getAccessSecret())
    if (typeof decoded === 'string') return null
    if (decoded.type !== 'access' || typeof decoded.sub !== 'string') return null
    return decoded as AccessTokenPayload
  } catch {
    return null
  }
}

export function signRefreshTokenJwt(payload: { tokenId: string; userId: string }) {
  return jwt.sign(
    {
      sub: payload.userId,
      jti: payload.tokenId,
      type: 'refresh',
    },
    getRefreshSecret(),
    {
      expiresIn: `${DEFAULT_REFRESH_TOKEN_DAYS}d`,
    },
  )
}

export function verifyRefreshTokenJwt(token: string) {
  try {
    const decoded = jwt.verify(token, getRefreshSecret())
    if (typeof decoded === 'string') return null
    if (decoded.type !== 'refresh' || typeof decoded.sub !== 'string') return null
    return decoded as jwt.JwtPayload
  } catch {
    return null
  }
}

export function getRefreshTokenDurationDays(rememberMe?: boolean) {
  return rememberMe ? REMEMBER_ME_REFRESH_TOKEN_DAYS : DEFAULT_REFRESH_TOKEN_DAYS
}

export function getRefreshTokenExpiryDate(rememberMe?: boolean) {
  const durationDays = getRefreshTokenDurationDays(rememberMe)
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
}

export function generateOpaqueToken() {
  return crypto.randomBytes(48).toString('hex')
}

export function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function timingSafeCompareResetToken(storedHash: string, providedRawToken: string) {
  const providedHash = hashResetToken(providedRawToken)
  const storedBuffer = Buffer.from(storedHash)
  const providedBuffer = Buffer.from(providedHash)

  if (storedBuffer.length !== providedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(storedBuffer, providedBuffer)
}

export function getAccessTokenFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  const tokenFromCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  return tokenFromCookie ?? null
}

export function getRefreshTokenFromRequest(request: NextRequest) {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  refreshExpiresAt: Date,
) {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = Math.max(1, Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000))

  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  })

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
    expires: refreshExpiresAt,
  })
}

export function clearAuthCookies(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production'

  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function toSafeUser(user: {
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  }
}
