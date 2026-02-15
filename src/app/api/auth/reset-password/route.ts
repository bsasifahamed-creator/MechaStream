import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

import { timingSafeCompareResetToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { resetPasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { token, password } = parsed.data
    const now = new Date()

    const activeTokens = await db.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    })

    let matchedToken: (typeof activeTokens)[number] | null = null

    // Compare against each candidate hash without early return.
    for (const candidate of activeTokens) {
      const isMatch = timingSafeCompareResetToken(candidate.token, token)
      if (isMatch) {
        matchedToken = candidate
      }
    }

    if (!matchedToken) {
      return NextResponse.json(
        { error: 'Reset token is invalid or has expired.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { used: true },
      }),
      db.refreshToken.deleteMany({
        where: { userId: matchedToken.userId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 })
  }
}
