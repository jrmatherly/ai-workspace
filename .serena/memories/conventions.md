# Code conventions

- Imports: `@mui/joy` only (never `@mui/material`); prefer `@mui/icons-material` icons already imported elsewhere.
- Zustand: global stores `persist` to localStorage except `chat/store-chats` (IndexedDB via `createIDBPersistStorage`); per-instance stores are vanilla and suffixed `_vanilla`; module stores named `store-module-*`; wrap multi-property selectors in `useShallow`.
- Messages are typed fragments (`DMessage` -> `DMessageFragment[]`, `chat.fragments.ts`), never strings.
- TS: discriminated unions, `satisfies`, `as const`, exhaustive checks; no unnecessary `as`. Zod schemas server-side; client imports inferred types.
- Modules register in central registries (`vendors.registry.ts` etc.); a missing entry is a compile error, which is the intended gate.
- Browser floor: use `[...x].sort()` not `toSorted`; no `Intl.Segmenter`; don't lower `browserslist` to silence it.
- Prose (docs, comments, UI copy, commits): terse, no em dashes (use `-`), no marketing tone, plain-noun headings.
- Commit subjects: `LLMs: OpenAI: ...`, `AIX: ...`, `Beam: ...`, `Build: ...` (same scheme as upstream; keeps upstream cherry-picks consistent).
- `kb/` is the agent-facing architecture KB (`kb/KB.md` indexes it); `docs/` is user-facing. Keep both current when moving things; remove stale KB text when found.
