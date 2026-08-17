# Release evidence bundle

This recipe packages release-review evidence into the same static outputs that a
reviewer can inspect locally or paste into a PR.

## Run it

```sh
bash demo/release-evidence-bundle.sh
```

The demo builds the CLI, collects `examples/release-evidence/proofdock.config.json`,
and verifies these generated files:

- `${TMPDIR:-/tmp}/proofdock-release-evidence-bundle/proof.json`
- `${TMPDIR:-/tmp}/proofdock-release-evidence-bundle/summary.md`
- `${TMPDIR:-/tmp}/proofdock-release-evidence-bundle/pr-comment.md`

Set `OUT_DIR` to write the bundle somewhere else. The default stays outside the
checkout so collecting Git status does not add the bundle to its own evidence.

## What to replace in a real release

- Swap `notes/handoff.md` for the actual release summary.
- Swap `artifacts/check.log` for real command output.
- Keep the command list narrow and local so the bundle remains review-focused.

## Promotion angle

Show the generated `pr-comment.md` first, then open `summary.md` for the fuller
artifact list. That keeps the demo focused on the maintainer workflow rather
than the implementation details.
