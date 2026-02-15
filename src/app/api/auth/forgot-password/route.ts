import { NextRequest, NextResponse } from 'next/server'

import { generateOpaqueToken, hashResetToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request payload.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { email } = parsed.data
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    })

    let previewUrl: string | null = null

    if (user) {
      const rawResetToken = generateOpaqueToken()
      const hashedResetToken = hashResetToken(rawResetToken)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await db.passwordResetToken.create({
        data: {
          token: hashedResetToken,
          userId: user.id,
          expiresAt,
        },
      })

      const appUrl = process.env.APP_URL ?? 'http://localhost:3001'
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawResetToken)}`

      const mailResult = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      })

      previewUrl = mailResult.previewUrl
    }

    return NextResponse.json({
      success: true,
      message:
        'If an account exists for that email address, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { previewUrl } : {}),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email address, a password reset link has been sent.',
    })
  }
}
