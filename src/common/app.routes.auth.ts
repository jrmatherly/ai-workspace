/**
 * Auth route policy. Kept import-free so the server-side proxy bundle can load it:
 * app.routes.ts imports next/router, which must not reach that bundle, so it only re-exports from here.
 */

export const ROUTE_SIGNIN = '/signin';

/** Reachable without a session when auth is on. Everything else bounces through /signin?next=. */
const PUBLIC_EXACT: readonly string[] = [ROUTE_SIGNIN, '/news'];
const PUBLIC_PREFIX: readonly string[] = ['/link/chat/'];

/** next.config.ts sets skipTrailingSlashRedirect, so '/news/' arrives as is: strip trailing slashes first. */
export function isAuthPublicPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PUBLIC_EXACT.includes(p) || PUBLIC_PREFIX.some(prefix => p.startsWith(prefix) && p.length > prefix.length);
}

/**
 * Validates the `next` redirect target; input is `pathname + search`.
 * Invariant: the result is a same-origin `pathname + search`, never a host, scheme or protocol-relative URL.
 */
export function safeNextPath(next: string | string[] | undefined, origin: string): string {
  // browsers read '/\evil.com' as '//evil.com'
  if (typeof next !== 'string' || next.includes('\\')) return '/';
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? url.pathname + url.search : '/';
  } catch {
    return '/';
  }
}
