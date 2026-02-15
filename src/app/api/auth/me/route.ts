import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserFromRequest, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me endpoint error:', error)
    return NextResponse.json({ error: 'Failed to fetch current user.' }, { status: 500 })
  }
}
