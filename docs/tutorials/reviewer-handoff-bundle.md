# Reviewer Handoff Bundle

This recipe creates a local ProofDock bundle from the checked-in reviewer handoff example.

## Run

```bash
npm install
npm run build
node dist/cli.js collect --config examples/reviewer-handoff/proofdock.config.json --out /tmp/proofdock-reviewer-handoff
node dist/cli.js summary --input /tmp/proofdock-reviewer-handoff/proof.json --format markdown
```

Generated files:

- `/tmp/proofdock-reviewer-handoff/proof.json`
- `/tmp/proofdock-reviewer-handoff/summary.md`
- `/tmp/proofdock-reviewer-handoff/index.html`
- `/tmp/proofdock-reviewer-handoff/pr-comment.md`

## What It Demonstrates

ProofDock reads explicit artifacts from config, runs allowlisted local commands, redacts obvious token patterns in text output when enabled, and renders portable review outputs without posting to a remote service.

