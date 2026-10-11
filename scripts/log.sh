#!/usr/bin/env bash
# Usage: ./scripts/log.sh <type> "<summary>" ["<details>"]
# Appends to docs/AI_LOG.md and CHANGELOG.md, then commits all changes.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

TYPE="${1:?type required (feat|fix|docs|refactor|chore|security|decision)}"
SUMMARY="${2:?summary required}"
DETAILS="${3:-}"
STAMP="$(date -u +'%Y-%m-%d %H:%M UTC')"
DAY="$(date -u +'%Y-%m-%d')"

# AI log entry
{
  echo ""
  echo "### $STAMP | $TYPE | $SUMMARY"
  [ -n "$DETAILS" ] && echo "$DETAILS"
} >> docs/AI_LOG.md

# Changelog entry under [Unreleased]
LINE="- **$TYPE** ($DAY): $SUMMARY"
TMP="$(mktemp)"
awk -v line="$LINE" '{print} /^## \[Unreleased\]/ && !done {print line; done=1}' CHANGELOG.md > "$TMP"
mv "$TMP" CHANGELOG.md

git add -A
git commit -m "$TYPE: $SUMMARY"
echo "Logged and committed: $TYPE: $SUMMARY"
