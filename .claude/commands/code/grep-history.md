---
description: Search git history for commits that introduce or remove an exact string, within a commit range
argument-hint: "[search-string] [ancestor-commit]"
allowed-tools: Bash(git *)
---

Search git history using `git log -S` (pickaxe) to find commits that add or remove an exact string.
This repo has a short history (copied from upstream at one commit, see CLAUDE.md "Upstream"). For history before the copy, run the same search against `upstream/main` after `.claude/skills/upstream-review/scripts/upstream-review.sh` has fetched it.

## Parameters

- `$0` - The exact string to search for in file contents (not commit messages). Examples: `NEXT_PUBLIC_POSTHOG_HOST`, `myFunctionName`
- `$1` - A commit hash or unique commit message substring to identify the start of the range. Examples: `d7f178b35`, `Analytics: PostHog host configurable`

## Example

```
/code:grep-history NEXT_PUBLIC_POSTHOG_HOST "first commit"
```

This searches all commits between the `first commit` commit and HEAD for any that add or remove the string `NEXT_PUBLIC_POSTHOG_HOST` in file contents (finds `6333f0366 Analytics: PostHog host configurable via NEXT_PUBLIC_POSTHOG_HOST`).

## Procedure

### Step 1: Resolve the ancestor commit

If `$1` looks like a commit hash (hex string), use it directly.
Otherwise, search for it by message, restricting to ancestors of HEAD. Substitute `$1` as a fixed string, shell-quoted (single quotes, each `'` inside written as `'\''`):

```bash
git log --oneline -F --grep=<$1, shell-quoted> HEAD | head -5
```

For `Analytics: PostHog host configurable` that is `--grep='Analytics: PostHog host configurable'`.

This only walks commits reachable from HEAD, so every result is a guaranteed ancestor - no verification loop needed.

If multiple results, pick the oldest (last listed) since it represents the earliest matching commit.
If none, report the error and stop.

### Step 2: Run pickaxe search

```bash
git log -S "$0" --oneline <resolved_ancestor>..HEAD
```

This finds commits where the count of `$0` in the codebase changes (i.e., it was added or removed).
On `upstream/main` (8000+ commits) this can take 30-60 seconds.

### Step 3: Check endpoints

Also check whether the string exists at HEAD and at the ancestor commit:

```bash
git grep -l "$0" HEAD 2>/dev/null || echo "(not found at HEAD)"
git grep -l "$0" <resolved_ancestor> 2>/dev/null || echo "(not found at ancestor)"
```

### Step 4: Report

Present results concisely:
- Number of commits found (or "none")
- List of matching commits (hash + subject line)
- Whether the string exists at HEAD and/or at the ancestor
- If found, suggest next steps (e.g., `git show <hash>` to inspect specific commits)