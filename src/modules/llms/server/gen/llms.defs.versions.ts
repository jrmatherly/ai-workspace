// GENERATED FILE - DO NOT EDIT
// Per-vendor model-defs versions, derived from the runtime semantics of the files claimed by
// ../llms.defs.manifest.ts - regenerate with: node tools/develop/gen-llms-defs/generate-llms-defs.mjs
// (next dev / next build regenerate it automatically; commit the result)

import type { ModelVendorId } from '../../vendors/vendors.registry';

export type LlmsDefsVersions = Readonly<Record<ModelVendorId | '_shared' | '_openaiCompat', string>>;

export const LLMS_DEFS_VERSIONS = {
  _openaiCompat: '7f80e13a1bb5',
  _shared: '787802c9058b',
  alibaba: 'adf971e388f5',
  anthropic: 'e26204656beb',
  azure: '50fc4907f7ca',
  bedrock: 'ee9e5dc9fa5d',
  cerebras: '805223bfa95f',
  cohere: '4a77df9b1215',
  deepseek: '40657472a07e',
  googleai: '42221f0d7545',
  groq: 'e52792347a29',
  lmstudio: '59d3f64cb8d4',
  localai: '40343ba32ed3',
  metaai: '8ba420b6f5bd',
  mistral: 'd84854aa01ed',
  modular: '0255898b0a1d',
  moonshot: 'feab4e2db7bd',
  nvidianim: '52ef03da1cf0',
  ollama: '5365a19414a9',
  openai: 'a914dddb1a59',
  openrouter: '0a1f07a74991',
  perplexity: '2e4be8f01145',
  sakanaai: '402c14cb5a94',
  togetherai: 'fd0cff9d8cd9',
  xai: '134cf20e7498',
  zai: 'fdfe8f29f2aa',
} as const satisfies LlmsDefsVersions;
