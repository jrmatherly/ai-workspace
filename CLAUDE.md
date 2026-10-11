# CLAUDE.md

Guidance to Claude Code when working with code in this repository.

## Architecture Overview

**Stack**: Next.js 16 (Pages Router for pages, App Router for API routes only; webpack via --webpack, Turbopack skips the config hook), React 19, Emotion (CSS-in-JS), Zustand, tRPC + TanStack React Query, one tRPC router at `/api/trpc` on the Node.js runtime (Next 16 deprecated the Edge runtime). UI is Material-UI **Joy**, not Material: import from `@mui/joy`; `next.config.ts` webpack-aliases `@mui/material` -> `@mui/joy` so stray/transitive Material imports still resolve to Joy (webpack only - turbopack skips that hook).

**Distinctive**, vs other chat UIs: Beam runs N models in parallel and fuses the answers (scatter/gather); every vendor sits behind one AIX protocol layer, reusing a few wire dialects instead of one integration each; chat is stored client-side in IndexedDB by default; BYO-keys (self-hosters may additionally set server-side vendor keys in env vars); AI calls can go browser-direct to the vendor (CSF); messages are typed fragments, not strings; personas and multi-pane conversations are first-class.

### Development Commands

Dev servers may be already running on ports 3000, 3001, 3002, or 3003 (not always this app - other projects may occupy these ports). Never start or stop dev servers, let the user do it.

```bash
# Validate - safe while a dev server runs, and far quicker than `next build` for the same checks
npm run tscheck && npm run lint      # types (all projects), then a typed ESLint pass
eslint src/path/to/file.ts           # lint one file
npm run lint:md                     # markdown, rules in .markdownlint-cli2.jsonc; append -- --fix to repair

# Full build - slow, only when suspecting runtime/bundle issues
npm run build  # compile+types (Next 16 no longer lints in build), stops at the first type-error file; tsc shows all at once
```

- `src/modules/llms/server/gen/llms.defs.versions.ts` is generated and committed; regenerate with `node tools/develop/gen-llms-defs/generate-llms-defs.mjs`, never hand-edit (rule: `.claude/rules/generated-files.md`)
- `next.config.ts` throws "missing build identity" without a git checkout or `NEXT_PUBLIC_BUILD_HASH`; `npm run tscheck` loads it too, through `next typegen` (rule: `.claude/rules/build-identity.md`)

For AI protocol development (model listing, live API requests/responses, parameter probing), real vendor API keys are in `.env.api-keys` if present (Anthropic, OpenAI, Gemini, etc., one VENDOR_API_KEY per line). Use them for empirical verification; never commit or echo the values.

### Git and GitHub

This repo is `jrmatherly/ai-workspace` (remote `origin`, single branch `main`). It is a copy of the upstream repository, not a fork: no shared git history. See "Upstream" below.

The `gh` command is available for GitHub reads (issues, PRs, labels), but **NEVER PUSH TO ANY BRANCH**. The user manages all remote 'write' git operations. Local commits are fine when asked.

- **Always use `git mv` instead of `mv`** when renaming or moving files - preserves git history tracking
- **NEVER run `git stash`** - it causes work loss
- **Versions** are CalVer, `YYYY.M.D[.MICRO]` unpadded (`2026.10.11`, a second release that day `2026.10.11.1`): valid semver, so `npm version` and the image workflow's semver tags work. Release tags are `vYYYY.M.D`. Bump with `npm version <ver> --no-git-tag-version` so `package-lock.json` follows.
- **Commit subjects**: `Area: terse imperative` (e.g. `LLMs: OpenAI: ...`, `Build: ...`, `Tooling: ...`), single line, no body unless needed, no `Co-Authored-By` trailer. Same scheme as upstream, so adopted upstream commits read consistently in `git log`.
- Vendor API keys for live protocol work go in `.env.api-keys` (gitignored, one `VENDOR_API_KEY` per line). The file does not exist until you create it; key-gated tests and the live probes in `/sync-api` and `/update-models` skip without it.

### Upstream

Upstream is `enricoros/big-AGI` `main`. This tree was copied at upstream commit `99b3bf9c` (2026-10-07, v2.1.1 + 278 commits); at our first commit the source was byte-identical to it. Tracking and adopting upstream changes goes through the `upstream-review` skill (`.claude/skills/upstream-review/`):

