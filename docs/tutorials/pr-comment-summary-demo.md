# PR comment summary demo

This recipe shows how to turn an existing ProofDock bundle into a compact
review comment without uploading anything.

## Run

```bash
npm install
npm run build
bash demo/reviewer-handoff-bundle.sh
OUT_DIR="${TMPDIR:-/tmp}/proofdock-reviewer-handoff"
node dist/cli.js summary \
  --input "$OUT_DIR/proof.json" \
  --format markdown > "$OUT_DIR/comment-summary.md"
```

## Inspect

Open `${TMPDIR:-/tmp}/proofdock-reviewer-handoff/comment-summary.md` and
compare it with:

- `${TMPDIR:-/tmp}/proofdock-reviewer-handoff/summary.md`
- `${TMPDIR:-/tmp}/proofdock-reviewer-handoff/pr-comment.md`
- `${TMPDIR:-/tmp}/proofdock-reviewer-handoff/proof.json`

The summary command is useful when a reviewer wants a smaller handoff artifact
after the full static bundle has already been generated.

## Verification

```bash
OUT_DIR="${TMPDIR:-/tmp}/proofdock-reviewer-handoff"
test -s "$OUT_DIR/comment-summary.md"
grep -q "Reviewer handoff" "$OUT_DIR/comment-summary.md"
```
