import * as React from 'react';
import { useRouter } from 'next/router';

import { Box, Button, Typography } from '@mui/joy';

import { InlineError } from '~/common/components/InlineError';
import { authSignIn, useAuthUser } from '~/common/auth/auth.client';
import { SIGN_IN_START_FAILED, signInErrorText } from '~/common/auth/signInErrorText';
import { getAuthProviders } from '~/common/app.serverconf';
import { safeNextPath } from '~/common/app.routes.auth';
import { navigateToIndex, useRouterQuery } from '~/common/app.routes';
import { withNextJSPerPageLayout } from '~/common/layout/withLayout';


const ERROR_SESSION = 'Could not check your session. Reload to try again.';


function SignInPage(props: { next: string; error: string | null }) {

  // state
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [signInError, setSignInError] = React.useState<string | null>(null);

  // external state
  const auth = useAuthUser();
  const router = useRouter();
  const providers = getAuthProviders();

  // auth off: there is no sign-in screen; signed in: continue (once the query is known, so `next` is not lost)
  React.useEffect(() => {
    if (!router.isReady) return;
    if (auth.kind === 'off') void navigateToIndex(true);
    else if (auth.kind === 'user') void router.replace(props.next);
  }, [auth.kind, props.next, router]);

  // Back from the IdP restores this page from the bfcache with the busy state still set
  React.useEffect(() => {
    const reset = (event: PageTransitionEvent) => event.persisted && setPendingId(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // a failed sign-in start (e.g. Pocket ID unregistered after failed discovery; the server retries every 60 s) takes precedence over ?error=
  const errorText = signInError
    ?? (auth.kind === 'error' ? ERROR_SESSION : null)
    ?? signInErrorText(props.error);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: { xs: 3, md: 6 } }}>
      <Typography level='title-lg'>Sign in</Typography>
      {!!errorText && <InlineError severity='danger' error={errorText} />}
      {providers.map(provider => (
        <Button
          key={provider.id}
          variant='outlined'
          color='neutral'
          loading={pendingId === provider.id}
          disabled={!!pendingId}
          onClick={() => {
            setPendingId(provider.id);
            setSignInError(null);
            authSignIn(provider.id, props.next).catch((error: unknown) => {
              console.warn('[auth] sign-in start failed:', error);
              setPendingId(null);
              setSignInError(SIGN_IN_START_FAILED);
            });
          }}
          sx={{ minWidth: 260 }}
        >
          Continue with {provider.label}
        </Button>
      ))}
    </Box>
  );
}


/** Public page. Content renders after hydration (ProviderSingleTab shows a placeholder until then), so `location` is safe. */
export default withNextJSPerPageLayout({ type: 'container' }, () => {
  const { next, error } = useRouterQuery<{ next?: string | string[]; error?: string | string[] }>();
  return <SignInPage next={safeNextPath(next, location.origin)} error={typeof error === 'string' ? error : null} />;
});
