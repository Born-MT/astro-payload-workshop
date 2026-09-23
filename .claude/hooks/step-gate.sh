#!/usr/bin/env bash
# Workshop step gate. PreToolUse hook for Bash.
# A `git commit` whose message carries a step tag "(step N)" or card tag "(card X)" is only
# allowed once `pnpm verify N` is green (cards need step 5). Untagged commits pass through.
# Exit 2 = block. Exit 0 = allow.
set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"jq is required for the workshop hooks but is not installed."}}\n'
  exit 2
fi

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)
[ -z "$COMMAND" ] && exit 0

# Only care about git commit.
printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+commit' || exit 0
# Only care about tagged messages.
TAG=$(printf '%s' "$COMMAND" | grep -oE '\((step [0-6]|card [A-G])\)' | head -1)
[ -z "$TAG" ] && exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
OUT=$(cd "$ROOT" && node --no-deprecation scripts/verify.mjs --gate "$TAG" 2>&1)
STATUS=$?
if [ $STATUS -ne 0 ]; then
  # Strip ANSI colour, keep the last useful lines for the reason.
  REASON=$(printf '%s' "$OUT" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘|→|refused' | head -6 | tr '\n' ' ' | sed 's/"/\\"/g')
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit tagged %s refused: that step is not green. %s Run pnpm verify and fix it first. Do not remove the tag to get around this."}}\n' "$TAG" "$REASON"
  exit 2
fi
exit 0
