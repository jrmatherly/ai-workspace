/**
 * Auth configuration and policy: env -> AuthConfig, plus the pure predicates (who may sign in, who is admin).
 * No IO, no Better Auth, no Prisma: proxy.ts, backend.router.ts and tests load this without a database.
 * Invariant: authConfig === null <=> no provider is configured <=> the app behaves exactly as before auth existed.
 * Misconfiguration throws at module load, so the probe on backend.listCapabilities fails loudly instead of the
 * app running half-protected.
 */
import { env } from '~/server/env.server';


/** Doubles as the Better Auth provider id and the :providerId in /api/auth/callback/:providerId. */
export type AuthProviderId = 'oidc' | 'google' | 'github' | 'microsoft';

/**
 * `open` providers admit anyone on the internet; `closed` ones only users the IdP holds.
 * emailTrust 'idp': the IdP's user list is the gate, its email is accepted without an email_verified claim
 * (Pocket ID; Microsoft under one pinned tenant). 'claim': trusted only when the provider reports it verified.
 */
export type AuthProvider =
  | { id: 'oidc'; label: string; discoveryUrl: string; clientId: string; clientSecret: string; access: 'closed'; emailTrust: 'idp' }
  | { id: 'google'; label: 'Google'; clientId: string; clientSecret: string; access: 'open'; emailTrust: 'claim' }
  | { id: 'github'; label: 'GitHub'; clientId: string; clientSecret: string; access: 'open'; emailTrust: 'claim' }
  | { id: 'microsoft'; label: 'Microsoft'; clientId: string; clientSecret: string; tenantId: string; access: 'closed'; emailTrust: 'idp' };

export interface AuthConfig {
  providers: readonly [AuthProvider, ...AuthProvider[]];
  secret: string;
  /** AUTH_URL without a trailing slash */
  baseURL: string;
  /** Exact addresses and whole domains ('@example.com'), lower-cased. null = no allowlist, legal only when every provider is closed. */
  allowedEmails: readonly string[] | null;
  adminEmails: readonly string[];
}

export type AuthRole = 'admin' | 'user';

export type AuthEnv = Partial<Pick<typeof env,
  | 'AUTH_SECRET' | 'AUTH_URL'
  | 'AUTH_OIDC_ISSUER' | 'AUTH_OIDC_NAME' | 'AUTH_OIDC_CLIENT_ID' | 'AUTH_OIDC_CLIENT_SECRET'
  | 'AUTH_GOOGLE_CLIENT_ID' | 'AUTH_GOOGLE_CLIENT_SECRET'
  | 'AUTH_GITHUB_CLIENT_ID' | 'AUTH_GITHUB_CLIENT_SECRET'
  | 'AUTH_MICROSOFT_CLIENT_ID' | 'AUTH_MICROSOFT_CLIENT_SECRET' | 'AUTH_MICROSOFT_TENANT_ID'
  | 'AUTH_ALLOWED_EMAILS' | 'AUTH_ADMIN_EMAILS'
  | 'POSTGRES_PRISMA_URL' | 'POSTGRES_URL_NON_POOLING'>>;

const MULTI_TENANT_AUTHORITIES = ['common', 'organizations', 'consumers'];


/** All of a provider's vars, or none. Some-but-not-all is a deploy bug, not "provider off". */
function allOrNone<K extends keyof AuthEnv>(e: AuthEnv, keys: readonly K[]): Record<K, string> | null {
  const missing = keys.filter(k => !e[k]);
  if (missing.length === keys.length) return null;
  if (missing.length)
    throw new Error(`Auth misconfigured: ${keys.filter(k => !missing.includes(k)).join(', ')} set without ${missing.join(', ')}`);
  return Object.fromEntries(keys.map(k => [k, e[k]])) as Record<K, string>;
}

const ADDRESS = /^[^@\s]+@[^@\s]+$/;
const DOMAIN_RULE = /^@[^@\s]+$/;

function normEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Comma-separated, trimmed, lower-cased, blanks dropped. */
function emailList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(normEmail).filter(Boolean);
}

