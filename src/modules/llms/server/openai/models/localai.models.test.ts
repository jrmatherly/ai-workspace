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
