#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/examples/release-evidence"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/tmp/release-evidence-bundle}"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build
node dist/cli.js collect --config "$EXAMPLE_DIR/proofdock.config.json" --out "$OUT_DIR"
node dist/cli.js summary --input "$OUT_DIR/proof.json" --format markdown > "$OUT_DIR/summary-from-cli.md"

test -s "$OUT_DIR/proof.json"
test -s "$OUT_DIR/summary.md"
test -s "$OUT_DIR/pr-comment.md"
grep -q "Release evidence bundle" "$OUT_DIR/summary.md"
grep -q "Package metadata present" "$OUT_DIR/pr-comment.md"

printf 'Wrote release evidence bundle to %s\n' "$OUT_DIR"
