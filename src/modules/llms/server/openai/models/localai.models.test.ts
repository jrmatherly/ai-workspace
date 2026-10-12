import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LLM_IF_OAI_Chat, LLM_IF_OAI_Fn, LLM_IF_OAI_Vision } from '~/common/stores/llms/llms.types';

import { localAIModelHints, localAIModelToModelDescription } from './localai.models';

// verbatim llama-server (b11146) /v1/models body, 2026-10-11
const LLAMA_SERVER = {
  models: [{ name: 'phi-4-mini', model: 'phi-4-mini', modified_at: '', size: '', digest: '', type: 'model', description: '', tags: [''], capabilities: ['completion'], parameters: '', details: { parent_model: '', format: 'gguf', family: '', families: [''], parameter_size: '', quantization_level: '' } }],
  object: 'list',
  data: [{ id: 'phi-4-mini', aliases: ['phi-4-mini'], tags: [], object: 'model', created: 1791772073, owned_by: 'llamacpp', meta: { vocab_type: 2, n_vocab: 200064, n_ctx: 2048, n_ctx_train: 131072, n_embd: 3072, n_params: 3836021856, size: 2483623296, ftype: 'Q4_K - Medium' } }],
};

test('llama-server listing: the slot context becomes the window; multimodal adds vision; function calling stays assumed without /props', () => {
  const hints = localAIModelHints(LLAMA_SERVER, 'phi-4-mini');
  assert.deepEqual(hints, { nCtx: 2048, capabilities: ['completion'] });
  const md = localAIModelToModelDescription('phi-4-mini', hints);
  assert.equal(md.contextWindow, 2048);
  assert.deepEqual(md.interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn], 'the listing cannot say whether tool calls are parsed');
  const multimodal = localAIModelToModelDescription('gemma-3-4b', { nCtx: 4096, capabilities: ['completion', 'multimodal'] });
  assert.deepEqual(multimodal.interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn, LLM_IF_OAI_Vision]);
});

test('llama-server /props decides function calling: Phi-4 template says no, a tool template says yes', () => {
  const noTools = { ...LLAMA_SERVER, props: { chat_template_caps: { supports_tool_calls: false, supports_tools: false } } };
  assert.deepEqual(localAIModelHints(noTools, 'phi-4-mini'), { nCtx: 2048, capabilities: ['completion'], toolCalls: false });
  assert.deepEqual(localAIModelToModelDescription('phi-4-mini', localAIModelHints(noTools, 'phi-4-mini')).interfaces, [LLM_IF_OAI_Chat]);
  const tools = { ...LLAMA_SERVER, props: { chat_template_caps: { supports_tool_calls: true } } };
  assert.deepEqual(localAIModelToModelDescription('phi-4-mini', localAIModelHints(tools, 'phi-4-mini')).interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn]);
  const unreachable = { ...LLAMA_SERVER, props: undefined };
  assert.deepEqual(localAIModelToModelDescription('phi-4-mini', localAIModelHints(unreachable, 'phi-4-mini')).interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn], '/props failed: heuristics');
});

test('LocalAI proper (no meta, no models array): unknown window, heuristics keep function calling', () => {
  const hints = localAIModelHints({ object: 'list', data: [{ id: 'llava-1.6', object: 'model' }] }, 'llava-1.6');
  assert.deepEqual(hints, {});
  const md = localAIModelToModelDescription('llava-1.6', hints);
  assert.equal(md.contextWindow, null);
  assert.deepEqual(md.interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn, LLM_IF_OAI_Vision]);
  assert.deepEqual(localAIModelToModelDescription('x').interfaces, [LLM_IF_OAI_Chat, LLM_IF_OAI_Fn], 'hints optional');
});

test('LocalAI proper config route: context_size becomes the window; a failed fetch or no configs leaves it unknown; meta.n_ctx wins', () => {
  const listing = { object: 'list', data: [{ id: 'qwen-3.5-4b', object: 'model' }] };
  const hints = localAIModelHints({ ...listing, configs: { 'qwen-3.5-4b': { context_size: 65536, backend: 'llama-cpp' } } }, 'qwen-3.5-4b');
  assert.deepEqual(hints, { nCtx: 65536 });
  assert.equal(localAIModelToModelDescription('qwen-3.5-4b', hints).contextWindow, 65536);
  assert.deepEqual(localAIModelHints({ ...listing, configs: { 'qwen-3.5-4b': undefined } }, 'qwen-3.5-4b'), {});
  assert.deepEqual(localAIModelHints(listing, 'qwen-3.5-4b'), {});
  const both = { ...LLAMA_SERVER, configs: { 'phi-4-mini': { context_size: 65536 } } };
  assert.equal(localAIModelHints(both, 'phi-4-mini').nCtx, 2048);
});

test('LocalAI config: a non-integer context_size is ignored', () => {
  for (const bad of [16384.5, 0, -1, '16384', null]) {
    const wire = { object: 'list', data: [{ id: 'm', object: 'model' }], configs: { m: { context_size: bad } } };
    assert.deepEqual(localAIModelHints(wire, 'm'), {}, `context_size ${String(bad)}`);
    assert.equal(localAIModelToModelDescription('m', localAIModelHints(wire, 'm')).contextWindow, null);
  }
});
