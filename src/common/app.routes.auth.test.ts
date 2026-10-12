import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isAuthPagePath, isAuthPublicPath, ROUTE_SIGNIN, safeNextPath, signInPath } from './app.routes.auth';

const ORIGIN = 'https://ai.example.com';

test('public pages: /signin, /news and /link/chat/<id>, trailing slashes normalised', () => {
  assert.equal(ROUTE_SIGNIN, '/signin');
  for (const p of ['/signin', '/signin/', '/news', '/news/', '/link/chat/abc', '/link/chat/abc/', '/link/chat/list'])
    assert.equal(isAuthPublicPath(p), true, p);
  for (const p of ['/', '/call', '/newsletter', '/link/chat', '/link/chat/', '/link/callback_openrouter', '/link/share_target', '/dev', '/dev/inspect/storage', '//'])
    assert.equal(isAuthPublicPath(p), false, p);
});

test('page paths: every gated or public page, trailing slashes normalised; not /signin, /api, /_next or assets', () => {
  for (const p of ['/', '/call', '/call/', '/news', '/link/chat/abc', '/link/share_target', '/link/callback_openrouter', '/dev', '/dev/inspect/storage'])
    assert.equal(isAuthPagePath(p), true, p);
  for (const p of ['/signin', '/signin/', '/api/auth/sign-out', '/api/trpc/backend.whoami', '/_next/static/x.js', '/favicon.ico', '/callx', '/calls', '//evil.com', '//'])
    assert.equal(isAuthPagePath(p), false, p);
});

test('safeNextPath keeps same-origin pathname + search', () => {
  assert.equal(safeNextPath('/', ORIGIN), '/');
  assert.equal(safeNextPath('/call?x=1', ORIGIN), '/call?x=1');
  assert.equal(safeNextPath('/link/share_target?text=a%20b&url=https%3A%2F%2Fx.y', ORIGIN), '/link/share_target?text=a%20b&url=https%3A%2F%2Fx.y');
  assert.equal(safeNextPath('/link/callback_openrouter?code=abc#frag', ORIGIN), '/link/callback_openrouter?code=abc');
  assert.equal(safeNextPath(`${ORIGIN}/personas`, ORIGIN), '/personas');
  assert.equal(safeNextPath('/call/?x=1', ORIGIN), '/call/?x=1', 'trailing slash kept as the app serves it');
});

test('safeNextPath admits only pages: no API routes, Next internals, assets or the sign-in page', () => {
  for (const bad of ['/api/auth/sign-out', '/api/trpc/backend.whoami?batch=1', '/_next/static/chunks/main.js', '/favicon.ico', '/signin', '/signin?next=%2F', '/nope'])
    assert.equal(safeNextPath(bad, ORIGIN), '/', bad);
});

test('safeNextPath rejects anything that leaves the origin', () => {
  for (const bad of ['//evil.com', '/\\evil.com', '\\\\evil.com', 'https://evil.com/x', 'javascript:alert(1)', '/\t/evil.com', 'http://ai.example.com/x', '/..//evil.com', '/a/..//evil.com', '/.//evil.com'])
    assert.equal(safeNextPath(bad, ORIGIN), '/', JSON.stringify(bad));
  assert.equal(safeNextPath(undefined, ORIGIN), '/');
  assert.equal(safeNextPath(['/a', '/b'], ORIGIN), '/');
  assert.equal(safeNextPath('', ORIGIN), '/');
});

test('signInPath carries a safe next, and nothing hostile', () => {
  assert.equal(signInPath('/call?x=1', ORIGIN), '/signin?next=%2Fcall%3Fx%3D1');
  assert.equal(signInPath('//evil.com', ORIGIN), '/signin?next=%2F');
  assert.equal(signInPath('/', ORIGIN), '/signin?next=%2F');
});
