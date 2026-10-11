---
description: Delete a Claude Code session (tape) and all its artifacts by session ID
disable-model-invocation: true
argument-hint: <session-id>
allowed-tools: Bash(find ~/.claude/projects *) Bash(rm -rfv ~/.claude/projects/*) Bash(rm -rfv ~/.claude/session-env/*) Bash(rm -rfv ~/.claude/file-history/*)
---

Delete the Claude Code session with ID `$ARGUMENTS` - the transcript wherever it lives under any project dir, its subagent transcripts, and its per-session state.

First check the argument: if `$ARGUMENTS` is not exactly one UUID (8-4-4-4-12 hex), stop and say so - do not guess or delete anything.

Run the block below as one Bash call; its first line repeats the UUID check in the shell so a bad argument can never reach `rm`:

```bash
[[ "$ARGUMENTS" =~ ^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$ ]] || { echo "not a session id: $ARGUMENTS" >&2; exit 1; }
find ~/.claude/projects -maxdepth 2 -name "$ARGUMENTS.jsonl" -print -delete
rm -rfv ~/.claude/projects/*/"$ARGUMENTS"
rm -rfv ~/.claude/session-env/"$ARGUMENTS"
rm -rfv ~/.claude/file-history/"$ARGUMENTS"
```

After running, confirm what was found and removed.
