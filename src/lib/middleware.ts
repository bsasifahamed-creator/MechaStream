import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { getAccessTokenFromRequest, toSafeUser, verifyAccessToken } from '@/lib/auth'

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const accessToken = getAccessTokenFromRequest(request)
  if (!accessToken) return null

  const payload = verifyAccessToken(accessToken)
  if (!payload?.sub) return null

  const user = await db.user.findUnique({
    where: { id: payload.sub },
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

  if (!user) return null
  return toSafeUser(user)
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}
