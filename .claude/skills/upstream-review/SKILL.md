---
name: upstream-review
description: Review what changed in upstream enricoros/big-AGI (main) since our last review and decide what to adopt into this copied repo. Use for "sync from upstream", "what changed upstream", "review upstream commits", "did big-AGI update", "bring upstream commit X in", or a periodic upstream check. Encodes the copy-not-fork reality, the watermark driver, the per-file divergence markers, and the adoption rules for this repo.
argument-hint: "[--stat | --urls | --show <sha> | --diverged]"
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh *) Bash(git show *) Bash(git log *) Bash(git diff *) Bash(git rev-parse *) Read Grep Glob
---

# Upstream review

This repo is a copy of `enricoros/big-AGI` taken at upstream commit `99b3bf9c` (2026-10-07, v2.1.1 + 278). It shares no git history with upstream, but at our first commit the source tree was identical to that commit except the files `--diverged` lists (run it; the footprint is now about 250 files after the rebrand, the rename of persisted names, the logo and the CalVer switch). So:

- `git merge` and `git merge-base` are useless. Every range is `<watermark>..upstream/main`.
- `git cherry-pick -x <sha>` works once `upstream/main` is fetched: the 3-way merge uses the commit's own parent as the base. A file applies cleanly when our copy equals that parent's copy (the pre-image), and conflicts otherwise.
- The driver compares our HEAD with each commit's pre-image before you pick anything.

## Tooling

| Piece | Path |
| --- | --- |
| Driver | `${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh` |
| Watermark (tracked) | `.upstream-review/watermark.json` (`seedSha` fixed, `lastReviewedSha` advances) |
| Decision logs (tracked) | `.upstream-review/reviews/<YYYY-MM-DD>-review.md` |

```bash
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh            # fetch, list un-reviewed commits oldest first
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh --stat     # + each touched file with a divergence marker
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh --urls     # + github commit URL per commit
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh --show <sha>
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh --diverged # our footprint: files that differ from the seed
${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh --advance <tip-sha>  # after the log is written; the listing prints the tip SHA
```

The first run adds the `upstream` remote and seeds `upstream/main` from `private/OLD-.git` (the archived upstream clone, untracked) so the network fetch is incremental. Without that directory it fetches the full history once.

Markers in `--stat`, our HEAD vs the commit's parent (pre-image) for each file it touches:

| | Meaning | Adoption path |
| --- | --- | --- |
| `=` | ours equals the pre-image | `git cherry-pick -x <sha>` applies cleanly |
| `<` | ours equals the seed, not the pre-image | an older upstream commit touched it first; pick in order |
| `~` | ours differs from both | we changed it; resolve the 3-way or hand-port |
| `x` | we removed it | check "Deleted or moved paths" below: some content moved and takes the port there; the rest is SKIP |
| `+` | new upstream file | cherry-pick creates it |
| `bin` | binary | inspect by hand |

Merge commits are listed but not expanded: their parents are in the range. A conflict resolution that exists only in the merge is not shown.

## Method

1. Run `--stat`. Group commits by area (the subject prefix: `LLMs:`, `AIX:`, `Beam:`, `Chat:`, `Build:`).
2. For each non-merge commit, `--show <sha>` and read the diff against its own upstream parent.
3. Classify our state from the markers and the diff: ALREADY-HAVE, ABSENT, DIVERGED, PARTIAL.
4. Verdict: `ADOPT` (cherry-pick, all files `=`, `<` with its predecessors, or `+`), `ADAPT` (hand-port, some `~`), `SKIP`, `MONITOR`.
5. Write every verdict with file-level evidence to the dated decision log (template below).
6. Adopt in a batch on a branch: cherry-pick oldest first, then `npm run tscheck && npm run lint && npm test`. A cherry-pick that touches `src/modules/llms/server/gen/llms.defs.versions.ts` conflicts on its hash lines: resolve the model file normally, then run `node tools/develop/gen-llms-defs/generate-llms-defs.mjs` and `git add` the regenerated map instead of merging it by hand (`predev` and `prebuild` also regenerate it).
7. Then `--advance <tip-sha>` with the tip SHA from the listing you reviewed (a fresh fetch may have moved on) and commit `.upstream-review/` with the adopted commits. The user pushes; never push.

