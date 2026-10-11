import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isAuthPublicPath, ROUTE_SIGNIN, safeNextPath } from './app.routes.auth';

const ORIGIN = 'https://ai.example.com';

test('public pages: /signin, /news and /link/chat/<id>, trailing slashes normalised', () => {
  assert.equal(ROUTE_SIGNIN, '/signin');
  for (const p of ['/signin', '/signin/', '/news', '/news/', '/link/chat/abc', '/link/chat/abc/', '/link/chat/list'])
    assert.equal(isAuthPublicPath(p), true, p);
  for (const p of ['/', '/call', '/newsletter', '/link/chat', '/link/chat/', '/link/callback_openrouter', '/link/share_target', '/dev', '/dev/inspect/storage', '//'])
    assert.equal(isAuthPublicPath(p), false, p);
});

test('safeNextPath keeps same-origin pathname + search', () => {
  assert.equal(safeNextPath('/', ORIGIN), '/');
  assert.equal(safeNextPath('/call?x=1', ORIGIN), '/call?x=1');
  assert.equal(safeNextPath('/link/share_target?text=a%20b&url=https%3A%2F%2Fx.y', ORIGIN), '/link/share_target?text=a%20b&url=https%3A%2F%2Fx.y');
  assert.equal(safeNextPath('/link/callback_openrouter?code=abc#frag', ORIGIN), '/link/callback_openrouter?code=abc');
  assert.equal(safeNextPath(`${ORIGIN}/personas`, ORIGIN), '/personas');
});

test('safeNextPath rejects anything that leaves the origin', () => {
  for (const bad of ['//evil.com', '/\\evil.com', '\\\\evil.com', 'https://evil.com/x', 'javascript:alert(1)', '/\t/evil.com', 'http://ai.example.com/x', '/..//evil.com', '/a/..//evil.com', '/.//evil.com'])
    assert.equal(safeNextPath(bad, ORIGIN), '/', JSON.stringify(bad));
  assert.equal(safeNextPath(undefined, ORIGIN), '/');
  assert.equal(safeNextPath(['/a', '/b'], ORIGIN), '/');
  assert.equal(safeNextPath('', ORIGIN), '/');
});
