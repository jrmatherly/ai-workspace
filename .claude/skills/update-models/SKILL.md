---
name: update-models
description: Update one vendor's LLM model definitions (ids, pricing, context, capabilities, parameterSpecs, pubDate, deprecations) from the vendor's docs and live API, then validate and regenerate the defs versions map. Use for "update <vendor> models", "refresh model definitions", "add the new <vendor> model", "sync pricing for <vendor>". Vendors - alibaba, anthropic, deepseek, gemini, groq, kimi, metaai, minimax, mistral, nvidia, ollama, openai, perplexity, xai, and dynamic (the API-fetched parsers - OpenRouter, TogetherAI, Azure, Baseten, Novita, ChutesAI, FireworksAI, LM Studio, LocalAI, FastAPI).
argument-hint: "<vendor> [model-id or focus]"
arguments: [vendor, focus]
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit Write WebFetch WebSearch Bash(curl:*) Bash(npm run tscheck) Bash(npm run lint) Bash(npm test) Bash(node tools/develop/gen-llms-defs/generate-llms-defs.mjs:*) Bash(npx tsx tools/develop/*) Bash(node ${CLAUDE_SKILL_DIR}/scripts/parse-ollama-models.js:*)
---

# Update model definitions

Vendor: `$vendor`. Focus: `$focus` (empty means a full pass over the vendor's list).

If `$vendor` is empty or not in the table below, list the table and ask which vendor.
To compare parameterSpecs against sweep data instead, run `/verify-parameters <dialect>`.

## Vendors

| `$vendor` | Model file |
| --- | --- |
| alibaba | `src/modules/llms/server/openai/models/alibaba.models.ts` |
| anthropic | `src/modules/llms/server/anthropic/anthropic.models.ts` |
| deepseek | `src/modules/llms/server/openai/models/deepseek.models.ts` |
| gemini | `src/modules/llms/server/gemini/gemini.models.ts` |
| groq | `src/modules/llms/server/openai/models/groq.models.ts` |
| kimi | `src/modules/llms/server/openai/models/moonshot.models.ts` |
| metaai | `src/modules/llms/server/openai/models/metaai.models.ts` |
| minimax | `src/modules/llms/server/openai/models/minimax.models.ts` |
| mistral | `src/modules/llms/server/openai/models/mistral.models.ts` |
| nvidia | `src/modules/llms/server/openai/models/nvidianim.models.ts` |
| ollama | `src/modules/llms/server/ollama/ollama.models.ts` |
| openai | `src/modules/llms/server/openai/models/openai.models.ts` |
| perplexity | `src/modules/llms/server/openai/models/perplexity.models.ts` |
| xai | `src/modules/llms/server/openai/models/xai.models.ts` |
| dynamic | several parser files, listed in the reference |

Each vendor's sources, traps and procedure live in `references/<vendor>.md`.

## Scope

Update the model file for `$vendor`. Read `src/modules/llms/server/llm.server.types.ts` and `src/modules/llms/server/models.mappings.ts` for context only. Focus on the model file and do not descend into other code.

## Important

- Review the full model list for additions, removals, and price changes
- Minimize whitespace/comment changes, focus on content
- Preserve comments to make diffs easy to review
- Flag broken links or unexpected content

## Key handling

Vendor keys live in `.env.api-keys` at the repo root (gitignored, one `VENDOR_API_KEY=...` per line). The file may not exist. Without it, skip the live-endpoint steps and say so.

- Load keys inside the same Bash call that uses them: `set -a; . ./.env.api-keys; set +a; curl ...`. Shell state does not persist between Bash calls.
- Never `cat`, `echo`, `grep` or otherwise print the file or a key value.
- Pass keys only as HTTP headers that reference the variable (`-H "Authorization: Bearer $VENDOR_API_KEY"`), so the transcript shows the variable name, not the value.
- Gemini takes `-H "x-goog-api-key: $GEMINI_API_KEY"`. Never put a key in a URL (`?key=...`): URLs end up in logs and error messages.
- Never put a key literal on a command line, and never write `VAR=<value> cmd`.
- Never commit a key, and never paste a response that echoes one.

## pubDate

Source: `kb/modules/LLM-editorial-pubdate.md`.

- Format `YYYYMMDD` (validated as 8 digits), for example `'20250929'`.
- It is the earliest public availability of that exact model through any channel (app, console, API, partner, open weights). It is not the date we added the entry, the training cutoff, or the snapshot build date.
- Anthropic, Gemini and Z.AI model types require it. Every new editorial entry for any vendor carries one.
- Anthropic date suffixes are usually the snapshot date, not the release date. Corroborate against the announcement.
- A third-party host (Groq, NVIDIA, OpenRouter) uses the creator's original release date, not the host's.
- Symlinks inherit the target's date. A month-only source uses the 1st and gets a MEDIUM-confidence note.
- Ollama is the exception: it tracks `added` (the date we added the entry), as its reference describes.

## Procedure

1. Read `${CLAUDE_SKILL_DIR}/references/$vendor.md` and follow it. It overrides this file where they differ.
2. Gather from the primary sources first, then the live endpoint, then fallbacks.
3. Edit the model file. Report each addition, removal, price change and capability change with its source.
4. Validate and record (below).

The ollama procedure runs the bundled parser at `${CLAUDE_SKILL_DIR}/scripts/parse-ollama-models.js` (`--help` prints its usage).

## Validate and record

1. `npm run tscheck && npm run lint`. Fix every error before continuing.
2. `node tools/develop/gen-llms-defs/generate-llms-defs.mjs`. A defs edit rolls the vendor's version, so include the regenerated `src/modules/llms/server/gen/llms.defs.versions.ts` in the change. Never hand-edit it.
3. Commit only when the user asks. Subject `LLMs: <Vendor>: <terse imperative>` (for example `LLMs: OpenAI: add gpt-6-sol pricing`), single line, no `Co-Authored-By` trailer. Never push.
