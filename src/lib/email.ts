import nodemailer from 'nodemailer'

type EmailTransport = {
  transporter: nodemailer.Transporter
  from: string
}

let cachedTransport: EmailTransport | null = null

async function getEmailTransport(): Promise<EmailTransport> {
  if (cachedTransport) {
    return cachedTransport
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.EMAIL_FROM ?? 'Auth Demo <no-reply@example.dev>'

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    cachedTransport = { transporter, from }
    return cachedTransport
  }

  const testAccount = await nodemailer.createTestAccount()
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  cachedTransport = {
    transporter,
    from: `Auth Demo <${testAccount.user}>`,
  }

  return cachedTransport
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string
  name: string
  resetUrl: string
}) {
  const { transporter, from } = await getEmailTransport()

  const result = await transporter.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Hi ${name},\n\nUse this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px; border-radius:12px;">
        <h2 style="margin:0 0 12px; color:#f59e0b;">Reset your password</h2>
        <p style="margin:0 0 16px;">Hi ${name},</p>
        <p style="margin:0 0 16px;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:#0b1020;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">
          Reset Password
        </a>
        <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;word-break:break-all;">If the button doesn’t work, copy this URL: ${resetUrl}</p>
      </div>
    `,
  })

  const previewUrl = nodemailer.getTestMessageUrl(result) ?? null

  return {
    messageId: result.messageId,
    previewUrl,
  }
}
