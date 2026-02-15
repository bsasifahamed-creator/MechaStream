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
import { signupSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid signup payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with that email already exists.',
        },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const refreshTokenValue = generateOpaqueToken()
    const refreshExpiresAt = getRefreshTokenExpiryDate(false)

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })

    await db.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    })

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    const response = NextResponse.json(
      {
        user: toSafeUser(user),
        accessToken,
      },
      { status: 201 },
    )

    setAuthCookies(response, accessToken, refreshTokenValue, refreshExpiresAt)

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 })
  }
}