For a large window (more than about 20 commits), dispatch one reviewer subagent per area with the SHAs, the marker output, and steps 2 to 5. Synthesize into one log.

## Rules for this repo

- Keep `-x` on every cherry-pick so the log line "cherry picked from commit" carries provenance. Upstream `#NNNN` issue numbers autolink to the wrong repo on GitHub; rewrite them to `enricoros/big-AGI#NNNN` in the picked commit message (`git commit --amend`) and in the decision log.
- Upstream commits that touch `.github/` are SKIP by default. Our workflows (`ci.yml`, `docker-image.yml`, Claude triage) are our own, SHA-pinned, and are not upstream's; the archived upstream ones are in `private/OLD-.github/` for reference.
- Brand and hosting surfaces are re-pointed at this repo (`src/common/app.release.ts`, `app.config.ts`, `pages/_document.tsx`, README, `docs/`, `docker-compose.yaml`, `spotlight.feed.ts`, `public/icons/`, `public/manifest.json`). Upstream commits touching them show `~` and are ADAPT: take the behavior, keep our URLs, names and logo.
- Upstream references to the `dev` branch, `private/dev`, `big-agi-private`, or `kb/product/` describe their hosted line, which we do not have. Content gated on it is SKIP.
- Model-definition commits (`LLMs: <vendor>: ...`) are the highest-value, lowest-risk class. Prefer ADOPT over re-running `/update-models <vendor>`.
- A watermark advance without a decision log is a lost review. Seed the watermark below any backlog you intend to review, never at today's tip.

## Name translations when porting

When you hand-port a `~` hunk, translate upstream's spelling to ours before it lands. After porting, grep the diff for the left column; any hit is a miss.

| Upstream | Ours |
| --- | --- |
| IndexedDB name `'Big-AGI'` (`dblobs.db.ts`, `BackupRestore.tsx`, `public/dev/inspect/*`) | `'AI-Workspace'` |
| backup `application: 'Big-AGI'` | `application: 'AI-Workspace'` |
| backup schema `vnd.agi.flash-backup` | `vnd.ai-workspace.flash-backup` |
| lock and channel `big-agi-instance`, `big-agi-tabs`, global `__bigAgiInstanceLock` | `ai-workspace-instance`, `ai-workspace-tabs`, `__aiWorkspaceInstanceLock` |
| export suffix `.agi.json` (written); the drop handler also accepts it | `.aiw.json` |
| store keys `agi-logger-log`, `agi-scratch-clip`, `agi-client-workspace`, `agi-live-file`, `agi-chunk-reload-at`, `agi-inspect-probe` | the same with `aiw-` |
| drag marker `x-app/agi` | `x-app/aiw` |
| env `BIG_AGI_BUILD` | `AI_WORKSPACE_BUILD` |
| PostHog keys `agi_domain`, `agi_runtime` | `aiw_domain`, `aiw_runtime` |
| `Big_AGI_App` (`pages/_app.tsx`) | `AiWorkspaceApp` |
| `BigAgiSquircleIcon`, `BigAgiCircleIcon`, `BigAgiCircleInnerIcon` in `src/common/components/icons/big-agi/` | `AppLogoIcon` with `logo.registry.ts` in `src/common/components/icons/logo/` |
| test env `BIGAGI_TEST_*` | `AIWORKSPACE_TEST_*` |
| mime hint `application/big-agi` | `application/vnd.ai-workspace` |
| product name "Big-AGI" or "big-AGI" in UI copy, build banners, docs | "AI Workspace" (keep "big-AGI" where it names upstream) |
| tRPC routes `app/api/edge/[trpc]/route.ts` (Edge runtime) and `app/api/cloud/[trpc]/route.ts` (Node) | one `app/api/trpc/[trpc]/route.ts` on Node (since 2026-10-11) |
| `trpc.router-edge.ts` / `AppRouterEdge`, `trpc.router-cloud.ts` / `AppRouterCloud`, `trpc.next-edge.ts` | `trpc.router.ts` / `AppRouter`; the Edge adapter is gone |
| clients `apiAsyncNode`, `apiStreamNode` (Node router) | `apiAsync`, `apiStream` (same router) |
| `edgeProcedure`, `authedProcedure`, `premiumProcedure` | bare `t.procedure` (already true on upstream `main`) |
| `VERCEL_WORKAROUND_EDGE_1MB_PAYLOAD_LIMIT` in `trpc.client.ts` | removed; the stream link always sets `maxItems: 1` |

