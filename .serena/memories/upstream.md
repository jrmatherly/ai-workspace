# Upstream provenance and review

- Upstream: `https://github.com/enricoros/big-AGI` branch `main`. Seed commit `99b3bf9c8c28d6629dc14afe3704c6e8fb29d137` (2026-10-07, "Beam: Use all beams: named generator", `v2.1.1-278-g99b3bf9c8`).
- Our first commit `d7f178b3` matched the seed except `.github/` (removed), `.claude/settings.local.json`, `.serena/`, `.gitignore`, `package.json` allowScripts. Since 2026-10-10 about 250 files diverge (rebrand, persisted-name rename, logo, CalVer): run the skill's `--diverged`; the old-to-new table is in the skill.
- Dependencies diverge on purpose since 2026-10-11: `package.json` and the lockfile are ours (bulk tier landed; refactor tier planned in `docs/superpowers/plans/2026-10-11-dependency-upgrade-refactor-tier.md`); the skill's Dependencies section has the porting rules.
- `private/` (gitignored) holds `OLD-.git` (full upstream clone, 46 MB, 8883 commits) and `OLD-.github`.
- No shared history. Ranges are `<sha>..upstream/main`; `merge-base` is empty. `git cherry-pick -x` works: its base is the picked commit's own parent (pre-image).
- Review workflow = `upstream-review` skill: `.claude/skills/upstream-review/SKILL.md` + `scripts/upstream-review.sh`; tracked state `.upstream-review/watermark.json` (`seedSha` fixed, `lastReviewedSha` advances only via `--advance <tip-sha>`) and `.upstream-review/reviews/<date>-review.md`. Remote `upstream` is added with `--no-tags`; first run bootstraps `upstream/main` from `private/OLD-.git`.
- `--stat` markers compare our HEAD with each commit's pre-image: `=` equal (clean pick), `<` equals seed not pre-image (older upstream commit first, or we already carry the post-image), `~` differs (hand-port), `x` we removed, `+` new file, `bin`.
- Script validates every watermark field (full SHA, safe ref names, https URL) before passing it to git; a bad field dies.
