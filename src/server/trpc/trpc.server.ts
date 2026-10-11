/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import * as z from 'zod/v4';
import { initTRPC, TRPCError } from '@trpc/server';
import { getAuthCaller, type AuthCaller, type AuthUser } from '~/server/auth/auth.server';
import { transformer } from './trpc.transformer';
import { TRPCFetcherError } from './trpc.router.fetchers';


/**
 * Type of the Context object passed to procedures/resolvers, to avoid circular dependencies.
 */
export type ChatGenerateContentContext = Awaited<ReturnType<typeof createTRPCFetchContext>>;


/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
export const createTRPCFetchContext = async ({ req, resHeaders }: FetchCreateContextFnOptions) => {
  // resolved at most once per request, and only by the guards (and whoami): anonymous procedures never touch it
  let caller: Promise<AuthCaller> | null = null;
  return {
    // only used by Backend Analytics; attacker-controlled (Host header), never trust it
    hostName: req.headers?.get('host') ?? 'localhost',
    // enables cancelling upstream requests when the downstream request is aborted
    reqSignal: req.signal,
    // Better Auth's Set-Cookie (cookie cache refresh) and whoami's Cache-Control
    resHeaders,
    // who is calling: identity enters here only; resolvers read ctx.user
    caller: (): Promise<AuthCaller> => caller ??= getAuthCaller(req.headers, resHeaders),
  };
};


/**
 * 2. SERVER-SIDE INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCFetchContext>().create({
  // server transformer - serialize: -> client, deserialize: <- client
  transformer: transformer,
  errorFormatter({ shape, error }) {

    // Important: remove the 'stack' from the error data to avoid leaking internals and shorten the payload
    const { stack, ...nonStackData } = shape.data;

    // Enable client-side decisions: communicate fetcher/network error details downstream
    const fetcherError = error instanceof TRPCFetcherError ? {
      aixFCategory: error.category,
      aixFHttpStatus: error.httpStatus ?? null,
      aixFNetError: error.connErrorName ?? null,
    } : {};

    return {
      ...shape,
      data: {
        ...nonStackData,
        ...fetcherError,
        zodError:
          error.cause instanceof z.ZodError ? z.treeifyError(error.cause) : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @link https://trpc.io/docs/v11/router
 */
export const createTRPCRouter = t.router;

/** Infrastructure failures (database down on a cache miss, discovery error) become a detail-free 500. */
export async function resolveCaller(ctx: { caller: () => Promise<AuthCaller> }): Promise<AuthCaller> {
  try {
    return await ctx.caller();
  } catch (error) {
    console.error('[auth] caller resolution failed:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Authentication unavailable' });
  }
}

/**
 * The member gate. Guards throw before next(), so for the AIX async-generator mutation nothing streams and no vendor
 * request starts. After a guard, ctx.user is an AuthUser when signed in and null when auth is off for this deployment.
 * Exhaustive over AuthCaller: a new mode fails to compile here instead of passing the guard.
 */
async function memberOrThrow(ctx: { caller: () => Promise<AuthCaller> }): Promise<AuthUser | null> {
  const caller = await resolveCaller(ctx);
  switch (caller.mode) {
    case 'off':
      return null;
    case 'user':
      return caller.user;
    case 'anonymous':
    case 'not_allowed':
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in required' });
    default:
      return caller satisfies never;
  }
}

const requireMember = t.middleware(async ({ ctx, next }) => {
  const user = await memberOrThrow(ctx);
  return next({ ctx: { user } });
});

const requireAdmin = t.middleware(async ({ ctx, next }) => {
  const user = await memberOrThrow(ctx);
  if (user && user.role !== 'admin')
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required' });
  return next({ ctx: { user } });
});

/**
 * FAIL-CLOSED BY DEFAULT. Here `publicProcedure` means "the app's API, open to members": with auth on it rejects
 * callers without a session, with auth off it passes everything. The upstream name is kept so call sites stay
 * byte-identical and a newly ported upstream procedure arrives gated. The open surface is anonymousProcedure.
 * So *.access.ts resolvers, where the client key wins over the env key, are reachable only by members.
 */
export const publicProcedure = t.procedure.use(requireMember);

/** No identity required. Exactly the paths in ANONYMOUS_PROCEDURES. */
export const anonymousProcedure = t.procedure;

/** The complete anonymous surface; trpc.access.test.ts pins it. Changing it is a reviewed decision. */
export const ANONYMOUS_PROCEDURES = ['backend.listCapabilities', 'backend.whoami', 'trade.storageGet'] as const;

/** Same gate as publicProcedure; kept for upstream ports. */
export const authedProcedure = publicProcedure;

/** No tiers on this line: premium == member. */
export const premiumProcedure = publicProcedure;

/** No per-user feature flags yet: gated == member. */
export const authGatedProcedure = publicProcedure;

/** Role 'admin' from AUTH_ADMIN_EMAILS. Passes everything when auth is off. */
export const tenantAdminProcedure = t.procedure.use(requireAdmin);

/** Server-side caller, used by trpc.access.test.ts. */
export const createCallerFactory = t.createCallerFactory;
