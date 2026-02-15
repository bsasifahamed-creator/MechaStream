
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/auth'

export default function HomePage() {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const payload = verifyAccessToken(accessToken)
    if (payload) {
      redirect('/dashboard')
    }
  }

  redirect('/login')
}
