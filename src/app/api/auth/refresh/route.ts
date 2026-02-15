import { NextRequest, NextResponse } from 'next/server'

import {
  clearAuthCookies,
  generateOpaqueToken,
  getRefreshTokenExpiryDate,
  getRefreshTokenFromRequest,
  setAuthCookies,
  signAccessToken,
} from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const incomingRefreshToken = getRefreshTokenFromRequest(request)

    if (!incomingRefreshToken) {
      const response = NextResponse.json({ error: 'Refresh token missing.' }, { status: 401 })
      clearAuthCookies(response)
      return response
    }

    const storedToken = await db.refreshToken.findUnique({
      where: { token: incomingRefreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!storedToken) {
      const response = NextResponse.json({ error: 'Invalid refresh token.' }, { status: 401 })
      clearAuthCookies(response)
      return response
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await db.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => null)
      const response = NextResponse.json({ error: 'Refresh token expired.' }, { status: 401 })
      clearAuthCookies(response)
      return response
    }

    const existingLifetimeMs =
      storedToken.expiresAt.getTime() - new Date(storedToken.createdAt).getTime()
    const usedRememberMe = existingLifetimeMs >= 20 * 24 * 60 * 60 * 1000
    const nextRefreshToken = generateOpaqueToken()
    const nextRefreshExpiry = getRefreshTokenExpiryDate(usedRememberMe)

    await db.$transaction([
      db.refreshToken.delete({
        where: { id: storedToken.id },
      }),
      db.refreshToken.create({
        data: {
          token: nextRefreshToken,
          userId: storedToken.userId,
          expiresAt: nextRefreshExpiry,
        },
      }),
    ])

    const accessToken = signAccessToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
    })

    const response = NextResponse.json({ accessToken })
    setAuthCookies(response, accessToken, nextRefreshToken, nextRefreshExpiry)
    return response
  } catch (error) {
    console.error('Refresh error:', error)
    const response = NextResponse.json({ error: 'Failed to refresh session.' }, { status: 500 })
    clearAuthCookies(response)
    return response
  }
}
