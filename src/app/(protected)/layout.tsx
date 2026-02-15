import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    redirect('/login')
  }

  const payload = verifyAccessToken(accessToken)
  if (!payload) {
    redirect('/login')
  }

  return <>{children}</>
}
