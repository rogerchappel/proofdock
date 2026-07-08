# PR Comment Export Social Hooks

Grounding: `demo/pr-comment-export-demo.sh` runs against
`examples/reviewer-handoff/proofdock.config.json` and verifies the generated
`pr-comment.md`.

## Hooks

1. Agent review handoffs do not need to be a wall of pasted terminal output.
   `proofdock` can collect local evidence and emit a copyable PR comment
   snippet from the same bundle.

2. Tiny demo idea: run `bash demo/pr-comment-export-demo.sh`, open the generated
   `pr-comment.md`, then show the matching `summary.md` beside it.

3. `proofdock` stays local-first: checked-in fixture config, generated Markdown,
   HTML, JSON, and no posting to GitHub on your behalf.

## Clip beats

1. Show the reviewer handoff config.
2. Run `bash demo/pr-comment-export-demo.sh`.
3. Open the printed `pr-comment.md` path.
4. Mention that the same run also produces `summary.md` and the full bundle.
