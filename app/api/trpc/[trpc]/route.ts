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

    // 401/403 are expected outcomes with auth on, not server faults
    if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') return;

    await posthogServerSendException(error, undefined, {
      domain: 'trpc-onerror',
      runtime: 'nodejs',
      endpoint: path ?? 'unknown',
      method: req.method,
      url: req.url.split('?')[0], // tRPC GET inputs ride in the query string and can hold client keys: never report them
      additionalProperties: {
        error_code: error.code,
        error_type: type,
      },
    });
  },
});

// On Vercel with Fluid compute (the default) every plan defaults to 300s; Hobby caps there, Pro and Enterprise
// allow 800. Without Fluid the caps are lower and an export above the plan's cap fails the build, so the pin stays opt-in:
// export const maxDuration = 300;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export { handler as GET, handler as POST };
