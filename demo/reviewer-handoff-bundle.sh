#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/examples/reviewer-handoff"
OUT_DIR="${TMPDIR:-/tmp}/proofdock-reviewer-handoff"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build
node dist/cli.js collect --config "$EXAMPLE_DIR/proofdock.config.json" --out "$OUT_DIR"
node dist/cli.js summary --input "$OUT_DIR/proof.json" --format markdown >"$OUT_DIR/summary-from-cli.md"

test -s "$OUT_DIR/proof.json"
test -s "$OUT_DIR/summary.md"
test -s "$OUT_DIR/index.html"
test -s "$OUT_DIR/pr-comment.md"
grep -q "Reviewer handoff proof bundle" "$OUT_DIR/summary.md"

echo "Proof JSON: $OUT_DIR/proof.json"
echo "Summary: $OUT_DIR/summary.md"
echo "HTML bundle: $OUT_DIR/index.html"
echo "PR comment: $OUT_DIR/pr-comment.md"
