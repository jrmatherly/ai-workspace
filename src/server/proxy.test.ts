import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { NextRequest, type NextResponse } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';

import { config, pageGate } from '../../proxy';
import { AUTH_PAGE_MATCHER, isAuthPagePath } from '~/common/app.routes.auth';
import { parseAuthConfig } from './auth/auth.config';

/** Every page route under pages/, Next-style ('/link/chat/[chatLinkId]'), minus the framework files. */
function pageRoutes(dir: string, prefix = ''): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pageRoutes(path, `${prefix}/${name}`);
    const m = /^(.+)\.tsx$/.exec(name);
    if (!m || (prefix === '' && ['_app', '_document', '_error'].includes(m[1]))) return [];
    return [m[1] === 'index' ? prefix || '/' : `${prefix}/${m[1]}`];
  });
}

test('the proxy matcher is AUTH_PAGE_MATCHER and covers every page under pages/ except /signin', () => {
  assert.deepEqual(config.matcher, AUTH_PAGE_MATCHER);
  const routes = pageRoutes(join(process.cwd(), 'pages')).filter(r => r !== '/signin');
  assert.ok(routes.length > 5, `found ${routes.length} pages`);
  for (const route of routes)
    assert.ok(isAuthPagePath(route), `${route} is not in the proxy matcher`);
});


const CFG = parseAuthConfig({
  AUTH_SECRET: 's'.repeat(32), AUTH_URL: 'https://ai.example.com',
  POSTGRES_PRISMA_URL: 'postgres://p', POSTGRES_URL_NON_POOLING: 'postgres://d',
  AUTH_OIDC_ISSUER: 'https://id.example.com', AUTH_OIDC_CLIENT_ID: 'c', AUTH_OIDC_CLIENT_SECRET: 's',
});

function request(path: string, cookie?: string): NextRequest {
  return new NextRequest(`https://ai.example.com${path}`, { headers: cookie ? { cookie } : {} });
}

function passes(response: NextResponse): boolean {
  return response.status === 200 && response.headers.get('x-middleware-next') === '1';
}

test('isAuthPagePath agrees with how Next applies config.matcher', () => {
  for (const url of ['/', '/call', '/call/', '/callx', '/link', '/link/chat/abc', '/link/share_target?text=a', '/dev', '/dev/inspect/storage', '/dev/_spotlight', '/signin', '/signin/', '/api/trpc/x', '/_next/static/x.js', '/favicon.ico', '/nope'])
    assert.equal(isAuthPagePath(url.split('?')[0]), unstable_doesMiddlewareMatch({ config, url }), url);
});

test('auth off: every request passes', () => {
  assert.ok(passes(pageGate(request('/call?x=1'), null)));
});

test('auth on: a gated page without a session cookie redirects to /signin with next = pathname + search', () => {
  const response = pageGate(request('/link/share_target?text=a%20b&url=https%3A%2F%2Fx.y'), CFG);
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://ai.example.com/signin?next=%2Flink%2Fshare_target%3Ftext%3Da%2520b%26url%3Dhttps%253A%252F%252Fx.y');
  assert.equal(pageGate(request('/'), CFG).headers.get('location'), 'https://ai.example.com/signin?next=%2F');
});

test('auth on: public pages and any session cookie pass', () => {
  assert.ok(passes(pageGate(request('/news'), CFG)));
  assert.ok(passes(pageGate(request('/link/chat/abc'), CFG)));
  assert.ok(passes(pageGate(request('/call', 'better-auth.session_token=forged'), CFG)), 'plain cookie');
  assert.ok(passes(pageGate(request('/call', '__Secure-better-auth.session_token=forged'), CFG)), 'secure-prefixed cookie');
  assert.equal(pageGate(request('/call', 'other=1'), CFG).status, 307, 'unrelated cookie');
});
