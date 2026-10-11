---
name: verify-parameters
description: Compare model parameterSpecs and the LLM_IF_OAI_Fn interface in the model definition files against the API-validated parameter sweep JSON, and report every mismatch per dialect. Read-only report. Use for "verify parameters for <dialect>", "check parameterSpecs against the sweep", "do our effort levels match the sweep".
argument-hint: "openai | anthropic | gemini | xai | metaai | openrouter (empty for all)"
arguments: [dialect]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

# Verify LLM Parameters

Compare model `parameterSpecs` in definition files against API-validated sweep data.

Dialect: `$dialect`. When set, verify only that dialect, which includes reading the pair of sweep results and model definitions. When empty, verify all six, and read the pairs in sequence.

## Files

**Sweep results** (source of truth for select parameters):
- `tools/develop/llm-parameter-sweep/llm-{dialect}-parameters-sweep.json`
  By the time you see these files, the repo owner has already updated them via `tools/develop/llm-parameter-sweep/sweep.sh` (very long running, 15 min per vendor). Dialects with a sweep file: openai, anthropic, gemini, xai, metaai, openrouter.

**Model definitions (source of truth for model definitions for the user and application, including constants, interfaces, supported parameters and sometimes allowed parameter values)**:
- OpenAI: `src/modules/llms/server/openai/models/openai.models.ts`
- Anthropic: `src/modules/llms/server/anthropic/anthropic.models.ts`
- Gemini: `src/modules/llms/server/gemini/gemini.models.ts`
- xAI: `src/modules/llms/server/openai/models/xai.models.ts`
- Meta AI: `src/modules/llms/server/openai/models/metaai.models.ts`
- OpenRouter: `src/modules/llms/server/openai/models/openrouter.models.ts`. There is no static table: each model's `parameterSpecs` are built at list time from the OpenRouter listing plus the creator vendor's `llmOrt*Lookup` entry, so resolve each swept id through that code. Its sweep uses the OpenAI sweep keys (`oai-reasoning-effort`, `oai-reasoning-mode`, `oai-verbosity`) across `anthropic/`, `openai/` and `google/` ids.

## Task

The sweep data is the source of truth for allowed model parameter values or value ranges, and for the `fn` function-calling capability probe.

For each model in the sweep, verify the model definition exposes exactly those capabilities - no more, no less. This includes:
- The parameter is present in parameterSpecs
- The paramId variant covers exactly the values from the sweep, if applicable
- `LLM_IF_OAI_Fn` in `interfaces` matches `"roundtrip"` in the sweep's `fn` array (see below)
- etc.

Report models where the definition doesn't match the sweep.

## Parameter Mapping

Example parameter mapping. Note that new parameters may have been added to both the definition, and the sweep.
The objective of the sweep is to hint at model definition values, but the model definitions are what matters for AI Workspace,
and need to be carefully updated, otherwise thousands of clients may break.

| Dialect   | Sweep Key                | Model paramId                |
|-----------|--------------------------|------------------------------|
| OpenAI    | `oai-reasoning-effort`   | `llmVndOaiEffort`            |
| OpenAI    | `oai-reasoning-mode`     | `llmVndOaiReasoningMode`     |
| OpenAI    | `oai-verbosity`          | `llmVndOaiVerbosity`         |
| OpenAI    | `oai-image-generation`   | `llmVndOaiImageGeneration`   |
| OpenAI    | `oai-web-search`         | `llmVndOaiWebSearchContext`  |
| Anthropic | `ant-effort`             | `llmVndAntEffort`            |
| Anthropic | `ant-thinking-budget`    | `llmVndAntThinkingBudget`    |
| Gemini    | `gemini-thinking-level`  | `llmVndGemEffort`            |
| Gemini    | `gemini-thinking-budget` | `llmVndGeminiThinkingBudget` |
| xAI       | `xai-web-search`         | `llmVndXaiWebSearch`         |
| Meta      | `metaai-reasoning-effort`| `llmVndOaiEffort`            |
| Meta      | `metaai-web-search`      | `llmVndOaiWebSearchContext`  |

## Function-Calling Capability (`fn`)

The sweep `fn` array is a capability probe (not a paramId). `"roundtrip"` is the authoritative signal - full tool-call -> response -> coherent follow-up. `LLM_IF_OAI_Fn` in the model's `interfaces` must track `"roundtrip"`: present iff present.

Flag:
- `"roundtrip"` in sweep but `LLM_IF_OAI_Fn` missing (or vice versa)
- `fn` contains `"auto"`/`"required"` without `"roundtrip"` - partial capability, call it out

## Output

Report first for every model the expected values from the sweep, then the actual values from the definition, then the mismatches.

Finally make one table for each dialect listing all models with mismatches and the specific issues.
