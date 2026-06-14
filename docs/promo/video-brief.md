# Video Brief: Turn Agent Evidence Into a Review Bundle

## Grounded Product Facts

- ProofDock builds local proof bundles for agent or developer changes.
- `collect` reads explicit artifacts and runs configured local commands.
- Outputs include JSON, Markdown, HTML, and a PR-comment snippet.
- The core flow is local-first and does not post to GitHub or upload artifacts.
- Text previews and command output can redact obvious token and private-key patterns.
- The `examples/redacted-review` fixture uses fake token-shaped data for a safe redaction walkthrough.

## 90-Second Flow

1. Show `examples/reviewer-handoff/proofdock.config.json`.
2. Run:

   ```bash
   npm run build
   node dist/cli.js collect --config examples/reviewer-handoff/proofdock.config.json --out /tmp/proofdock-reviewer-handoff
   ```

3. Open `/tmp/proofdock-reviewer-handoff/summary.md`.
4. Show that `/tmp/proofdock-reviewer-handoff/index.html` and `pr-comment.md` were generated.
5. Run:

   ```bash
   node dist/cli.js summary --input /tmp/proofdock-reviewer-handoff/proof.json --format json
   ```

## Redaction Cutaway

1. Show `examples/redacted-review/artifacts/agent.log` and call out that the token-shaped strings are fake fixture data.
2. Run:

   ```bash
   bash demo/redacted-review-bundle.sh
   ```

3. Open `/tmp/proofdock-redacted-review/index.html` and point to `[REDACTED]` in the artifact preview and command output.
4. Mention that the raw copied artifact remains local in the bundle, so teams still need normal secret-handling discipline.

## Avoid Claiming

- Do not claim ProofDock verifies correctness of the change.
- Do not claim automatic PR posting.
- Do not claim secret redaction catches every possible secret format.
- Do not use the fake fixture values as real credentials or present them as leaked production data.