- `.claude/skills/upstream-review/scripts/upstream-review.sh --stat` lists un-reviewed upstream commits with a per-file marker: `=` unchanged since the copy (cherry-picks cleanly), `~` we changed it (hand-port), `x` we removed it, `+` new upstream file
- State is tracked in `.upstream-review/watermark.json` and `.upstream-review/reviews/<date>-review.md`
- Adopt with `git cherry-pick -x <sha>` for `=` files; never `git merge upstream/main`, and never use a merge-base (there is none)
- Upstream's hosted line (`dev`, `big-agi-private`, big-agi.com, "Big-AGI Pro") does not exist here. Content gated on it is skipped. The product display name is "AI Workspace"; "big-AGI" stays where it names upstream (provenance, upstream issue links, `docs/changelog.md`). Storage, format and operator-facing names use the new name (`AI-Workspace` IndexedDB and backup tag, `aiw-*` store keys, `.aiw.json`, `AI_WORKSPACE_BUILD`). Names that never surface keep upstream's spelling (`agi-*` CSS classes and vars, `vnd.agi.*` fragment types, `agiUuid` helpers, `aifn/agi*` directories, `AGI_DIST_DIR`): they live in the most-edited upstream files and renaming them turns clean cherry-picks into hand-ports. The old-to-new table for hand-porting an upstream hunk is in the skill ("Name translations when porting"). URLs, repo links, images and the container image point at this repo.

### Repository Layout

You are started from the root of the repository (i.e. where the git folder is or scripts should be run from).
**ISSUE ALL COMMANDS FROM THE ROOT, OMITTING 'cd' COMMANDS. DO NOT CHAIN CD AND OTHER COMMANDS**
**NEVER RUN COMPOUND `cd` COMMANDS LIKE `cd some-folder && command` - ONLY RUN `command` FROM THE ROOT, ALWAYS.**

- `/app/api/` - App Router, API routes only (thin, mostly -> `/src/server/`)
- `/pages/` - Pages Router, the app's pages (thin, mostly -> `/src/apps/`)
- `/src/apps/` - self-contained feature modules, entry `App*.tsx`, some with a local `store-app-*.ts`. Note `/src/apps/beam/` is a dev harness, not the Beam feature (that lives in `/src/modules/beam/`)
- `/src/modules/` - reusable business logic: `aix/` (AI streaming), `beam/` (scatter/gather), `blocks/` (content rendering), `llms/` (vendor abstraction), and more
- `/src/common/` - shared infrastructure and utilities; `/src/server/` - tRPC backend
- `/kb/` - knowledge base, indexed in `kb/KB.md`
- `/tools/` - dev scripts, API probes and generators (`tools/develop/*`, `tools/data/llms/`), type-checked by the second `tscheck` leg via `tools/tsconfig.json`

### Key Subsystems

**AIX** (`/src/modules/aix/`) - real-time AI communication, Client -> tRPC -> Server -> AI Providers. Particle-based streaming: `AixWire_Particles` -> `ContentReassembler` -> `DMessage`. Provider-agnostic adapters, one per wire dialect; streaming and non-streaming, with batching and error recovery.

**Beam** (`/src/modules/beam/`) - scatter/gather for parallel AI reasoning. Scatter: N models (rays) process the input in parallel. Gather: fusion algorithms combine outputs. Real-time UI via vanilla Zustand; one `BeamStore` per conversation, via `ConversationHandler`.

**Conversations** (`/src/common/stores/chat/`, `/src/common/chat-overlay/`) - overlay architecture, one handler per conversation. `ConversationHandler` orchestrates chat, beam and ephemerals; per-chat `PerChatOverlayStore` + `BeamStore`; messages are `DMessage` -> `DMessageFragment[]`; multi-pane with independent conversation states.

**Optima** (`/src/common/layout/optima/`) - the layout system: responsive desktop/mobile, Drawer(left)/Toolbar/Panel(right) composition, portal-based rendering for flexible component placement.

### Storage & State

Local-first: Zustand in memory with `persist` to localStorage, except chats, which go to IndexedDB (`keyval-store` -> `keyval` -> key `app-chats`) via `createIDBPersistStorage()`. Binary blobs live in their own Dexie database (`src/modules/dblobs/`). Version-based migrations handle structure changes, partialize/merge control what persists, and rehydration repairs and upgrades data on load. `/src/common/stores/` holds the cross-app stores; apps and modules keep their own beside their code, by the `store-*.ts` convention.

1. **Global stores** - Zustand + `persist`; `chat/store-chats` is the only one on IndexedDB, the rest on localStorage
   - **Zustand pattern**: Always wrap multi-property selectors with `useShallow` from `zustand/react/shallow` to prevent re-renders on reference changes
