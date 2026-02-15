import { NextRequest, NextResponse } from 'next/server'

import { clearAuthCookies, getRefreshTokenFromRequest } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request)

    if (refreshToken) {
      await db.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    }

    const response = NextResponse.json({ success: true })
    clearAuthCookies(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ error: 'Failed to logout.' }, { status: 500 })
    clearAuthCookies(response)
    return response
  }
}