export function parseAuthConfig(e: AuthEnv): AuthConfig | null {
  const providers: AuthProvider[] = [];

  const oidc = allOrNone(e, ['AUTH_OIDC_ISSUER', 'AUTH_OIDC_CLIENT_ID', 'AUTH_OIDC_CLIENT_SECRET']);
  if (oidc) providers.push({
    id: 'oidc', label: e.AUTH_OIDC_NAME || 'Pocket ID',
    discoveryUrl: oidc.AUTH_OIDC_ISSUER.replace(/\/+$/, '') + '/.well-known/openid-configuration',
    clientId: oidc.AUTH_OIDC_CLIENT_ID, clientSecret: oidc.AUTH_OIDC_CLIENT_SECRET, access: 'closed', emailTrust: 'idp',
  });

  const google = allOrNone(e, ['AUTH_GOOGLE_CLIENT_ID', 'AUTH_GOOGLE_CLIENT_SECRET']);
  if (google) providers.push({
    id: 'google', label: 'Google', clientId: google.AUTH_GOOGLE_CLIENT_ID, clientSecret: google.AUTH_GOOGLE_CLIENT_SECRET, access: 'open', emailTrust: 'claim',
  });

  const github = allOrNone(e, ['AUTH_GITHUB_CLIENT_ID', 'AUTH_GITHUB_CLIENT_SECRET']);
  if (github) providers.push({
    id: 'github', label: 'GitHub', clientId: github.AUTH_GITHUB_CLIENT_ID, clientSecret: github.AUTH_GITHUB_CLIENT_SECRET, access: 'open', emailTrust: 'claim',
  });

  const microsoft = allOrNone(e, ['AUTH_MICROSOFT_CLIENT_ID', 'AUTH_MICROSOFT_CLIENT_SECRET', 'AUTH_MICROSOFT_TENANT_ID']);
  if (microsoft) {
    if (MULTI_TENANT_AUTHORITIES.includes(microsoft.AUTH_MICROSOFT_TENANT_ID.toLowerCase()))
      throw new Error('Auth misconfigured: AUTH_MICROSOFT_TENANT_ID must be one concrete tenant id, not common, organizations or consumers');
    providers.push({
      id: 'microsoft', label: 'Microsoft', clientId: microsoft.AUTH_MICROSOFT_CLIENT_ID, clientSecret: microsoft.AUTH_MICROSOFT_CLIENT_SECRET,
      tenantId: microsoft.AUTH_MICROSOFT_TENANT_ID, access: 'closed', emailTrust: 'idp',
    });
  }

  const [first, ...rest] = providers;
  if (!first) return null;

  const required = (key: keyof AuthEnv) => new Error(`Auth misconfigured: ${key} is required when an AUTH_* provider is set`);
  const { AUTH_SECRET: secret, AUTH_URL: url } = e;
  if (!secret) throw required('AUTH_SECRET');
  if (!url) throw required('AUTH_URL');
  if (!e.POSTGRES_PRISMA_URL) throw required('POSTGRES_PRISMA_URL');
  if (!e.POSTGRES_URL_NON_POOLING) throw required('POSTGRES_URL_NON_POOLING');

  // a blank list is no list: open providers then fail the next check instead of locking everyone out
  const listed = emailList(e.AUTH_ALLOWED_EMAILS);
  const allowedEmails = listed.length ? listed : null;
  // 'family.example' without the '@' would be an address nobody has: reject at load instead of locking everyone out
  const malformed = listed.filter(rule => !ADDRESS.test(rule) && !DOMAIN_RULE.test(rule));
  if (malformed.length)
    throw new Error(`Auth misconfigured: AUTH_ALLOWED_EMAILS entries must be an address or @domain, got ${malformed.join(', ')}`);
  if (!allowedEmails && providers.some(p => p.access === 'open'))
    throw new Error('Auth misconfigured: AUTH_ALLOWED_EMAILS is required when Google or GitHub is set');

  const config: AuthConfig = { providers: [first, ...rest], secret, baseURL: url.replace(/\/+$/, ''), allowedEmails, adminEmails: emailList(e.AUTH_ADMIN_EMAILS) };

  // roleFor matches exact addresses: a '@domain' entry or an address outside the allowlist would silently make nobody admin
  const notAddress = config.adminEmails.filter(entry => !ADDRESS.test(entry));
  if (notAddress.length)
    throw new Error(`Auth misconfigured: AUTH_ADMIN_EMAILS entries must be an address, got ${notAddress.join(', ')}`);
  const unlisted = config.adminEmails.filter(entry => !isEmailListed(config, entry));
  if (unlisted.length)
    throw new Error(`Auth misconfigured: AUTH_ADMIN_EMAILS entries ${unlisted.join(', ')} are not on AUTH_ALLOWED_EMAILS`);

  return config;
}

/** Parsed once at module load. Everything else reads this, never process.env. */
export const authConfig: AuthConfig | null = parseAuthConfig(env);

/** What /signin and listCapabilities show. Empty <=> auth off. */
export const authProvidersInfo: { id: AuthProviderId; label: string }[] =
  authConfig?.providers.map(p => ({ id: p.id, label: p.label })) ?? [];


/** An id outside the configured providers (or outside AuthProviderId at all) is never trusted. */
export function isEmailTrusted(config: AuthConfig, providerId: string, emailVerified: boolean): boolean {
  const provider = config.providers.find(p => p.id === providerId);
  if (!provider) return false;
  return provider.emailTrust === 'idp' || emailVerified;
}

/** Who may sign in: applied at sign-in by Better Auth validateUserInfo. */
export function isEmailAllowed(config: AuthConfig, providerId: string, email: string, emailVerified: boolean): boolean {
  return isEmailTrusted(config, providerId, emailVerified) && isEmailListed(config, email);
}

/** Per-request re-check: address membership only; verification was settled at sign-in. */
export function isEmailListed(config: AuthConfig, email: string): boolean {
  if (config.allowedEmails === null) return true;
  const address = normEmail(email);
  return config.allowedEmails.some(rule => rule.startsWith('@') ? address.endsWith(rule) : address === rule);
}

/** Derived per request; AUTH_ADMIN_EMAILS is the single source of truth. */
export function roleFor(config: AuthConfig, email: string): AuthRole {
  return config.adminEmails.includes(normEmail(email)) ? 'admin' : 'user';
}
