/**
 * The only server file that imports Better Auth. Public surface: AuthUser, AuthCaller, getAuthCaller,
 * authRouteHandlers, and the pure, tested admit and callerFromSession. Callers never see a Better Auth type.
 */
import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';
import { prismaAdapter } from '@better-auth/prisma-adapter';

import { ROUTE_SIGNIN } from '~/common/app.routes.auth';
import { prismaDb } from '~/server/prisma/prismaDb';

import { type AuthConfig, authConfig, type AuthProvider, type AuthProviderId, type AuthRole, isEmailAllowed, isEmailListed, roleFor } from './auth.config';


/** A signed-in person. `id` is Better Auth's User.id: stable across sign-ins and linked providers. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: AuthRole;
}

/** 'off' can never be mistaken for 'anonymous'; 'not_allowed' is a valid session whose address left the allowlist. */
export type AuthCaller =
  | { mode: 'off' }
  | { mode: 'anonymous' }
  | { mode: 'not_allowed' }
  | { mode: 'user'; user: AuthUser };


/**
 * validateUserInfo policy, applied to every OAuth sign-in and sign-up alike: the fresh provider email must pass
 * isEmailAllowed, which fails closed on a provider id that is not configured. getAuthCaller re-checks the stored
 * email on every request on top of this.
 */
export function admit(config: AuthConfig, user: { email?: string | null; emailVerified?: boolean | null }, source: { oauth?: { providerId: string } }): boolean {
  const providerId = source.oauth?.providerId;
  return !!providerId && !!user.email && isEmailAllowed(config, providerId, user.email, !!user.emailVerified);
}

function providerOf<I extends AuthProviderId>(config: AuthConfig, id: I): Extract<AuthProvider, { id: I }> | undefined {
  return config.providers.find((p): p is Extract<AuthProvider, { id: I }> => p.id === id);
}

function createBetterAuth(config: AuthConfig) {
  const oidc = providerOf(config, 'oidc');
  const google = providerOf(config, 'google');
  const github = providerOf(config, 'github');
  const microsoft = providerOf(config, 'microsoft');
  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    database: prismaAdapter(prismaDb, { provider: 'postgresql' }),
    // cookie cache: a revoked session stays valid up to 5 min per browser; getAuthCaller forwards the refreshed Set-Cookie (non-streaming responses only)
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
    socialProviders: {
      ...(google && { google: { clientId: google.clientId, clientSecret: google.clientSecret } }),
      ...(github && { github: { clientId: github.clientId, clientSecret: github.clientSecret } }),
      ...(microsoft && {
        microsoft: {
          clientId: microsoft.clientId, clientSecret: microsoft.clientSecret, tenantId: microsoft.tenantId,
          // no Graph photo fetch, image stays empty
          disableProfilePhoto: true,
        },
      }),
    },
    plugins: oidc ? [genericOAuth({
      config: [{
        providerId: 'oidc', discoveryUrl: oidc.discoveryUrl, clientId: oidc.clientId, clientSecret: oidc.clientSecret,
        scopes: ['openid', 'email', 'profile'],
        requireIdTokenVerification: true,
        // RP-initiated logout: register this URL as a logout callback in Pocket ID
        postLogoutRedirectURI: `${config.baseURL}${ROUTE_SIGNIN}`,
      }],
    })] : [],
    user: {
      validateUserInfo: ({ user, source }) => admit(config, user, source)
        ? undefined
        : { error: 'email_not_allowed', errorDescription: 'This account is not allowed on this workspace' },
    },
    account: {
      // Pocket ID and pinned-tenant Microsoft link to a same-email user without the claim; Google/GitHub need it verified
      accountLinking: { enabled: true, trustedProviders: ['oidc', 'microsoft'] },
      encryptOAuthTokens: true,
    },
  });
}

type BetterAuthInstance = ReturnType<typeof createBetterAuth>;

/**
 * Lazy: nothing runs on import, so anonymous procedures never construct Better Auth or touch Postgres.
 * Better Auth omits an OIDC provider whose discovery failed until the instance is recreated. Keep the instance
 * (the other providers keep working) and rebuild at most once per 60 s until discovery succeeds; each rebuild is
 * a fresh instance, so the in-memory /api/auth rate limiter restarts with it.
 */
let memo: Promise<BetterAuthInstance> | null = null;
let retryAfter = 0;

function getAuth(config: AuthConfig): Promise<BetterAuthInstance> {
  if (memo && retryAfter && Date.now() >= retryAfter) {
    memo = null;
    retryAfter = 0;
  }
  memo ??= (async () => {
    const auth = createBetterAuth(config);
    if (config.providers.some(p => p.id === 'oidc')) {
      const ctx = await auth.$context;
      if (!ctx.socialProviders.some(p => p.id === 'oidc')) {
        console.warn('[auth] OIDC discovery unavailable; retrying in 60 s');
        retryAfter = Date.now() + 60_000;
      }
    }
    return auth;
  })().catch(error => {
    memo = null;
    throw error;
  });
  return memo;
}


type SessionLike = { user: { id: string; email: string; name: string; image?: string | null } };

/** Pure mapping from a Better Auth session to the caller; re-applies allowlist membership and role per request. */
export function callerFromSession(config: AuthConfig, session: SessionLike | null): AuthCaller {
  if (!session) return { mode: 'anonymous' };
  const { id, email, name, image } = session.user;
  if (!isEmailListed(config, email)) return { mode: 'not_allowed' };
  return { mode: 'user', user: { id, email, name, image: image ?? null, role: roleFor(config, email) } };
}

/**
 * Resolve the caller from the request cookie. A bad or missing session is 'anonymous'; throws only on infrastructure
 * failure (instance build, database). Better Auth's Set-Cookie (cookie cache refresh, session extension) is forwarded
 * to resHeaders.
 */
export async function getAuthCaller(headers: Headers, resHeaders: Headers): Promise<AuthCaller> {
  if (!authConfig) return { mode: 'off' };
  const auth = await getAuth(authConfig);
  const { headers: setHeaders, response: session } = await auth.api.getSession({ headers, returnHeaders: true });
  for (const cookie of setHeaders.getSetCookie()) resHeaders.append('set-cookie', cookie);
  return callerFromSession(authConfig, session);
}

async function handleAuthRoute(req: Request): Promise<Response> {
  if (!authConfig) return new Response(null, { status: 404 });
  return (await getAuth(authConfig)).handler(req);
}

/** /api/auth/* handlers. Auth off: 404, so the endpoints do not exist on auth-less deployments. */
export const authRouteHandlers = { GET: handleAuthRoute, POST: handleAuthRoute };
