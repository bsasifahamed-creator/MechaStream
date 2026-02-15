import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

import { clearAuthCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAuthenticatedUserFromRequest, unauthorizedResponse } from '@/lib/middleware'
import { changePasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUserFromRequest(request)
    if (!currentUser) return unauthorizedResponse()

    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const userWithPassword = await db.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!userWithPassword) {
      return unauthorizedResponse()
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parsed.data.currentPassword,
      userWithPassword.passwordHash,
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12)

    await db.$transaction([
      db.user.update({
        where: { id: currentUser.id },
        data: { passwordHash: newPasswordHash },
      }),
      db.refreshToken.deleteMany({
        where: { userId: currentUser.id },
      }),
    ])

    const response = NextResponse.json({
      success: true,
      message: 'Password updated. Please sign in again.',
    })
    clearAuthCookies(response)
    return response
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password.' }, { status: 500 })
  }
}
