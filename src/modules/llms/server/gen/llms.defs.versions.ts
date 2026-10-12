// GENERATED FILE - DO NOT EDIT
// Per-vendor model-defs versions, derived from the runtime semantics of the files claimed by
// ../llms.defs.manifest.ts - regenerate with: node tools/develop/gen-llms-defs/generate-llms-defs.mjs
// (next dev / next build regenerate it automatically; commit the result)

import type { ModelVendorId } from '../../vendors/vendors.registry';

export type LlmsDefsVersions = Readonly<Record<ModelVendorId | '_shared' | '_openaiCompat', string>>;

export const LLMS_DEFS_VERSIONS = {
  _openaiCompat: '38463b4b02aa',
  _shared: '6cbf32a61381',
  alibaba: 'c1a1a62822c3',
  anthropic: '4953faf829cf',
  azure: '565dace9f0e3',
  bedrock: '335380767b05',
  cerebras: 'bc342196fff3',
  cohere: '8584ff201173',
  deepseek: 'c5a8d5e22d09',
  googleai: 'c5912e880714',
  groq: '3810573b7f1d',
  lmstudio: '9afed1757341',
  localai: '971d05e10b94',
  metaai: 'd7e400d45025',
  mistral: '1b04c84fbfa0',
  modular: 'd9563d003467',
  moonshot: 'c251958e6b09',
  nvidianim: 'dc84e09002cb',
  ollama: '3984cb62a223',
  openai: '0d4a47266c56',
  openrouter: '1adf5933a30f',
  perplexity: '6d074b3374fc',
  sakanaai: '283c12c59fa2',
  togetherai: '3fe635fa5463',
  xai: '140895526510',
  zai: '6e0bfba484a2',
} as const satisfies LlmsDefsVersions;
