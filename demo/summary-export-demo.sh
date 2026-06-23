#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/examples/reviewer-handoff"
OUT_DIR="${TMPDIR:-/tmp}/proofdock-summary-export"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build
node dist/cli.js collect --config "$EXAMPLE_DIR/proofdock.config.json" --out "$OUT_DIR" >/tmp/proofdock-summary-export-collect.json
node dist/cli.js summary --input "$OUT_DIR/proof.json" --format markdown >"$OUT_DIR/review-comment.md"
node dist/cli.js summary --input "$OUT_DIR/proof.json" --format json >"$OUT_DIR/review-comment.json"

test -s "$OUT_DIR/proof.json"
test -s "$OUT_DIR/review-comment.md"
test -s "$OUT_DIR/review-comment.json"
grep -q "Reviewer handoff proof bundle" "$OUT_DIR/review-comment.md"

node --input-type=module - "$OUT_DIR/review-comment.json" <<'NODE'
import { readFileSync } from 'node:fs';

const summary = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (summary.summary?.title !== 'Reviewer handoff proof bundle') {
  console.error(`Unexpected summary title: ${summary.summary?.title}`);
  process.exit(1);
}
if (!Array.isArray(summary.checks) || summary.checks.length < 2) {
  console.error('Expected at least two command checks in the JSON summary');
  process.exit(1);
}
NODE

echo "Markdown review comment: $OUT_DIR/review-comment.md"
echo "JSON review summary: $OUT_DIR/review-comment.json"
