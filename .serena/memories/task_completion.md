# Done criteria for a code change

1. `npm run tscheck` clean (both projects).
2. `npm run lint` clean, including no new `compat/compat` warnings.
3. `npm test` passes (offline lanes).
4. If a `*.models.ts` or manifest-listed file changed: `node tools/develop/gen-llms-defs/generate-llms-defs.mjs --check` exits 0, else regenerate and include `src/modules/llms/server/gen/llms.defs.versions.ts` in the commit.
5. UI change: verify in the running app via chrome-devtools MCP (user runs the dev server).
6. Commit locally only when asked; never push.
