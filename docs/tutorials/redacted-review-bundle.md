# Redacted Review Bundle

This recipe uses a checked-in fixture with fake token-shaped values to show how
ProofDock redacts generated text previews and command output.

## Run

```bash
npm install
bash demo/redacted-review-bundle.sh
```

The script builds the CLI, collects the example bundle, and verifies that
generated previews and command output contain `[REDACTED]` instead of the fake
token strings.

Generated files:

- `/tmp/proofdock-redacted-review/proof.json`
- `/tmp/proofdock-redacted-review/summary.md`
- `/tmp/proofdock-redacted-review/index.html`
- `/tmp/proofdock-redacted-review/pr-comment.md`

## What It Demonstrates

ProofDock can keep local review reports readable when logs or command output
contain obvious token-shaped values. With `redact: true`, artifact previews and
configured command output are redacted before they appear in `proof.json` and
the generated HTML bundle.

The original artifact copy remains part of the local bundle for reviewers who
need the raw file, so this is a review-safety feature rather than a credential
management system.

## Promotion Angle

Use this demo when explaining that ProofDock is local-first and evidence-focused:
it packages notes, logs, git facts, and command output while making common
credential-shaped strings less likely to leak through summaries.
