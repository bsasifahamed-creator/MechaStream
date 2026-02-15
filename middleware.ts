import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

const protectedPagePrefixes = ['/dashboard', '/profile']
const authPages = ['/login', '/signup', '/forgot-password', '/reset-password']
const protectedApiPrefixes = ['/api/auth/me', '/api/auth/profile', '/api/auth/change-password']

function getAccessSecret() {
  return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? null
}

function extractAuthorizationBearer(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length).trim() || null
}

async function isValidAccessToken(token: string) {
  const secret = getAccessSecret()
  if (!secret) return false

  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

function copySetCookieHeaders(from: Response, to: NextResponse) {
  const headersWithOptionalMethod = from.headers as Headers & {
    getSetCookie?: () => string[]
  }

  const multiSetCookie = headersWithOptionalMethod.getSetCookie?.()
  if (multiSetCookie?.length) {
    for (const headerValue of multiSetCookie) {
      to.headers.append('set-cookie', headerValue)
    }
    return
  }

  const singleSetCookie = from.headers.get('set-cookie')
  if (singleSetCookie) {
    to.headers.set('set-cookie', singleSetCookie)
  }
}

async function tryRefreshSession(request: NextRequest) {
  const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  })

  if (!refreshResponse.ok) return null

  let refreshedAccessToken: string | null = null
  try {
    const payload = (await refreshResponse.clone().json()) as { accessToken?: string }
    if (typeof payload?.accessToken === 'string') {
      refreshedAccessToken = payload.accessToken
    }
  } catch {
    refreshedAccessToken = null
  }

  return {
    refreshResponse,
    refreshedAccessToken,
  }
}

function isPrefixMatch(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtectedPage = isPrefixMatch(pathname, protectedPagePrefixes)
  const isAuthPage = authPages.includes(pathname)
  const isProtectedApi = isPrefixMatch(pathname, protectedApiPrefixes)

  if (!isProtectedPage && !isAuthPage && !isProtectedApi) {
    return NextResponse.next()
  }

  const tokenFromHeader = extractAuthorizationBearer(request)
  const tokenFromCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  const accessToken = tokenFromHeader ?? tokenFromCookie
  const hasValidAccessToken = accessToken ? await isValidAccessToken(accessToken) : false

  if (isProtectedPage || isProtectedApi) {
    if (hasValidAccessToken) {
      return NextResponse.next()
    }

    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null
    if (refreshToken) {
      const refreshResult = await tryRefreshSession(request)
      if (refreshResult) {
        if (isProtectedPage) {
          const redirectToSelf = NextResponse.redirect(request.nextUrl)
          copySetCookieHeaders(refreshResult.refreshResponse, redirectToSelf)
          return redirectToSelf
        }

        if (isProtectedApi && refreshResult.refreshedAccessToken) {
          const requestHeaders = new Headers(request.headers)
          requestHeaders.set('authorization', `Bearer ${refreshResult.refreshedAccessToken}`)
          const next = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          copySetCookieHeaders(refreshResult.refreshResponse, next)
          return next
        }
      }
    }

    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && hasValidAccessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAuthPage && !hasValidAccessToken) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null
    if (refreshToken) {
      const refreshResult = await tryRefreshSession(request)
      if (refreshResult) {
        const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
        copySetCookieHeaders(refreshResult.refreshResponse, redirectResponse)
        return redirectResponse
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api/auth/me',
    '/api/auth/profile/:path*',
    '/api/auth/change-password',
  ],
}
