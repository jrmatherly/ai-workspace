// GENERATED FILE - DO NOT EDIT
// Per-vendor model-defs versions, derived from the runtime semantics of the files claimed by
// ../llms.defs.manifest.ts - regenerate with: node tools/develop/gen-llms-defs/generate-llms-defs.mjs
// (next dev / next build regenerate it automatically; commit the result)

import type { ModelVendorId } from '../../vendors/vendors.registry';

export type LlmsDefsVersions = Readonly<Record<ModelVendorId | '_shared' | '_openaiCompat', string>>;

export const LLMS_DEFS_VERSIONS = {
  _openaiCompat: 'ad9936c30da8',
  _shared: 'a2d71fd3f025',
  alibaba: '625ce9d2ab6e',
  anthropic: '354de325f29d',
  azure: '359bc4499259',
  bedrock: '9f1e5faa5bd0',
  cerebras: 'fa80a93bd14a',
  cohere: '74bae90cc286',
  deepseek: '5ea5507c2037',
  googleai: '08780b8fab93',
  groq: '48b883fd48ff',
  lmstudio: '6acb61c812a7',
  localai: '1813848e2df7',
  metaai: '2d8564e920ca',
  mistral: '9def6496d980',
  modular: 'bb7da3073ecf',
  moonshot: '052c35496e21',
  nvidianim: 'b64bb2f321e4',
  ollama: '8bdd3244cd44',
  openai: '8eceac6485d2',
  openrouter: 'ccba39bce6da',
  perplexity: 'eb44771c03c6',
  sakanaai: 'cacec91b8fbf',
  togetherai: '913844f76447',
  xai: '5f7821d14087',
  zai: 'a8dedfe0b193',
} as const satisfies LlmsDefsVersions;
