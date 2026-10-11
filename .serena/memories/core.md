# ai-workspace (copy of big-AGI)

- Next.js 15 (Pages Router for pages, App Router only for `/app/api/{edge,cloud}/[trpc]` tRPC handlers), React 18, MUI **Joy** (`@mui/joy`; `@mui/material` is webpack-aliased to Joy), Emotion, Zustand 5, tRPC 11 + React Query, zod v4 (`zod/v4`), Prisma 5.22 (optional Postgres, only `LinkStorage`).
- Provenance: copy of `enricoros/big-AGI@99b3bf9c` (2026-10-07, v2.1.1+278), byte-identical at the first commit and diverged since (rebrand, renames, logo, CalVer `YYYY.M.D`). Single branch `main`, single remote `origin` (jrmatherly/ai-workspace). No shared git history with upstream. Details and the review workflow: `mem:upstream`.
- `CLAUDE.md` (= `AGENTS.md` symlink) was rewritten for this copy on 2026-10-10 and is current; tooling details: `mem:agent_tooling`.
- Source map:
  - `pages/*` thin: `withNextJSPerPageLayout({type:'optima'}, () => <AppX/>)`.
  - `src/apps/<x>/App<X>.tsx` (+ `store-app-<x>.ts`). `src/apps/beam` is a dev harness; real Beam is `src/modules/beam`.
  - `src/modules/*` business logic: `aix` (streaming: client -> tRPC -> dispatch adapters/parsers -> `AixWire_Particles` -> `ContentReassembler` -> `DMessage`), `llms` (`vendors/` client, `server/` per-wire routers + `openai/models/*.models.ts`), `beam`, `blocks`, `aifn`, `dblobs`, `speex`, `asrx`, `t2i`, `trade`, `browse`.
  - `src/common/*` shared: `stores/chat` (IndexedDB `app-chats`), `chat-overlay/ConversationHandler.ts` (one per conversation, owns per-chat + beam vanilla stores), `layout/optima`, `app.nav.ts` / `app.routes.ts` (app registration), `app.release.ts` / `app.config.ts` (brand URLs).
  - `src/server/trpc`: `trpc.router-edge.ts` (AIX, per-vendor LLM, speex, youtube, backend) and `trpc.router-cloud.ts` (browse, trade). `edgeProcedure`/`authedProcedure`/`premiumProcedure` are all bare `t.procedure` here.
- Registries that gate additions at compile time: `vendors.registry.ts` (`satisfies Record<ModelVendorId, IModelVendor>`), `llms.defs.manifest.ts`, heuristic chain in `listModels.dispatch.ts`, same pattern in `asrx`/`speex`/`t2i` `*.vendors-registry.ts`. Vendor how-to: `kb/modules/LLM-vendor-integration.md`.
- Build/test/lint conventions and generated files: `mem:tech_stack`, `mem:conventions`. Commands: `mem:suggested_commands`. Done criteria: `mem:task_completion`.
