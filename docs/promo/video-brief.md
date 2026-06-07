# Video Brief: Turn Agent Evidence Into a Review Bundle

## Grounded Product Facts

- ProofDock builds local proof bundles for agent or developer changes.
- `collect` reads explicit artifacts and runs configured local commands.
- Outputs include JSON, Markdown, HTML, and a PR-comment snippet.
- The core flow is local-first and does not post to GitHub or upload artifacts.
- Text previews and command output can redact obvious token and private-key patterns.

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

## Avoid Claiming

- Do not claim ProofDock verifies correctness of the change.
- Do not claim automatic PR posting.
- Do not claim secret redaction catches every possible secret format.

