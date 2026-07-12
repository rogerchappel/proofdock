# CI Readiness Bundle

This recipe shows how to turn a local CI-readiness handoff into a static proof
bundle before a reviewer enables or edits automation.

## Run it

```sh
npm install
bash demo/ci-readiness-bundle.sh
```

The demo builds Proofdock, collects `examples/ci-readiness`, and writes the
bundle under `${TMPDIR:-/tmp}/proofdock-ci-readiness`.

Generated files:

- `proof.json` with the durable bundle metadata.
- `summary.md` for a readable review handoff.
- `index.html` for a local static review page.
- `pr-comment.md` for a copyable pull-request note.

## What the demo verifies

- The CI handoff note is included as an artifact.
- The verification log is present in the generated summary.
- The PR-comment and HTML outputs are created from the same bundle.
- The package metadata command runs locally and is captured in `proof.json`.

Use this when a branch changes CI, release checks, package smoke tests, or other
automation where the reviewer needs evidence and caveats in one place. The
fixture uses safe sample logs, so replace them with fresh command output before
using the pattern for a real release or workflow change.
