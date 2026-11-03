import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_PREFIXES = ['/sign-in', '/sign-up', '/display/pair', '/api/auth', '/api/display', '/api/calendar'];

// Optimistic redirect only: every page and action re-validates the session or
// display token on the server before reading household data.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const hasSession = !!getSessionCookie(request);
  const hasDisplay = !!request.cookies.get('fcc_display')?.value;
  if (!hasSession && !hasDisplay) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)'],
};
