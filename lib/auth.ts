import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

function requestOwnOrigin(request?: Request) {
  const host = request?.headers.get('x-forwarded-host') ?? request?.headers.get('host')
  if (!host) return undefined
  const proto = request?.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'https'
  return `${proto}://${host.split(',')[0].trim()}`
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  // Resolved per request: the v0 preview URLs can be injected into process.env
  // after this module loads, and a list frozen at startup rejects the preview
  // iframe with "Invalid origin".
  trustedOrigins: (request) => [
    ...(process.env.NODE_ENV === 'development'
      ? [
          // The v0 preview is served through proxied hostnames that change between
          // sessions. Trusting only the origin this request was addressed to is a
          // same-origin check: a page on another site still sends its own Origin
          // and is rejected.
          requestOwnOrigin(request),
          'http://localhost:3000',
          process.env.V0_RUNTIME_URL,
          process.env.V0_DEV_APP_URL,
          process.env.V0_BUILD_URL,
          process.env.V0_SANDBOX_URL,
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
          process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : undefined,
        ]
      : []),
  ],
  session: {
    // Long rolling session so the wall display stays signed in while it is used daily.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          // `partitioned` (CHIPS) keeps the cookie in browsers that block
          // third-party cookies, so the preview stays signed in between visits.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
            partitioned: true,
          },
        },
      }
    : {}),
})
