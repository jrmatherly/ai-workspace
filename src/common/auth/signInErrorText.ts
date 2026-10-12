/**
 * User-facing text for the `?error=<code>` the sign-in page receives: Better Auth's OAuth callback codes
 * (better-auth/dist/oauth2/errors.mjs), our validateUserInfo code, and the gate's not_allowed. Zero imports.
 */
const ERROR_TEXT: Record<string, string> = {
  email_not_allowed: 'This account is not allowed on this workspace.',
  not_allowed: 'This account is no longer allowed on this workspace.',
  // refused links are not retries: the same button gives the same answer (Better Auth reports a refused implicit link
  // as "account not linked", which the callback turns into this code; unable_to_link_account is the explicit-link path)
  account_not_linked: 'This sign-in could not be linked to your existing account. Use the provider you signed up with.',
  email_does_not_match: 'This sign-in could not be linked: the provider reports a different email than your existing account. Use the provider you signed up with.',
  account_already_linked_to_different_user: 'This provider account is already linked to another user.',
  email_not_verified: 'This provider has not verified your email address. Verify it there, then sign in again.',
  email_not_found: 'This provider did not share an email address. Use another provider.',
};

/** Any other code (provider_not_found, invalid_code, state_not_found, ...) is transient from the user's side. */
const ERROR_FALLBACK = 'Sign-in with this provider is unavailable right now. Try again.';

export function signInErrorText(code: string | null | undefined): string | null {
  return code ? ERROR_TEXT[code] ?? ERROR_FALLBACK : null;
}

/** For a sign-in start that failed in the browser (fetch error, provider unregistered). */
export const SIGN_IN_START_FAILED = ERROR_FALLBACK;
