import { NextRequest, NextResponse } from 'next/server'

import { toSafeUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAuthenticatedUserFromRequest, unauthorizedResponse } from '@/lib/middleware'
import { updateProfileSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request)
    if (!user) return unauthorizedResponse()

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUserFromRequest(request)
    if (!currentUser) return unauthorizedResponse()

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid profile payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const updatedUser = await db.user.update({
      where: { id: currentUser.id },
      data: {
        name: parsed.data.name,
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

    return NextResponse.json({ user: toSafeUser(updatedUser) })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
