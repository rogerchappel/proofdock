#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/examples/reviewer-handoff"
OUT_DIR="${TMPDIR:-/tmp}/proofdock-pr-comment-export"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null
node dist/cli.js collect --config "$EXAMPLE_DIR/proofdock.config.json" --out "$OUT_DIR" >/dev/null

test -s "$OUT_DIR/pr-comment.md"
test -s "$OUT_DIR/summary.md"
grep -Fq "Reviewer handoff proof bundle" "$OUT_DIR/pr-comment.md"
grep -Fq "Git status: PASSED" "$OUT_DIR/pr-comment.md"

echo "PR comment snippet: $OUT_DIR/pr-comment.md"
echo "Full summary: $OUT_DIR/summary.md"
