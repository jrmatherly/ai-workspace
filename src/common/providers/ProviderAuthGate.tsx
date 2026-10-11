/**
 * Client gate behind proxy.ts: a stale or forged cookie passes the optimistic proxy, so the bootstrap effects
 * (Tiktoken preload, stale-model refresh, Models auto-open) wait here until whoami confirms the session.
 * Sits inside `ErrorBoundary outer`, above ProviderBootstrapLogic.
 * The only caller of posthogUser/posthogReset, and the home of the account-switch prompt.
 */
import * as React from 'react';
import { useRouter } from 'next/router';

import { Box, Button, Typography } from '@mui/joy';

import { ConnectionErrorNotice } from '~/common/providers/ProviderBackendCapabilities';
import { SherpaLoading } from '~/common/providers/single-tab/ProviderSingleTab';
import { posthogReset, posthogUser } from '~/common/components/3rdparty/PostHogAnalytics';
import { isAuthPublicPath, ROUTE_SIGNIN, signInPath } from '~/common/app.routes.auth';
import { authSignOut, useAuthUser } from '~/common/auth/auth.client';


const LAST_USER_KEY = 'aiw-auth-last-user';
const AUTH_ERROR_TIMEOUT = 6000;

function readLastUser(): string | null {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

function writeLastUser(userId: string): void {
  try {
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // storage blocked: no stored user to compare, so no switch prompt
  }
}


function AccountSwitchPrompt(props: { onSignOut: () => void; onContinue: () => void }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3, textAlign: 'center' }}>
      <Typography level='title-lg'>Another account used this browser</Typography>
      <Typography level='body-md' sx={{ maxWidth: 440 }}>
        This browser holds chats, keys and settings from another account. They are not separated per user.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant='outlined' color='neutral' onClick={props.onSignOut}>Sign out</Button>
        <Button onClick={props.onContinue}>Continue with this browser&apos;s data</Button>
      </Box>
    </Box>
  );
}


export function ProviderAuthGate(props: { children: React.ReactNode }) {

  // state
  const [errorTimedOut, setErrorTimedOut] = React.useState(false);
  const [signOutFailed, setSignOutFailed] = React.useState(false);
  const [switchAccepted, setSwitchAccepted] = React.useState(false);
  const identified = React.useRef(false);

  // external state
  const auth = useAuthUser();
  const { asPath } = useRouter(); // pathname + search (+ hash)

  // derived state
  const path = asPath.split(/[?#]/)[0];
  const userId = auth.kind === 'user' ? auth.user.id : null;
  const userRole = auth.kind === 'user' ? auth.user.role : null;
  const isPublic = isAuthPublicPath(path);
  const mustRedirect = auth.kind === 'anonymous' && !isPublic;
  const lastUser = React.useMemo(() => userId ? readLastUser() : null, [userId]);
  const switchPending = !!userId && lastUser !== null && lastUser !== userId && !switchAccepted;

  // reset only after an identified session, so anonymous visits keep one distinct id
  React.useEffect(() => {
    if (userId) {
      posthogUser(userId, { aiw_role: userRole });
      identified.current = true;
    } else if (auth.kind === 'anonymous' && identified.current) {
      posthogReset();
      identified.current = false;
    }
  }, [userId, userRole, auth.kind]);

  // first sign-in in this browser: remember the account silently
  React.useEffect(() => {
    if (userId && lastUser === null) writeLastUser(userId);
  }, [userId, lastUser]);

  // full navigation, not router.push: re-runs proxy.ts and drops client state
  React.useEffect(() => {
    if (mustRedirect)
      window.location.assign(signInPath(asPath, location.origin));
  }, [mustRedirect, asPath]);

  React.useEffect(() => {
    if (auth.kind !== 'not_allowed') return;
    posthogReset();
    // local only: Pocket ID's logout returns to the registered /signin and would drop ?error=not_allowed
    authSignOut({ localOnly: true, landing: `${ROUTE_SIGNIN}?error=not_allowed` }).catch(() => setSignOutFailed(true));
  }, [auth.kind]);

  React.useEffect(() => {
    if (auth.kind !== 'error') return;
    const timeout = setTimeout(() => setErrorTimedOut(true), AUTH_ERROR_TIMEOUT);
    return () => {
      clearTimeout(timeout);
      setErrorTimedOut(false);
    };
  }, [auth.kind]);

  const handleContinue = React.useCallback(() => {
    if (userId) writeLastUser(userId);
    setSwitchAccepted(true);
  }, [userId]);

  // public pages (sign-in, news, share viewer) render through a whoami failure: they need no identity
  if (auth.kind === 'error' && isPublic)
    return props.children;

  if ((auth.kind === 'error' && errorTimedOut) || signOutFailed)
    return <ConnectionErrorNotice />;

  if (auth.kind === 'loading' || auth.kind === 'error' || auth.kind === 'not_allowed' || mustRedirect)
    return <SherpaLoading stage='auth' />;

  if (switchPending)
    return <AccountSwitchPrompt onSignOut={() => authSignOut().catch(() => setSignOutFailed(true))} onContinue={handleContinue} />;

  return props.children;
}
