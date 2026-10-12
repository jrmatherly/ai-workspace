import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { AixAPI_Model, AixAPIChatGenerate_Request } from '../../../api/aix.wiretypes';

import { aixToOpenAIChatCompletions } from './openai.chatCompletions';


const MODEL: AixAPI_Model = { id: 'qwen3-4b', acceptsOutputs: ['text'] };

const FORCED_TOOL: AixAPIChatGenerate_Request = {
  systemMessage: { parts: [{ pt: 'text', text: 'Rate the diagram.' }] },
  chatSequence: [{ role: 'user', parts: [{ pt: 'text', text: 'Analyze and call the function.' }] }],
  tools: [{ type: 'function_call', function_call: { name: 'draw_plantuml_diagram', description: 'd', input_schema: { properties: { rating_number: { type: 'number' } }, required: ['rating_number'] } } }],
  toolsPolicy: { type: 'any' },
};

function systemText(payload: ReturnType<typeof aixToOpenAIChatCompletions>): string {
  const first = payload.messages[0];
  return first?.role === 'system' && typeof first.content === 'string' ? first.content : '';
}

test('localai: a forced tool becomes tool_choice auto plus a must-call hint (llama-server ignores required: prose until max_tokens, measured on qwen3-4b 2026-10-12)', () => {
  const payload = aixToOpenAIChatCompletions('localai', MODEL, FORCED_TOOL, false);
  assert.equal(payload.tool_choice, 'auto');
  assert.match(systemText(payload), /You MUST respond by calling one of the provided tools/);
  assert.equal(payload.tools?.length, 1);
});

test('openai: a forced tool stays required and the system message is untouched', () => {
  const payload = aixToOpenAIChatCompletions('openai', MODEL, FORCED_TOOL, false);
  assert.equal(payload.tool_choice, 'required');
  assert.equal(systemText(payload), 'Rate the diagram.');
});

test('localai: an auto policy adds no hint', () => {
  const payload = aixToOpenAIChatCompletions('localai', MODEL, { ...FORCED_TOOL, toolsPolicy: { type: 'auto' } }, false);
  assert.equal(payload.tool_choice, 'auto');
  assert.equal(systemText(payload), 'Rate the diagram.');
});
