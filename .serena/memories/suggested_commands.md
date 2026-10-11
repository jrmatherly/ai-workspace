# Commands (run from repo root; never `cd && ...`)

- `npm run tscheck` - both tsc projects. Note `pretscheck` runs `npm install` first (~21s total).
- `npm run lint` - eslint whole repo (~17s). Single file: `eslint src/path/file.ts`.
- `npm test` - tsx node:test; 3 offline tests, 22 key-gated skips (<1s).
- `npm run build` - slow; only for bundle/runtime suspicion. Dev servers (3000-3003) are the user's; never start/stop them.
- `node tools/develop/gen-llms-defs/generate-llms-defs.mjs [--check]` - regenerate/verify the committed model-defs hash map.
- `npm run gen:icon-sprites` - manual vendor icon sprite regen.
- Upstream review: `.claude/skills/upstream-review/scripts/upstream-review.sh [--stat|--urls|--show <sha>|--diverged|--advance]` (see `mem:upstream`).
- Git: `git mv` for renames; never `git stash`; never push (user does all write git ops). Commit subject `Area: terse imperative`, no body unless needed, no Co-Authored-By trailer.
- Darwin notes: BSD `sed -i ''`; `jq` is on PATH via mise shims.
