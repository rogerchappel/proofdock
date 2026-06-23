# Social Hooks

Short draft posts grounded in ProofDock's current CLI behavior.

## Hook pack

1. Review evidence gets scattered across notes, logs, screenshots, and terminal output. ProofDock collects explicit local artifacts into one static proof bundle.

2. A useful agent handoff should be portable. ProofDock emits `proof.json`, `summary.md`, `index.html`, and `pr-comment.md` from a checked-in config.

3. ProofDock is local-first: it reads configured artifacts, runs allowlisted commands, redacts obvious secrets, and writes static review outputs.

4. The reviewer handoff demo shows the full loop: note, sample test log, git facts, Markdown summary, HTML bundle, and PR-comment snippet.

5. This is not a CI replacement. It is a way to package the evidence a reviewer needs after a change is made.

6. The redacted review demo uses fake token-shaped fixture data to show how ProofDock keeps generated summaries readable without exposing obvious credential patterns.

7. Need a lightweight promo clip? Run `bash demo/redacted-review-bundle.sh`, open `index.html`, and show `[REDACTED]` in the generated review evidence.

8. Prefer a PR-comment-sized demo? `bash demo/summary-export-demo.sh` writes the same reviewer handoff as Markdown and JSON without uploading anything.

## Demo CTA

```sh
npm install
bash demo/reviewer-handoff-bundle.sh
bash demo/redacted-review-bundle.sh
bash demo/summary-export-demo.sh
```

## Limits to say plainly

ProofDock does not upload results, post comments, merge PRs, or prove that a change is correct. The bundle is only as useful as the artifacts and commands configured for the task. Redaction is aimed at obvious credential-shaped strings in generated previews and command output, not every possible secret format.
