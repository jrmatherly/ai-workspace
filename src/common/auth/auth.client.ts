/**
 * Client auth: the only client file that imports Better Auth. Pages, nav and the gate import from here.
 * No PostHog calls and no account-switch logic here: both live in ProviderAuthGate.
 */
import { createAuthClient } from 'better-auth/react';

import type { AuthProviderInfo } from '~/modules/backend/store-backend-capabilities';
import type { AuthUser } from '~/server/auth/auth.server';

import { addSnackbar, removeSnackbar } from '~/common/components/snackbar/useSnackbarsStore';
import { logger } from '~/common/logger';
import { getAuthProviders } from '~/common/app.serverconf';
import { ROUTE_SIGNIN, signInPath } from '~/common/app.routes.auth';
import { apiQuery } from '~/common/util/trpc.client';


// same origin, /api/auth; generic OIDC signs in through signIn.social too, so no client plugin
const authClient = createAuthClient();

/**
 * 'off'         no provider configured; whoami is never queried
 * 'loading'     whoami in flight
 * 'error'       whoami failed (network, or a 500 from an infrastructure failure)
 * 'anonymous'   no session
 * 'not_allowed' valid session, address no longer on AUTH_ALLOWED_EMAILS
 * 'user'        signed in
 */
export type AuthState =
  | { kind: 'off' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'anonymous' }
  | { kind: 'not_allowed' }
  | { kind: 'user'; user: AuthUser };

/** Mounted under ProviderBackendCapabilities (by construction of _app.tsx), so the provider list is known. */
export function useAuthUser(): AuthState {
  const enabled = getAuthProviders().length > 0;
  const query = apiQuery.backend.whoami.useQuery(undefined, { enabled, staleTime: Infinity, retry: 1 });
  if (!enabled) return { kind: 'off' };
  if (query.isPending) return { kind: 'loading' };
  if (query.isError) return { kind: 'error' };
  switch (query.data.mode) {
    case 'off':
      return { kind: 'off' };
    case 'anonymous':
      return { kind: 'anonymous' };
    case 'not_allowed':
      return { kind: 'not_allowed' };
    case 'user':
      return { kind: 'user', user: query.data.user };
  }
}

/**
 * Full navigation to the provider; returns to `nextPath` (already passed through safeNextPath).
 * signIn.social resolves `{ error }` on a 4xx instead of throwing (PROVIDER_NOT_FOUND when Pocket ID discovery
 * failed), so the error is rethrown here for the caller to show.
 */
export async function authSignIn(providerId: AuthProviderInfo['id'], nextPath: string): Promise<void> {
  const { error } = await authClient.signIn.social({
    provider: providerId,
    callbackURL: nextPath, // the gate runs on arrival: account-switch check, PostHog identify
    errorCallbackURL: signInPath(nextPath, window.location.origin), // Better Auth appends &error=<code>
  });
  if (error) throw new Error(error.message ?? error.statusText ?? 'sign-in failed');
}

/**
 * Ends the Better Auth session, then does a full navigation. Pocket ID continues to its end_session_endpoint, which
 * returns to the registered /signin; other providers go to `landing`.
 * `localOnly` skips the IdP logout URL and goes straight to `landing`, so a query on it (?error=not_allowed) survives.
 * Throws when the session could not be ended, so the caller never navigates while still signed in.
 */
export async function authSignOut({ localOnly = false, landing = ROUTE_SIGNIN }: { localOnly?: boolean; landing?: string } = {}): Promise<void> {
  const { data, error } = await authClient.signOut({ callbackURL: ROUTE_SIGNIN, disableRedirect: true });
  if (error) throw new Error(error.message ?? error.statusText ?? 'sign-out failed');
  window.location.assign(!localOnly && data?.url ? data.url : landing);
}

let signOutNoticeKey: string | null = null;

/** The account menus' Sign out: the session is still live after a failure, so the user is told instead of a console line. */
export function authSignOutFromMenu(): void {
  authSignOut().catch((error: unknown) => {
    logger.error('Sign-out failed', { error }, 'auth');
    // addSnackbar suffixes the key and queues repeats: drop the previous notice so retries show one
    if (signOutNoticeKey) removeSnackbar(signOutNoticeKey);
    signOutNoticeKey = addSnackbar({ key: 'auth-sign-out-failed', message: 'Could not sign out. Check the connection and try again.', type: 'issue' });
  });
}
