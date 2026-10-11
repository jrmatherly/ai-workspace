#!/usr/bin/env bash
# PreToolUse(Bash) policy. Exit 2 blocks the call; settings.json sets onFailure=block so errors fail closed.
#   1. No git push (CLAUDE.md: pushes are the user's call). Override: prefix the push segment itself with ALLOW_GIT_PUSH=1 (visible in the transcript), or set ALLOW_GIT_PUSH=1 (that exact value) in the hook env.
#      The prefix is checked per segment: in a chained command it goes on the push segment, and `export` does not count.
#   2. No reading .env* files into the transcript; .env.example and .env.template are committed templates and pass. Sourcing them (`.`/`source`) is allowed so keys reach curl as headers.
set -euo pipefail
command -v jq >/dev/null || { echo "guard-bash: jq is required" >&2; exit 2; }

cmd=$(jq -r '.tool_input.command // empty')
[[ -n "$cmd" ]] || exit 0

# one simple command per line: split on newlines, ;, &&, ||, |, $( and backticks
segments=$(printf '%s\n' "$cmd" | sed -E 's/(&&|\|\||;|\||\$\(|`)/\n/g')

while IFS= read -r seg; do
  seg="${seg#"${seg%%[![:space:]]*}"}"
  [[ -n "$seg" ]] || continue
  # drop leading VAR=value assignments and env/command wrappers; an explicit ALLOW_GIT_PUSH=1 prefix is the visible override
  allow_push="${ALLOW_GIT_PUSH:-}"
  while [[ "$seg" =~ ^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*|env|command)[[:space:]]+ ]]; do
    [[ "${BASH_REMATCH[1]}" == ALLOW_GIT_PUSH=1 ]] && allow_push=1
    seg="${seg#"${BASH_REMATCH[0]}"}"
  done
  first="${seg%%[[:space:]]*}"; first="${first##*/}"

  if [[ "$first" == git && "$allow_push" != 1 ]]; then
    # the subcommand after leading global options; only -C and -c take a value
    if [[ "$seg" =~ ^[^[:space:]]+([[:space:]]+(-[Cc][[:space:]]+[^[:space:]]+|-[^[:space:]]+))*[[:space:]]+push([^[:alnum:]_-]|$) ]]; then
      echo "Blocked: pushes are the user's call (CLAUDE.md). Prefix the push segment with ALLOW_GIT_PUSH=1 to override when the user asked for the push." >&2
      exit 2
    fi
  fi

  case "$first" in .|source|ls|test|'['|'[['|stat|wc|file|rm|mv|cp|touch|chmod) continue;; esac
  for tok in $seg; do
    tok="${tok%\"}"; tok="${tok#\"}"; tok="${tok%\'}"; tok="${tok#\'}"
    case "$tok" in *.example|*.template) continue;; esac
    if [[ "$tok" =~ (^|/)\.env($|\.) ]]; then
      echo "Blocked: $first on $tok would print secrets into the transcript (CLAUDE.md). Source the file instead: set -a; . ./.env.api-keys; set +a" >&2
      exit 2
    fi
  done
done <<<"$segments"
exit 0
