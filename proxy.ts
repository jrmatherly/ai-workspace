/**
 * Next 16 proxy (Node runtime). Optimistic page gate only: the session authority is getAuthCaller behind the tRPC
 * guards. A forged or stale cookie passes here, then fails every tRPC call, and ProviderAuthGate catches it.
 * Imports: the zero-import route leaf, env-only auth.config and better-auth/cookies. No Better Auth instance,
 * no Prisma, no next/router in this bundle.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import { type AuthConfig, authConfig } from '~/server/auth/auth.config';
import { isAuthPublicPath, ROUTE_SIGNIN, safeNextPath } from '~/common/app.routes.auth';

/** Pure: config in, response out. proxy() binds the module config; proxy.test.ts calls this with its own. */
export function pageGate(request: NextRequest, config: AuthConfig | null): NextResponse {
  if (!config) return NextResponse.next();
  const { pathname, search, origin } = request.nextUrl;
  if (isAuthPublicPath(pathname) || getSessionCookie(request)) return NextResponse.next();
  const url = new URL(ROUTE_SIGNIN, origin);
  // query kept: /link/share_target and the OpenRouter callback carry their payload in it
  url.searchParams.set('next', safeNextPath(pathname + search, origin));
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  return pageGate(request, authConfig);
}

export const config = {
  // AUTH_PAGE_MATCHER, repeated: Next reads this literal at build time and ignores an imported value.
  // proxy.test.ts pins the two equal. public/ assets, /_next and /api/* are never matched.
  matcher: [
    '/', '/call', '/diff', '/draw', '/personas', '/tokens', '/workspace',
    '/news', '/link/:path*',
    '/dev/:path*',
  ],
};
