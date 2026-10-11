/**
 * The auth module boundary: identity is read only through getAuthCaller. The Better Auth backend goes behind it.
 */
import { authConfig, type AuthRole } from './auth.config';


/** A signed-in person. `id` is stable across sign-ins and linked providers. */
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

/** The session authority. Throws only on infrastructure failure; the tRPC guards turn that into a 500. */
export async function getAuthCaller(_headers: Headers, _resHeaders: Headers): Promise<AuthCaller> {
  if (!authConfig) return { mode: 'off' };
  throw new Error('auth backend not installed');
}