Keep upstream spelling, do not rename in a port: `agi-*` CSS classes and `--AGI-*` vars, `data-agi-*` attributes, `vnd.agi.*` fragment types, `agiUuid` helpers, `aifn/agi*` directories, `AGI_DIST_DIR`, `__AGI_CONFIG_PASS`.

## Deleted or moved paths

An `x` marker means we removed the path, not always that the change is irrelevant.

- `.claude/commands/{aix,llms,code,rel}/*` and `.claude/scripts/parse-ollama-models.js`: the content lives in `.claude/skills/{sync-api,update-models,verify-parameters}/`; port the change into the matching reference or script.
- `src/common/components/icons/big-agi/*`: port into `src/common/components/icons/logo/` only if the change is behavioral (sizing, props); glyph edits are SKIP, the mark is ours.
- `docs/k8s/big-agi-deployment.yaml`: port into `docs/k8s/ai-workspace-deployment.yaml`.
- SKIP outright: `tools/video/**`, `tools/.gitignore`, the `~/extensions` alias, electron excludes, `public/manifest.json` `file_handlers`, `src/apps/news/bigAgiPro.data.tsx`, README marketing sections, `.github/**`.
- Ours, absent upstream at the seed: `.env.example`, `tools/develop/llm-parameter-sweep/README.md`, `src/common/components/icons/logo/`. If upstream adds a same-named file, treat it as ADAPT and merge by hand.

## Version and changelog

- Never take upstream's `package.json` `version`. Ours is CalVer `YYYY.M.D[.MICRO]`; upstream stays semver 2.x. A cherry-pick that touches it conflicts; keep ours.
- `Release.Monotonics.NewsVersion` in `src/common/app.release.ts` is ours (211 at the time of writing; upstream was 210 at the seed). `store-logic-sherpa.ts` compares it with each user's `lastSeenNewsVersion`, so copying upstream's number shows or hides the news page wrongly. Bump ours by one only when adopted news content should re-surface.
- Other `Monotonics` (`Aix`) are cache-bust counters tied to code behavior: port with the commit that needs them, never lower them.
- `docs/changelog.md` and `src/apps/news/*` are ours. Do not port upstream's entries; add one in our style when an adopted commit changes user-visible behavior. Record adopted SHAs in the decision log.

## Dependencies

`package.json` and `package-lock.json` are ours. Versions follow our own upgrade policy (bulk tier for bumps that need no source change and pass tscheck, lint, test and build; a reviewed plan for the rest), not upstream's pins. Both files show `~` on every upstream commit that touches them; that marker is expected, not a divergence to resolve.

- An upstream commit that only bumps dependencies is SKIP. If it moves a package past our version, evaluate the version on its own: `npm install <pkg>@<ver>`, then tscheck, lint, test, build. Never cherry-pick the lockfile.
- A ported feature commit that adds a dependency gets it at the current release (`npm install <pkg>`), not upstream's pin. Resolve the `package.json` conflict by keeping our versions and adding only the new entry.
- We sit ahead of upstream on: Prisma 7.10 (prisma-client generator, pg adapter, prisma.config.ts), Next 16.4 + React 19 (webpack via --webpack, flat eslint-config-next, one tRPC router on Node), `/node` 26, `dexie-react-hooks` 4, `puppeteer-core` 25 (ESM-only, Node floor 22.13), `katex` 0.19 via `overrides`, ESLint 10 (JS files on the TS parser, react version pinned), TypeScript 7 via the `@typescript/native` alias (the 6.0 API stays as `typescript`), `react-resizable-panels` 4, `@mui/icons-material` 7.3, `pdfjs-dist` 6.4 with a browser floor of Chrome 125 / Safari 18 (upstream stays on Chrome 110 / Safari 16.4 and 5.4.54). Upstream hunks written against the older APIs are ADAPT, translated with the table in "Name translations when porting".
- When upstream later makes the same major move, their migration commits are ALREADY-HAVE for the mechanics and ADAPT only for behavior they add on top.
- `pdfjs-dist` bumps need no file copy: `tools/develop/pdfjs-assets` copies the worker and assets into gitignored `public/` on prebuild, predev and pretest, and `src/common/util/pdfUtils.test.ts` checks them. Upstream commits the worker by hand; a hunk touching `public/workers/` is SKIP.

