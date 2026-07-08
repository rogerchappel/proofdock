# ProofDock demo runbook

Use this runbook to record public demo footage without showing private
repositories or credentials. Every step uses checked-in fixtures.

## Setup

```bash
npm install
npm run build
```

## Reviewer handoff proof

```bash
bash demo/reviewer-handoff-bundle.sh
```

Show:

- `examples/reviewer-handoff/proofdock.config.json`
- `/tmp/proofdock-reviewer-handoff/summary.md`
- `/tmp/proofdock-reviewer-handoff/index.html`
- `/tmp/proofdock-reviewer-handoff/pr-comment.md`

The point of the clip is that one local command turns explicit notes, logs, and
allowlisted command output into a portable review bundle.

## Redaction cutaway

```bash
bash demo/redacted-review-bundle.sh
```

Show:

- the fake token-shaped values in `examples/redacted-review/artifacts/agent.log`
- `[REDACTED]` in `/tmp/proofdock-redacted-review/summary.md`
- the generated HTML bundle

Say plainly that the fixture values are synthetic and that redaction is for
obvious credential-shaped text in generated previews and command output.

## Summary export

```bash
bash demo/summary-export-demo.sh
```

Show the Markdown and JSON summary files when the audience cares about handoff
automation more than the HTML report.

## Claims to avoid

- Do not claim ProofDock proves a change is correct.
- Do not claim it uploads artifacts or comments on PRs.
- Do not claim redaction catches every possible secret format.
