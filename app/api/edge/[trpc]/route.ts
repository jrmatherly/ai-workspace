import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouterEdge } from '~/server/trpc/trpc.router-edge';
import { createTRPCFetchContext } from '~/server/trpc/trpc.server';

const handlerEdgeRoutes = (req: Request) => fetchRequestHandler({
  endpoint: '/api/edge',
  router: appRouterEdge,
  req,
  createContext: createTRPCFetchContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => console.error(`\n❌ tRPC-edge failed on ${path ?? 'unk-path'}: ${error.message}`)
      : undefined,
});

// Node runtime since Next 16 deprecated the Edge runtime (2026-10). The '/api/edge' path stays: clients hard-code it.
// On Vercel, set maxDuration here or in the project settings; Node functions default to a short limit.
// export const maxDuration = 300;
export const runtime = 'nodejs';
export { handlerEdgeRoutes as GET, handlerEdgeRoutes as POST };