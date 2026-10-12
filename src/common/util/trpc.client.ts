// noinspection JSUnresolvedReference

/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { createTRPCClient, httpBatchStreamLink, httpLink, loggerLink, type TRPCLink } from '@trpc/client';
import { tap } from '@trpc/server/observable';
import { createTRPCNext } from '@trpc/next';

import type { AppRouter } from '~/server/trpc/trpc.router';
import { transformer } from '~/server/trpc/trpc.transformer';

import { getBaseUrl } from './urlUtils';
import { isAbortErrorLike } from './abortUtils';
import { logger } from '../logger';
import { getAuthProviders } from '../app.serverconf';
import { isAuthPublicPath, signInPath } from '../app.routes.auth';
import { reactQueryClientSingleton } from '../app.queryclient';



const enableLoggerLink = (opts: any) => {
  return process.env.NODE_ENV === 'development' ||
    (opts.direction === 'down' && opts.result instanceof Error);
};


/**
 * Fetch wrapper for the STREAMING links only (httpBatchStreamLink).
 *
 * Detects transport-layer failures by HTTP status / content-type, BEFORE tRPC's JSONL parser turns them into
 * engine-specific `SyntaxError`s (which are only string-matchable on V8 - see aix.client.errors.ts). We tag a typed,
 * engine-independent marker (`error.cause.aixTransportCode`), read by [Error Channel 1] aixClassifyStreamingError - see the channel map in aix.client.errors.ts.
 * - 413 from whatever sits in front of the function: the hosted Vercel edge (~4.5MB, as `text/plain`), OR a
 *   self-hosted reverse proxy (nginx `client_max_body_size`, etc.). The classifier emits host-appropriate copy.
 * - text/html where a JSON(L) stream is expected (captive portals / proxies / gateway error pages)
 *
 * NOTE: only the server-side tRPC path passes through here. CSF (client-side-fetch, direct browser->provider) has its
 * own error surface and structurally cannot hit a front-door 413 (there is no edge/proxy hop), so it bypasses this.
 */
const streamingTransportFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (res.status === 413)
    throw Object.assign(new Error('AIX transport: request entity too large'), { aixTransportCode: 'request-exceeded' as const });
  // A legitimate tRPC stream is always application/json - any text/html means a captive portal / proxy / gateway error
  // page (commonly non-2xx), regardless of status. We flag it before the JSONL parser chokes on the '<!DOCTYPE'.
  if ((res.headers.get('content-type') ?? '').includes('text/html'))
    throw Object.assign(new Error('AIX transport: captive/HTML response'), { aixTransportCode: 'response-captive' as const });
  return res;
};


/**
 * A typed UNAUTHORIZED (session expired or revoked, allowlist shrank) sends the browser to /signin?next=, except on
 * public paths (a share-link viewer is never bounced) and when auth is off. Streaming gets the same error: the guard
 * throws before the AIX generator starts, and proxy.ts never matches /api/*. No auth header: the session is the cookie.
 */
const unauthorizedRedirectLink: TRPCLink<AppRouter> = () => ({ next, op }) => next(op).pipe(tap({
  error: error => {
    if (typeof window !== 'undefined' && error.data?.code === 'UNAUTHORIZED' && getAuthProviders().length > 0 && !isAuthPublicPath(location.pathname))
      window.location.assign(signInPath(location.pathname + location.search, location.origin));
  },
}));


/**
 * Every failed non-streaming tRPC call is a Client Logs entry. Aborts are not failures, UNAUTHORIZED is the redirect
 * below, and the streaming client is left out: AIX reports its own failures as error parts, which are logged there.
 */
const errorLogLink: TRPCLink<AppRouter> = () => ({ next, op }) => next(op).pipe(tap({
  error: error => {
    if (isAbortErrorLike(error) || error.data?.code === 'UNAUTHORIZED') return;
    logger.error(`Request failed: ${op.path}`, { path: op.path, type: op.type, code: error.data?.code, httpStatus: error.data?.httpStatus, message: error.message }, 'network', { skipReporting: true, skipDebuggerBreak: true });
  },
}));


/// tRPC clients: async, query, and stream

/** Typesafe async/await hooks for the tRPC API */
export const apiAsync = createTRPCClient<AppRouter>({
  links: [
    loggerLink({ enabled: enableLoggerLink }),
    errorLogLink,
    unauthorizedRedirectLink,
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: transformer,
    }),
  ],
});

/** Typesafe React Query hooks for the tRPC API */
export const apiQuery = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * We set the queryClient to a singleton App-wide instance, to use the same client for
       * both React Query and tRPC. As `withTRPC` in _app.tsx, it will create a QueryClientProvider
       * component, so we can catch 2 birds with one stone and only create 1 provider, over 1
       * instance, and reuse the same configuration for both traditional React Query and tRPC.
       */
      queryClient: reactQueryClientSingleton(),
      links: [
        loggerLink({ enabled: enableLoggerLink }),
        errorLogLink,
        unauthorizedRedirectLink,
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: transformer,
        }),
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   * @see https://trpc.io/docs/client/nextjs/ssr
   */
  ssr: false,
  /**
   * Transformer used for data de-serialization from the server.
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: transformer,
});

/** Stream API: uses tRPC streaming to transfer partial updates to the client */
export const apiStream = createTRPCClient<AppRouter>({
  links: [
    loggerLink({ enabled: enableLoggerLink }),
    unauthorizedRedirectLink,
    httpBatchStreamLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: transformer,
      fetch: streamingTransportFetch,
      // one request per stream: a browse fetch is not held behind a sibling AI stream, and image-heavy
      // payloads stay within per-request body limits (Vercel: 4.5MB)
      maxItems: 1,
    }),
  ],
});

