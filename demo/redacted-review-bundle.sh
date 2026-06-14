#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/examples/redacted-review"
OUT_DIR="${TMPDIR:-/tmp}/proofdock-redacted-review"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build
node dist/cli.js collect --config "$EXAMPLE_DIR/proofdock.config.json" --out "$OUT_DIR" >/tmp/proofdock-redacted-review.json

test -s "$OUT_DIR/proof.json"
test -s "$OUT_DIR/summary.md"
test -s "$OUT_DIR/index.html"
test -s "$OUT_DIR/pr-comment.md"

grep -q "Redacted review bundle" "$OUT_DIR/summary.md"
grep -q "\\[REDACTED\\]" "$OUT_DIR/proof.json"
grep -q "\\[REDACTED\\]" "$OUT_DIR/index.html"

node --input-type=module - "$OUT_DIR/proof.json" <<'NODE'
import { readFileSync } from 'node:fs';

const bundle = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const sensitive = ['ghp_demo12345678901234567890', 'sk-demo12345678901234567890'];
const generatedText = [
  ...bundle.artifacts.map((artifact) => artifact.preview ?? ''),
  ...bundle.checks.flatMap((check) => [check.stdout ?? '', check.stderr ?? '']),
].join('\n');

for (const value of sensitive) {
  if (generatedText.includes(value)) {
    console.error(`Expected generated previews and command output to redact ${value}`);
    process.exit(1);
  }
}

if (!generatedText.includes('[REDACTED]')) {
  console.error('Expected generated previews and command output to include [REDACTED]');
  process.exit(1);
}
NODE

echo "Proof JSON: $OUT_DIR/proof.json"
echo "Summary: $OUT_DIR/summary.md"
echo "HTML bundle: $OUT_DIR/index.html"
echo "PR comment: $OUT_DIR/pr-comment.md"
