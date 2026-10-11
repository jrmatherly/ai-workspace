import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '~/server/trpc/trpc.router';
import { createTRPCFetchContext } from '~/server/trpc/trpc.server';
import { posthogServerSendException } from '~/server/posthog/posthog.server';

const handler = (req: Request) => fetchRequestHandler({
  endpoint: '/api/trpc',
  router: appRouter,
  req,
  createContext: createTRPCFetchContext,
  onError: async function({ path, error, type }) {

    if (process.env.NODE_ENV === 'development')
      console.error(`❌ tRPC failed on ${path ?? 'unk-path'}: ${error.message}`);

    await posthogServerSendException(error, undefined, {
      domain: 'trpc-onerror',
      runtime: 'nodejs',
      endpoint: path ?? 'unknown',
      method: req.method,
      url: req.url,
      additionalProperties: {
        error_code: error.code,
        error_type: type,
      },
    });
  },
});

// On Vercel, Node functions default to a short limit; raise it here or in the project settings
// export const maxDuration = 300;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export { handler as GET, handler as POST };
