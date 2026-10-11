---
name: upstream-review
description: Review what changed in upstream enricoros/big-AGI (main) since our last review and decide what to adopt into this copied repo. Use for "sync from upstream", "what changed upstream", "review upstream commits", "did big-AGI update", "bring upstream commit X in", or a periodic upstream check. Encodes the copy-not-fork reality, the watermark driver, the per-file divergence markers, and the adoption rules for this repo.
argument-hint: "[--stat | --urls | --show <sha> | --diverged]"
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/upstream-review.sh *) Bash(git show *) Bash(git log *) Bash(git diff *) Bash(git rev-parse *) Read Grep Glob
---

# Upstream review

This repo is a copy of `enricoros/big-AGI` taken at upstream commit `99b3bf9c` (2026-10-07, v2.1.1 + 278). It shares no git history with upstream, but at our first commit the source tree was identical to that commit except the files `--diverged` lists (`.github/`, `package.json`, `.gitignore`, `.serena/`, and since then the re-branded surfaces). So:

- `git merge` and `git merge-base` are useless. Every range is `<watermark>..upstream/main`.
- `git cherry-pick -x <sha>` works once `upstream/main` is fetched: the 3-way merge uses the commit's own parent as the base. A file applies cleanly when our copy equals that parent's copy (the pre-image), and conflicts otherwise.
- The driver compares our HEAD with each commit's pre-image before you pick anything.

## Tooling

| Piece | Path |
|---|---|
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
|---|---|---|
| `=` | ours equals the pre-image | `git cherry-pick -x <sha>` applies cleanly |
| `<` | ours equals the seed, not the pre-image | an older upstream commit touched it first; pick in order |
| `~` | ours differs from both | we changed it; resolve the 3-way or hand-port |
| `x` | we removed it | skip unless we want the file back |
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
- Upstream commits that touch `.github/` are SKIP by default. We carry no workflows; the archived ones are in `private/OLD-.github/` for reference.
- Brand and hosting surfaces are re-pointed at this repo (`src/common/app.release.ts`, `app.config.ts`, `pages/_document.tsx`, README, `docs/`, `docker-compose.yaml`, `.github/`, `spotlight.feed.ts`). Upstream commits touching them show `~` and are ADAPT: take the behavior, keep our URLs.
- Upstream references to the `dev` branch, `private/dev`, `big-agi-private`, or `kb/product/` describe their hosted line, which we do not have. Content gated on it is SKIP.
- Model-definition commits (`LLMs: <vendor>: ...`) are the highest-value, lowest-risk class. Prefer ADOPT over re-running `/update-models <vendor>`.
- A watermark advance without a decision log is a lost review. Seed the watermark below any backlog you intend to review, never at today's tip.

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
