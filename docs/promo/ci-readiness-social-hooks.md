# CI Readiness Social Hooks

Use these drafts with the fixture-backed demo in
`demo/ci-readiness-bundle.sh`. They avoid claiming production CI results and
stay grounded in the local Proofdock flow.

## Short posts

- Before changing CI, bundle the reviewer evidence: handoff note, local check
  log, generated summary, and PR comment. Proofdock keeps that bundle local and
  reviewable.
- A CI change should not be a mystery diff. This Proofdock demo turns fixture
  logs into `proof.json`, `summary.md`, `index.html`, and `pr-comment.md`.
- Local-first release evidence: run one script, collect the handoff note and
  check output, then give reviewers a static bundle instead of scattered notes.

## Video angle

Show the fixture handoff, run `bash demo/ci-readiness-bundle.sh`, then open the
generated `summary.md` and `pr-comment.md`. Close by calling out the limitation:
the included log is a fixture and must be replaced with fresh output on a real
branch.