2. **Per-instance stores** - vanilla Zustand, no React integration, suffixed `_vanilla` (beam scatter/gather, per-chat overlay, attachment drafts)
3. **Module stores** - feature-scoped configuration and state, named `store-module-*`

### Key Flows

- **Chat**: `Composer` -> `DMessage` -> `ConversationHandler.messageAppend()` -> `_handleExecute()` (in `src/apps/chat/editors/`) -> `runPersonaOnConversationHead()` -> AIX request -> `ContentReassembler` -> UI -> Zustand auto-persist to IndexedDB
- **Beam**: user triggers Beam -> `BeamStore.open()` -> one parallel AIX request per ray -> live ray progress -> user selects fusion -> result becomes a new message

### Development Patterns

#### TypeScript & Code Quality

- Use latest TypeScript 6.0+ features, and forward-looking patterns that minimize future refactors (discriminated unions, `satisfies`, `as const`, type inference)
- Type guards and exhaustiveChecks for robustness
- No unnecessary TS casts: prefer narrowing/inference; only `as` when the compiler genuinely can't know the type
- Runtime validation with Zod schemas for API inputs/outputs (usually server-side, with the client importing as types the inferred types)

#### Module Integration

- Modules register with central registries (e.g., `vendors.registry.ts`)

#### UI & Icons

- Prefer `@mui/icons-material` icons/variants already imported elsewhere in the app over new ones (keeps the bundle lean); new icons only when depicting genuinely novel functionality

#### API Patterns

- No auth on `main`: `trpc.server.ts` installs no middleware, and every procedure alias in it resolves to bare `t.procedure` (the cloud layer lives on `dev`)

#### Security Considerations

- Server-side keys come from env vars only; client-held keys are user-supplied

#### Writing Style

- **Never use emdashes (—).** Use normal dashes (-) instead, in all generated text, code comments, and documentation.
- Register: sharp, terse, precise - in all prose (docs, UI copy, comments, commits, replies). No inflation, no sales tone, no clever headings (plain nouns). Cut sentences that carry no information.

## Common Development Tasks

### Testing & Quality

- Browser floor: `browserslist.production` is Chrome 125 / Edge 125 / Firefox 128 / Safari 18 / iOS 18 / Samsung 27 (set 2026-10-11; pdfjs-dist 6 needs `AbortSignal.any()`, `:dir()`, `light-dark()` and CSS nesting natively). `compat/compat` checks Web APIs against it at lint time; project rules stay at `warn`, and `eslint .` exits 0 on warnings. SWC does not polyfill prototype methods, so an API below the floor needs a feature check in code, not a lower `browserslist`
- `npm audit` is not expected to be empty: `docs/security-advisories.md` lists the accepted entries and the baseline command. A new entry needs a decision there, not a silent `npm audit fix`

### Production errors

- PostHog analytics and error tracking are key-gated (`NEXT_PUBLIC_POSTHOG_KEY`) and host-configurable (`NEXT_PUBLIC_POSTHOG_HOST`, default US cloud; EU cloud or self-hosted). Source-map upload needs `POSTHOG_API_KEY` + `POSTHOG_ENV_ID` at build. Triage runtime errors in the configured PostHog project; the client noise filter (`before_send` / `shouldSuppressPostHogCapture`, matched on `$exception_list`) lives in `src/common/components/3rdparty/PostHogAnalytics.tsx`; `mechanism.handled:false` = an unhandled rejection via autocapture. Suppress only environmental/extension noise, never real bugs

### Debugging Storage Issues

- Chats: DevTools -> Application -> IndexedDB -> `keyval-store` -> `keyval` -> key `app-chats`
- Everything else (`app-models`, `app-ui`, ...): DevTools -> Application -> Local Storage

## Server Architecture

One tRPC router, `/src/server/trpc/trpc.router.ts`, mounts every module router: AIX streaming, per-vendor LLM routers, unified Speex TTS, Google search, YouTube, backend capabilities, Browse (fetch and extract page content), and the shared-link store. `app/api/trpc/[trpc]/route.ts` serves it on the Node.js runtime with PostHog error reporting. Until 2026-10 there were two routers, Edge for AI and Node for data; Next 16 deprecated the Edge runtime. Client handles are `apiAsync`, `apiQuery` and `apiStream` in `src/common/util/trpc.client.ts`.

AIX, LLM and Speex also support **client-side fetch (CSF)**: the same code is rebundled with stubs and included client-side, so the browser can call the vendor directly where CORS allows, cutting latency and network barriers.

@kb/KB.md

@kb/vision-inlined.md

<!-- markdownlint-disable MD025 -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- markdownlint-enable MD025 -->
