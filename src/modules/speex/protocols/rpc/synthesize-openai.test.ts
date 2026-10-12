import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveOpenAISpeexAccess } from './synthesize-openai';

const SERVER = { OPENAI_API_KEY: 'sk-server', LOCALAI_API_HOST: 'http://llama-server.ai.svc:8080/', LOCALAI_API_KEY: 'lai-server' };
const NONE = { OPENAI_API_KEY: undefined, LOCALAI_API_HOST: undefined, LOCALAI_API_KEY: undefined };

test('localai: a service configured only by LOCALAI_API_HOST resolves to the server host and key', () => {
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'localai' }, SERVER), { host: 'http://llama-server.ai.svc:8080', apiKey: 'lai-server' });
});

test('localai: a client host wins, and the server key only follows the server host', () => {
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'localai', apiHost: 'http://llama-server.ai.svc:8080' }, SERVER), { host: 'http://llama-server.ai.svc:8080', apiKey: 'lai-server' });
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'localai', apiHost: 'other.example:8080' }, SERVER), { host: 'http://other.example:8080', apiKey: '' });
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'localai', apiHost: 'other.example:8080', apiKey: 'mine' }, SERVER), { host: 'http://other.example:8080', apiKey: 'mine' });
});

test('localai: no host anywhere still throws', () => {
  assert.throws(() => resolveOpenAISpeexAccess({ dialect: 'localai' }, NONE), /LocalAI requires a host URL/);
});

test('openai: default host takes the server key, a custom host never does', () => {
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'openai' }, SERVER), { host: 'https://api.openai.com', apiKey: 'sk-server' });
  assert.deepEqual(resolveOpenAISpeexAccess({ dialect: 'openai', apiHost: 'proxy.example' }, SERVER), { host: 'https://proxy.example', apiKey: '' });
});
