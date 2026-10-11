import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseAuthConfig } from './auth.config';
import { admit, callerFromSession } from './auth.server';

const CFG = parseAuthConfig({
  AUTH_SECRET: 's'.repeat(32), AUTH_URL: 'https://ai.example.com',
  POSTGRES_PRISMA_URL: 'postgres://p', POSTGRES_URL_NON_POOLING: 'postgres://d',
  AUTH_OIDC_ISSUER: 'https://id.example.com', AUTH_OIDC_CLIENT_ID: 'c', AUTH_OIDC_CLIENT_SECRET: 's',
  AUTH_ALLOWED_EMAILS: 'me@example.com,@family.example', AUTH_ADMIN_EMAILS: 'me@example.com',
})!;

test('no session is anonymous', () => {
  assert.deepEqual(callerFromSession(CFG, null), { mode: 'anonymous' });
});

test('a listed session is a user with a derived role and a null image', () => {
  assert.deepEqual(callerFromSession(CFG, { user: { id: 'u1', email: 'Me@Example.com', name: 'Me' } }),
    { mode: 'user', user: { id: 'u1', email: 'Me@Example.com', name: 'Me', image: null, role: 'admin' } });
  assert.deepEqual(callerFromSession(CFG, { user: { id: 'u2', email: 'kid@family.example', name: 'Kid', image: 'https://x/y.png' } }),
    { mode: 'user', user: { id: 'u2', email: 'kid@family.example', name: 'Kid', image: 'https://x/y.png', role: 'user' } });
});

test('a session whose address left the allowlist is not_allowed', () => {
  assert.deepEqual(callerFromSession(CFG, { user: { id: 'u3', email: 'gone@example.com', name: 'Gone' } }), { mode: 'not_allowed' });
});

test('admit: fresh provider email must be trusted and listed; unknown providers and missing emails fail closed', () => {
  const oauth = (providerId: string) => ({ oauth: { providerId } });
  assert.equal(admit(CFG, { email: 'kid@family.example', emailVerified: false }, oauth('oidc')), true, 'idp trust needs no claim');
  assert.equal(admit(CFG, { email: 'gone@example.com', emailVerified: true }, oauth('oidc')), false, 'not listed');
  assert.equal(admit(CFG, { email: 'me@example.com', emailVerified: true }, oauth('google')), false, 'google is not configured');
  assert.equal(admit(CFG, { email: 'me@example.com' }, oauth('nope')), false, 'unknown provider');
  assert.equal(admit(CFG, { email: null }, oauth('oidc')), false, 'no email');
  assert.equal(admit(CFG, { email: 'me@example.com' }, {}), false, 'no oauth source');
});
