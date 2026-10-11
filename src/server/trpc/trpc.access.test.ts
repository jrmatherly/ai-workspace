/**
 * Enumerates the real appRouter, so a new or cherry-picked procedure is covered without editing this file.
 * Callers are forged in the context's own shape. Guards sit before .input(), so BAD_REQUEST (zod) means the
 * guard passed and UNAUTHORIZED / FORBIDDEN means it rejected.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

import type { AuthCaller } from '~/server/auth/auth.server';
import { appRouter } from '~/server/trpc/trpc.router';
import { ANONYMOUS_PROCEDURES, createCallerFactory, createTRPCFetchContext } from '~/server/trpc/trpc.server';

const ADMIN_ONLY = new Set(['llmOllama.adminPull', 'llmOllama.adminDelete']);
const OPEN = new Set<string>(ANONYMOUS_PROCEDURES);
const PATHS = Object.keys(appRouter._def.procedures);
const createCaller = createCallerFactory(appRouter);

const member: AuthCaller = { mode: 'user', user: { id: 'u1', email: 'a@example.com', name: 'A', image: null, role: 'user' } };
const admin: AuthCaller = { mode: 'user', user: { id: 'u2', email: 'b@example.com', name: 'B', image: null, role: 'admin' } };

function ctxFor(caller: () => Promise<AuthCaller>) {
  return { hostName: 'test', reqSignal: new AbortController().signal, resHeaders: new Headers(), caller };
}

/** The tRPC error code a call ends with; 'OK' on success, 'THROWN:<error>' for a non-tRPC error. */
async function outcome(caller: () => Promise<AuthCaller>, path: string): Promise<string> {
  const proxy = createCaller(ctxFor(caller)) as unknown as Record<string, Record<string, (input?: unknown) => Promise<unknown>>>;
  const [router, procedure] = path.split('.');
  try {
    await proxy[router][procedure](undefined);
    return 'OK';
  } catch (error) {
    return error instanceof TRPCError ? error.code : `THROWN:${String(error)}`;
  }
}

test('the anonymous surface is exactly these three procedures', () => {
  assert.deepEqual([...ANONYMOUS_PROCEDURES].sort(), ['backend.listCapabilities', 'backend.whoami', 'trade.storageGet']);
  for (const path of ANONYMOUS_PROCEDURES) assert.ok(PATHS.includes(path), `${path} is not mounted`);
});

for (const mode of ['anonymous', 'not_allowed'] as const) {
  test(`${mode}: only ANONYMOUS_PROCEDURES pass, everything else is UNAUTHORIZED`, async () => {
    for (const path of PATHS) {
      const code = await outcome(async () => ({ mode }), path);
      if (OPEN.has(path)) assert.notEqual(code, 'UNAUTHORIZED', path);
      else assert.equal(code, 'UNAUTHORIZED', path);
    }
  });
}

test('user: admin procedures are FORBIDDEN, the rest pass the guard', async () => {
  for (const path of PATHS) {
    const code = await outcome(async () => member, path);
    assert.notEqual(code, 'UNAUTHORIZED', path);
    if (ADMIN_ONLY.has(path)) assert.equal(code, 'FORBIDDEN', path);
    else assert.notEqual(code, 'FORBIDDEN', path);
  }
});

for (const [name, caller] of [['admin', admin], ['off (auth not configured)', { mode: 'off' }]] as const) {
  test(`${name}: nothing rejects for auth reasons`, async () => {
    for (const path of PATHS) {
      const code = await outcome(async () => caller, path);
      assert.ok(code !== 'UNAUTHORIZED' && code !== 'FORBIDDEN', `${path}: ${code}`);
    }
  });
}

test('session backend down: member procedures get a detail-free 500, anonymous ones still answer', async () => {
  const down = () => Promise.reject(new Error('connect ECONNREFUSED 10.0.0.5:5432'));
  for (const path of PATHS) {
    const code = await outcome(down, path);
    if (OPEN.has(path) && path !== 'backend.whoami') assert.notEqual(code, 'INTERNAL_SERVER_ERROR', path);
    else assert.equal(code, 'INTERNAL_SERVER_ERROR', path);
  }
  const proxy = createCaller(ctxFor(down));
  await assert.rejects(proxy.backend.whoami(), (error: unknown) =>
    error instanceof TRPCError && error.code === 'INTERNAL_SERVER_ERROR' && !error.message.includes('ECONNREFUSED'));
});

test('whoami reports the caller and forbids shared caching', async () => {
  const ctx = ctxFor(async () => member);
  assert.deepEqual(await createCaller(ctx).backend.whoami(), member);
  assert.equal(ctx.resHeaders.get('cache-control'), 'private, no-store');
});

test('real context: auth off makes whoami "off"; listCapabilities never resolves the caller', async () => {
  const req = new Request('http://localhost/api/trpc/backend.whoami');
  // TRPCRequestInfo is small enough to spell out instead of casting
  const info: FetchCreateContextFnOptions['info'] = {
    accept: null, type: 'query', isBatchCall: false, calls: [], connectionParams: null, signal: req.signal, url: new URL(req.url),
  };
  const ctx = await createTRPCFetchContext({ req, resHeaders: new Headers(), info });
  assert.deepEqual(await createCaller(ctx).backend.whoami(), { mode: 'off' });

  let resolved = 0;
  const counting = async (): Promise<AuthCaller> => {
    resolved++;
    return member;
  };
  assert.equal(await outcome(counting, 'backend.listCapabilities'), 'OK');
  assert.equal(resolved, 0, 'listCapabilities resolved the caller');
});
