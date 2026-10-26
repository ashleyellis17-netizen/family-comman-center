import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/api/auth', '/api/calendar', '/manifest.webmanifest']

// Optimistic redirect only. Every page, action, and route still validates the session on the server.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }
  if (!getSessionCookie(request)) {
    const url = new URL('/sign-in', request.url)
    if (pathname !== '/') url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)'],
}
