import { test } from 'node:test';
import assert from 'node:assert/strict';

import { create_FunctionCallInvocation_ContentFragment, createErrorContentFragment, createModelAuxVoidFragment, createTextContentFragment } from '~/common/stores/chat/chat.fragments';

import { AixFunctionCallDeclinedError, aixRequireSingleFunctionCallInvocation } from './aix.client.fromSimpleFunction';


const CALL = create_FunctionCallInvocation_ContentFragment('c1', 'draw_plantuml_diagram', '{"rating_short_reason":"no fit","rating_number":1}');
const ARGS = { rating_short_reason: 'no fit', rating_number: 1 };

test('a lone invocation is accepted', () => {
  assert.deepEqual(aixRequireSingleFunctionCallInvocation([CALL], 'draw_plantuml_diagram', 't').argsObject, ARGS);
});

test('prose before the invocation is accepted (Qwen and other chat-tuned models narrate before calling)', () => {
  assert.deepEqual(aixRequireSingleFunctionCallInvocation([createTextContentFragment('Let me assess that.'), CALL], 'draw_plantuml_diagram', 't').argsObject, ARGS);
});

test('a reasoning void fragment before the invocation is accepted', () => {
  assert.deepEqual(aixRequireSingleFunctionCallInvocation([createModelAuxVoidFragment('reasoning', 'thinking...'), CALL], 'draw_plantuml_diagram', 't').argsObject, ARGS);
});

test('prose only is a typed "Missing function invocation": the model declined to call (qwen3-4b on the Auto-UI prompt, measured 2026-10-12)', () => {
  assert.throws(() => aixRequireSingleFunctionCallInvocation([createTextContentFragment('Rating: 1. STOP.')], 'draw_plantuml_diagram', 't'), (e: unknown) => e instanceof AixFunctionCallDeclinedError);
});

test('an upstream error is the message when there is no call, and not a decline', () => {
  assert.throws(() => aixRequireSingleFunctionCallInvocation([createErrorContentFragment('upstream 400')], 'draw_plantuml_diagram', 't'), (e: unknown) => e instanceof Error && !(e instanceof AixFunctionCallDeclinedError) && /Error invoking function: upstream 400/.test(e.message));
});

test('a call survives a trailing advisory error fragment', () => {
  assert.deepEqual(aixRequireSingleFunctionCallInvocation([CALL, createErrorContentFragment('rate limit advisory')], 'draw_plantuml_diagram', 't').argsObject, ARGS);
});

test('the first call of the expected function wins over a parallel duplicate', () => {
  const other = create_FunctionCallInvocation_ContentFragment('c0', 'generate_web_ui', '{"html":"x"}');
  assert.deepEqual(aixRequireSingleFunctionCallInvocation([other, CALL, CALL], 'draw_plantuml_diagram', 't').argsObject, ARGS);
});

test('the wrong function name is rejected', () => {
  assert.throws(() => aixRequireSingleFunctionCallInvocation([CALL], 'generate_web_ui', 't'), /Expected a function call/);
});
