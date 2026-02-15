import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

import {
  generateOpaqueToken,
  getRefreshTokenExpiryDate,
  setAuthCookies,
  signAccessToken,
  toSafeUser,
} from '@/lib/auth'
import { db } from '@/lib/db'
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid login payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { email, password, rememberMe } = parsed.data
    const rateLimit = checkLoginRateLimit(email)

    if (rateLimit.blocked) {
      return NextResponse.json(
        {
          error: 'Too many failed login attempts. Please try again later.',
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      recordLoginFailure(email)
      return NextResponse.json({ error: 'Account not found.' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      recordLoginFailure(email)
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    clearLoginFailures(email)

    const refreshTokenValue = generateOpaqueToken()
    const refreshExpiresAt = getRefreshTokenExpiryDate(rememberMe)

    await db.$transaction([
      db.refreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: user.id,
          expiresAt: refreshExpiresAt,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ])

    const safeUser = toSafeUser({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: new Date(),
    })

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    const response = NextResponse.json({
      user: safeUser,
      accessToken,
    })

    setAuthCookies(response, accessToken, refreshTokenValue, refreshExpiresAt)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 })
  }
}
