#!/usr/bin/env bash
# PostToolUse(Edit|Write): lint the edited file. Informs only: always exits 0.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$file" in
  "$root"/*.ts | "$root"/*.tsx | "$root"/*.mjs) ;;
  *) exit 0 ;;
esac
[[ -f "$file" ]] || exit 0

out=$(cd "$root" && npx eslint --no-warn-ignored "$file" 2>&1) || true
[[ -n "$out" ]] || exit 0
# exit-0 stdout is hidden from Claude unless it is JSON additionalContext
jq -n --arg ctx "eslint findings in $file:
$out" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
exit 0
