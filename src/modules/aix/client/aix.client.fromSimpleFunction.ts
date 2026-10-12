import * as z from 'zod/v4';

import type { AixTools_FunctionCallDefinition } from '../server/api/aix.wiretypes';
import { DMessageContentFragment, DMessageToolInvocationPart, DMessageVoidFragment, isContentFragment, isErrorContentFragment, isToolInvocationPart } from '~/common/stores/chat/chat.fragments';


// configuration
const AIX_DEBUG_CLIENT_TOOLS = process.env.NODE_ENV === 'development';


export type AixClientFunctionCallToolDefinition = {
  name: string;
  description: string;
  /**
   * The input schema for the function call.
   * We only accept objects, not arrays - as downstream APIs have spotty implementation for non-object.
   * If the function does not take any inputs, use `Zod.object({})` or Zod.void().
   */
  inputSchema: z.ZodObject; // zod-4 object
}


/**
 * Create an Aix FunctionCall Tool Definition from a simple function definition.
 * @param functionCall
 */
export function aixFunctionCallTool(functionCall: AixClientFunctionCallToolDefinition): AixTools_FunctionCallDefinition {

  // convert a Zod schema to JSON Schema
  const { properties, required } = z.toJSONSchema(functionCall.inputSchema, {
    // config
    io: 'input', // avoids AdditionalProperties by looking at the Zod schema from the input perspective
    target: 'draft-2020-12', // (default) newest standard
    reused: 'inline', // (default) inline reused schemas

    // [DEV] makes sure we specify good tool definitions
    cycles: 'throw',
    unrepresentable: 'throw',
  });

  const takesNoInputs = !Object.keys(properties || {}).length;
  return {
    type: 'function_call',
    function_call: {
      name: functionCall.name,
      description: functionCall.description,
      ...(!takesNoInputs && {
        input_schema: {
          properties: properties as any, // FIXME: remove the 'as any' after the full migration to zod-4
          ...(!!required?.length && {
            required: required,
          }),
        },
      }),
    },
  };
}


/**
 * The one function call a forced-tool request must produce, wherever it sits among the content fragments.
 * Chat-tuned models (Qwen3 through llama-server, measured 2026-10-12) narrate before calling, and reasoning
 * models prepend 'ma' void fragments, so the invocation is searched for, not read at a fixed position.
 */
export function aixRequireSingleFunctionCallInvocation(fragments: (DMessageContentFragment | DMessageVoidFragment)[], expectedFunctionName: string, debugLabel: string): {
  invocation: Extract<DMessageToolInvocationPart['invocation'], { type: 'function_call' }>;
  argsObject: object;
} {

  if (!Array.isArray(fragments) || !(fragments.length >= 1)) {
    if (AIX_DEBUG_CLIENT_TOOLS)
      console.error(`[DEV] single-function-call (${debugLabel}): invalid fragments:`, { fragments });
    throw new Error('AIX: Unexpected response.');
  }

  const invocations = fragments.filter(isContentFragment).map(f => f.part).filter(isToolInvocationPart);
  if (!invocations.length) {
    // an upstream error is the better message
    const errorFragment = fragments.find(isErrorContentFragment);
    if (errorFragment)
      throw new Error('AIX: Error invoking function: ' + errorFragment.part.error);
    if (AIX_DEBUG_CLIENT_TOOLS)
      console.error(`[DEV] single-function-call (${debugLabel}): no invocation among fragments:`, { parts: fragments.map(f => f.ft === 'content' ? f.part.pt : f.ft) });
    throw new Error('AIX: Missing function invocation.');
  }

  // the first call of the expected function wins: parallel_tool_calls is left at the vendor default, so a forced
  // single-tool request can come back with the same function called twice
  const invocation = invocations.map(i => i.invocation).find(i => i.type === 'function_call' && i.name === expectedFunctionName);
  if (!invocation || invocation.type !== 'function_call') {
    if (AIX_DEBUG_CLIENT_TOOLS)
      console.error(`[DEV] single-function-call (${debugLabel}): invalid invocations:`, { invocations });
    throw new Error('AIX: Expected a function call.');
  }

  if (!invocation.args) {
    if (AIX_DEBUG_CLIENT_TOOLS)
      console.error(`[DEV] single-function-call (${debugLabel}): missing invocation args:`, { invocation });
    throw new Error('AIX: Missing function arguments.');
  }

  try {
    return {
      invocation,
      argsObject: JSON.parse(invocation.args),
    };
  } catch (e) {
    if (process.env.NODE_ENV === 'development')
      console.error('[DEV] single-function-call: invalid invocation args:', invocation, 'for', debugLabel);
    throw new Error('AIX: Invalid function arguments.');
  }
}
