/**
 * Next 16 proxy (Node runtime). Optimistic page gate only: the session authority is getAuthCaller behind the tRPC
 * guards. A forged or stale cookie passes here, then fails every tRPC call, and ProviderAuthGate catches it.
 * Imports: the zero-import route leaf, env-only auth.config and better-auth/cookies. No Better Auth instance,
 * no Prisma, no next/router in this bundle.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import { authConfig } from '~/server/auth/auth.config';
import { isAuthPublicPath, ROUTE_SIGNIN, safeNextPath } from '~/common/app.routes.auth';

export function proxy(request: NextRequest) {
  if (!authConfig) return NextResponse.next();
  const { pathname, search, origin } = request.nextUrl;
  if (isAuthPublicPath(pathname) || getSessionCookie(request)) return NextResponse.next();
  const url = new URL(ROUTE_SIGNIN, origin);
  // query kept: /link/share_target and the OpenRouter callback carry their payload in it
  url.searchParams.set('next', safeNextPath(pathname + search, origin));
  return NextResponse.redirect(url);
}

export const config = {
  // Positive list: every page under pages/ except _app/_document and /signin, plus /dev/:path* (pages/dev/* and the
  // /dev, /dev/inspect/* static rewrites). public/ assets, /_next and /api/* are never matched.
  // Public pages (/news, /link/chat/*) are listed on purpose: one list of every page, pinned by proxy.matcher.test.ts.
  // A new page adds a line here; an unlisted page is still covered by ProviderAuthGate and the tRPC guards.
  matcher: [
    '/', '/call', '/diff', '/draw', '/personas', '/tokens', '/workspace',
    '/news', '/link/:path*',
    '/dev/:path*',
  ],
};
