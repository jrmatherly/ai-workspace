import { test } from 'node:test';
import assert from 'node:assert/strict';

import { type AuthConfig, type AuthEnv, isEmailAllowed, isEmailListed, isEmailTrusted, parseAuthConfig, roleFor } from './auth.config';

const BASE = {
  AUTH_SECRET: 's'.repeat(32),
  AUTH_URL: 'https://ai.example.com/',
  POSTGRES_PRISMA_URL: 'postgres://u:p@db/x?pgbouncer=true',
  POSTGRES_URL_NON_POOLING: 'postgres://u:p@db/x',
};
const OIDC = { AUTH_OIDC_ISSUER: 'https://id.example.com/', AUTH_OIDC_CLIENT_ID: 'cid', AUTH_OIDC_CLIENT_SECRET: 'csec' };

test('nothing set -> null (auth off), secrets alone do not turn it on', () => {
  assert.equal(parseAuthConfig({}), null);
  assert.equal(parseAuthConfig(BASE), null);
});

test('pocket id only: closed provider, no allowlist needed, clean discovery url and base url', () => {
  const cfg = parseAuthConfig({ ...BASE, ...OIDC });
  assert.ok(cfg);
  assert.deepEqual(cfg.providers[0], {
    id: 'oidc', label: 'Pocket ID', discoveryUrl: 'https://id.example.com/.well-known/openid-configuration',
    clientId: 'cid', clientSecret: 'csec', access: 'closed', emailTrust: 'idp',
  });
  assert.equal(cfg.baseURL, 'https://ai.example.com');
  assert.equal(cfg.allowedEmails, null);
  assert.equal(parseAuthConfig({ ...BASE, ...OIDC, AUTH_OIDC_NAME: 'Home ID' })!.providers[0].label, 'Home ID');
});

test('half a provider throws naming the missing var', () => {
  assert.throws(() => parseAuthConfig({ ...BASE, AUTH_GITHUB_CLIENT_ID: 'x' }), /AUTH_GITHUB_CLIENT_SECRET/);
  assert.throws(() => parseAuthConfig({ ...BASE, AUTH_GOOGLE_CLIENT_SECRET: 'x', AUTH_ALLOWED_EMAILS: 'a@b.c' }), /AUTH_GOOGLE_CLIENT_ID/);
  assert.throws(() => parseAuthConfig({ ...BASE, AUTH_OIDC_ISSUER: 'https://id.example.com' }), /AUTH_OIDC_CLIENT_ID, AUTH_OIDC_CLIENT_SECRET/);
});

test('open provider without AUTH_ALLOWED_EMAILS throws', () => {
  assert.throws(() => parseAuthConfig({ ...BASE, AUTH_GOOGLE_CLIENT_ID: 'g', AUTH_GOOGLE_CLIENT_SECRET: 'gs' }), /AUTH_ALLOWED_EMAILS/);
  assert.throws(() => parseAuthConfig({ ...BASE, ...OIDC, AUTH_GITHUB_CLIENT_ID: 'h', AUTH_GITHUB_CLIENT_SECRET: 'hs' }), /AUTH_ALLOWED_EMAILS/);
  assert.throws(() => parseAuthConfig({ ...BASE, AUTH_GOOGLE_CLIENT_ID: 'g', AUTH_GOOGLE_CLIENT_SECRET: 'gs', AUTH_ALLOWED_EMAILS: ' , ' }), /AUTH_ALLOWED_EMAILS/, 'blank list is no list');
});

test('microsoft needs a concrete tenant', () => {
  const MS = { AUTH_MICROSOFT_CLIENT_ID: 'm', AUTH_MICROSOFT_CLIENT_SECRET: 'ms' };
  assert.throws(() => parseAuthConfig({ ...BASE, ...MS }), /AUTH_MICROSOFT_TENANT_ID/);
  for (const t of ['common', 'organizations', 'consumers', 'Common', 'ORGANIZATIONS'])
    assert.throws(() => parseAuthConfig({ ...BASE, ...MS, AUTH_MICROSOFT_TENANT_ID: t }), /concrete tenant/, t);
  const cfg = parseAuthConfig({ ...BASE, ...MS, AUTH_MICROSOFT_TENANT_ID: '11111111-2222-3333-4444-555555555555' });
  assert.equal(cfg?.providers[0].id, 'microsoft');
  assert.equal(cfg?.providers[0].access, 'closed');
});

test('missing secret, url or either postgres url throws when a provider is set', () => {
  for (const key of ['AUTH_SECRET', 'AUTH_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'] as const) {
    const e: AuthEnv = { ...BASE, ...OIDC, [key]: undefined };
    assert.throws(() => parseAuthConfig(e), new RegExp(key), key);
  }
});

const CFG: AuthConfig = parseAuthConfig({
  ...BASE, ...OIDC,
  AUTH_GOOGLE_CLIENT_ID: 'g', AUTH_GOOGLE_CLIENT_SECRET: 'gs',
  AUTH_MICROSOFT_CLIENT_ID: 'm', AUTH_MICROSOFT_CLIENT_SECRET: 'ms', AUTH_MICROSOFT_TENANT_ID: 'tenant-1',
  AUTH_ALLOWED_EMAILS: ' Me@Example.com , @family.example ,',
  AUTH_ADMIN_EMAILS: 'ME@example.com',
})!;

test('allowlist: addresses and @domains, trimmed and lower-cased, no subdomain or suffix match', () => {
  assert.equal(isEmailListed(CFG, 'me@example.com'), true);
  assert.equal(isEmailListed(CFG, '  ME@EXAMPLE.COM '), true);
  assert.equal(isEmailListed(CFG, 'kid@family.example'), true);
  assert.equal(isEmailListed(CFG, 'kid@sub.family.example'), false);
  assert.equal(isEmailListed(CFG, 'kid@notfamily.example'), false);
  assert.equal(isEmailListed(CFG, 'other@example.com'), false);
});

test('email trust is per provider', () => {
  assert.equal(isEmailTrusted(CFG, 'oidc', false), true);
  assert.equal(isEmailTrusted(CFG, 'microsoft', false), true);
  assert.equal(isEmailTrusted(CFG, 'google', false), false);
  assert.equal(isEmailTrusted(CFG, 'google', true), true);
  assert.equal(isEmailTrusted(CFG, 'github', true), false, 'github is not configured');
  assert.equal(isEmailAllowed(CFG, 'google', 'me@example.com', true), true);
  assert.equal(isEmailAllowed(CFG, 'google', 'me@example.com', false), false);
  assert.equal(isEmailAllowed(CFG, 'google', 'me@evil.com', true), false);
  assert.equal(isEmailAllowed(CFG, 'oidc', 'kid@family.example', false), true);
  assert.equal(isEmailAllowed(CFG, 'microsoft', 'me@example.com', false), true);
});

test('null allowlist admits every trusted email; roles come from AUTH_ADMIN_EMAILS', () => {
  const open = parseAuthConfig({ ...BASE, ...OIDC })!;
  assert.equal(isEmailListed(open, 'anyone@anywhere.org'), true);
  assert.equal(isEmailAllowed(open, 'oidc', 'anyone@anywhere.org', false), true);
  assert.equal(roleFor(CFG, 'Me@Example.com'), 'admin');
  assert.equal(roleFor(CFG, 'kid@family.example'), 'user');
  assert.equal(roleFor(open, 'me@example.com'), 'user');
});
