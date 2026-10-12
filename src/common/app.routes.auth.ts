/**
 * Auth route policy. Kept import-free so the server-side proxy bundle can load it:
 * app.routes.ts imports next/router, which must not reach that bundle, so it only re-exports from here.
 */

export const ROUTE_SIGNIN = '/signin';

/**
 * Every page the app serves except /signin, in Next matcher syntax. proxy.ts repeats this list as its static
 * `config.matcher` (Next reads that literal at build time, so it cannot import this); proxy.matcher.test.ts pins
 * the two equal and checks every file under pages/ is covered.
 */
export const AUTH_PAGE_MATCHER: readonly string[] = [
  '/', '/call', '/diff', '/draw', '/personas', '/tokens', '/workspace',
  '/news', '/link/:path*',
  '/dev/:path*',
];

/** Reachable without a session when auth is on. Everything else bounces through /signin?next=. */
const PUBLIC_EXACT: readonly string[] = [ROUTE_SIGNIN, '/news'];
const PUBLIC_PREFIX: readonly string[] = ['/link/chat/'];

/** next.config.ts sets skipTrailingSlashRedirect, so '/news/' arrives as is: strip trailing slashes first. */
function stripTrailingSlashes(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function isAuthPublicPath(pathname: string): boolean {
  const p = stripTrailingSlashes(pathname);
  return PUBLIC_EXACT.includes(p) || PUBLIC_PREFIX.some(prefix => p.startsWith(prefix) && p.length > prefix.length);
}

/** A page in AUTH_PAGE_MATCHER: never /signin, /api/*, /_next/* or a public/ asset. */
export function isAuthPagePath(pathname: string): boolean {
  const p = stripTrailingSlashes(pathname);
  return AUTH_PAGE_MATCHER.some(pattern => {
    const star = pattern.endsWith('/:path*') ? pattern.slice(0, -'/:path*'.length) : null;
    return star === null ? p === pattern : p === star || p.startsWith(star + '/');
  });
}

/**
 * Validates the `next` redirect target; input is `pathname + search`.
 * Invariant: the result is a same-origin page (`pathname + search`), never a host, scheme, protocol-relative URL,
 * API route or the sign-in page itself. '/\evil.com' and '/..//evil.com' resolve to the pathname '//evil.com',
 * which no page pattern matches.
 */
export function safeNextPath(next: string | string[] | undefined, origin: string): string {
  if (typeof next !== 'string') return '/';
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin || !isAuthPagePath(url.pathname)) return '/';
    return url.pathname + url.search;
  } catch {
    return '/';
  }
}

/** The sign-in page URL that returns to `next` (pathname + search) after sign-in; hostile values collapse to '/'. */
export function signInPath(next: string, origin: string): string {
  return `${ROUTE_SIGNIN}?next=${encodeURIComponent(safeNextPath(next, origin))}`;
}
