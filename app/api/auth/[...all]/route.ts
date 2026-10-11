// Better Auth endpoints (/api/auth/sign-in/social, /callback/:providerId, /sign-out, /get-session). 404 when auth is off.
import { authRouteHandlers } from '~/server/auth/auth.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, POST } = authRouteHandlers;