## Rename tables

Translate an upstream hunk written against the older API with the row for that phase.

### Prisma 7 (landed)

| Upstream form | Our form |
| --- | --- |
| `import { PrismaClient } from '@prisma/client'` | `import { PrismaClient } from './generated/client'` (in `src/server/prisma/prismaDb.ts`) |
| `import { LinkStorageDataType, ... } from '@prisma/client'` | `from '~/server/prisma/generated/enums'` |
| `url = env(...)`, `directUrl = env(...)` in `schema.prisma` | `datasource.url` in `prisma.config.ts` (CLI), `PrismaPg({ connectionString })` in `prismaDb.ts` (runtime) |
| `new PrismaClient({ log })` | `new PrismaClient({ adapter: new PrismaPg(...), log })` |
| `"prisma": { "schema": ... }` in `package.json` | `schema:` in `prisma.config.ts` |

### Next 16 and React 19 (landed)

| Upstream form | Our form |
| --- | --- |
| `eslint: { ignoreDuringBuilds }` in `next.config.ts` | removed (Next 16 does not lint in build; `NO_LINT_BUILD` is gone) |
| `next dev`, `next build` in scripts | `next dev --webpack`, `next build --webpack` |
| `quality={90}` on `next/image` with no config | `images: { qualities: [75, 90] }` in `next.config.ts` |
| `extends: compat.extends("next/core-web-vitals")` | `...nextVitals` from `eslint-config-next/core-web-vitals`, house rules under `files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"]` |
| `React.RefObject<T>` for a `useRef<T>(null)` | `React.RefObject<T \| null>` |
| `inert: '' as unknown as boolean` | `inert: true` |
| a tracked `next-env.d.ts` | generated by `next typegen` (`pretscheck`), gitignored |

### react-resizable-panels 4 (landed)

| Upstream form | Our form |
| --- | --- |
| `PanelGroup` / `direction=` | `Group` / `orientation=` |
| `PanelResizeHandle` | `Separator` |
| `onCollapse` on `Panel` | `onLayoutChanged={(layout, meta) => ...}` on `Group`, gated on `meta.isUserInteraction` and a `0` entry in `layout` |
| `order={idx}` | removed (order follows the tree) |
| `defaultSize={34}` (percent) | `defaultSize='34%'` (a bare number is pixels in v4) |
| a panel-less `PanelGroup` as a layout root | a `div` with `display:flex; flexDirection:row; width:100%; height:100%; overflow:hidden` |

### @mui/icons-material (7.3.11 landed; 9.x blocked by the Joy alias)

| Upstream form | Our form |
| --- | --- |
| `@mui/icons-material/DeleteOutline` | unchanged at 7.3.11; when 9.x unblocks, `@mui/icons-material/DeleteOutlineOutlined` (identical path) in the 24 importing files |

## Decision log template

```markdown
# Upstream review - <YYYY-MM-DD>

Window: `<from>..<full tip sha>` on upstream/main, N commits (M merges). Driver output: `--stat`.

## Headline
One paragraph: what to adopt now, what to port, what to skip.

## Verdicts
| # | Commit | Area | Our state | Markers | Verdict | Evidence |
|---|--------|------|-----------|---------|---------|----------|

## Adopted
Cherry-picked SHAs in order, validation result (tscheck, lint, test).
```

## Red flags

- `git merge upstream/main` or any merge-base based range. Use the watermark.
- Cherry-picking a `~` file without reading our side first.
- Review state anywhere except `.upstream-review/`.
- Advancing the watermark to a SHA other than the tip printed by the listing you classified.
