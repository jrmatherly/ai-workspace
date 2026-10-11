---
name: sync-api
description: Compare our AIX wire types, request adapter and response parser for one vendor against that vendor's newest API docs and a live streaming request, then report and fix discrepancies (new or changed fields, event types, tools, response shapes, breaking changes). Use for "sync the <vendor> API", "check our <vendor> wire types against the docs", "did <vendor> add new API fields". Vendors - anthropic, gemini, openai, openrouter, xai.
argument-hint: "<vendor> [feature]"
arguments: [vendor, feature]
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit WebFetch WebSearch Bash(curl:*) Bash(npm run tscheck) Bash(npm run lint)
---

# Sync a vendor API

Vendor: `$vendor`. Feature focus: `$feature` (empty means the whole surface).

If `$vendor` is empty or not in the table below, list the table and ask which vendor.

## Our code

Paths are relative to `src/modules/aix/server/dispatch/`.

| `$vendor` | Wire types | Request adapter | Response parser |
| --- | --- | --- | --- |
| anthropic | `wiretypes/anthropic.wiretypes.ts` | `chatGenerate/adapters/anthropic.messageCreate.ts` | `chatGenerate/parsers/anthropic.parser.ts` |
| gemini | `wiretypes/gemini.wiretypes.ts` | `chatGenerate/adapters/gemini.generateContent.ts` | `chatGenerate/parsers/gemini.parser.ts` |
| openai | `wiretypes/openai.wiretypes.ts` | `chatGenerate/adapters/openai.responsesCreate.ts`, `chatGenerate/adapters/openai.chatCompletions.ts` | `chatGenerate/parsers/openai.responses.parser.ts`, `chatGenerate/parsers/openai.parser.ts` |
| openrouter | `wiretypes/openai.wiretypes.ts` | `chatGenerate/adapters/openai.chatCompletions.ts` ('openrouter' dialect) | `chatGenerate/parsers/openai.parser.ts` |
| xai | `wiretypes/xai.wiretypes.ts` | `chatGenerate/adapters/xai.responsesCreate.ts` | `chatGenerate/parsers/openai.responses.parser.ts` (shared with OpenAI Responses) |

Read the three for `$vendor`, then `${CLAUDE_SKILL_DIR}/references/$vendor.md`. The reference holds what we support and skip, extra files, sources and any vendor checklist. It overrides this file where they differ.

## Newest API information

Use the reference's primary sources first. If some are blocked, try its alternative sources and be creative (SDK repos, `.md` variants, llms.txt indexes). If all are blocked, explain what you attempted and ask the user to provide the documentation.

When the reference has a live-endpoint step, fire a real streaming request and inspect the raw SSE. It is ground truth for new fields, event types, response shapes and error formats that docs lag.

## Key handling

Vendor keys live in `.env.api-keys` at the repo root (gitignored, one `VENDOR_API_KEY=...` per line). The file may not exist. Without it, skip the live-endpoint steps and say so.

- Load keys inside the same Bash call that uses them: `set -a; . ./.env.api-keys; set +a; curl ...`. Shell state does not persist between Bash calls.
- Never `cat`, `echo`, `grep` or otherwise print the file or a key value.
- Pass keys only as HTTP headers that reference the variable (`-H "Authorization: Bearer $VENDOR_API_KEY"`), so the transcript shows the variable name, not the value.
- Gemini takes `-H "x-goog-api-key: $GEMINI_API_KEY"`. Never put a key in a URL (`?key=...`): URLs end up in logs and error messages.
- Never put a key literal on a command line, and never write `VAR=<value> cmd`.
- Never commit a key, and never paste a response that echoes one.

## What to check

If `$feature` is set, focus on it first. In every case, check carefully for discrepancies in the protocol, the available API surface, the structure of the messages, functionality and logic. Look deep into the fields of requests and responses, especially required fields, streaming event types and new response shapes. Point out every difference, whether in the final parsing and reassembly of the streaming message or in the protocol itself.

Prioritize breaking changes, then new capabilities that would improve the user experience.

## Making changes

- Mark each change with a dated comment naming the vendor: `// [<Vendor>, YYYY-MM-DD]: explanation`.
- After any wire-type, adapter or parser edit, run `npm run tscheck && npm run lint` and fix every error.
- Commit only when the user asks. Subject `AIX: <Vendor>: <terse imperative>`, single line, no `Co-Authored-By` trailer. Never push.
