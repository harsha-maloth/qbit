#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
chmod +x scripts/*.sh .githooks/*
echo "Git hooks enabled (pre-commit changelog check)."
