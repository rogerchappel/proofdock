# Social Hooks

Short draft posts grounded in ProofDock's current CLI behavior.

## Hook pack

1. Review evidence gets scattered across notes, logs, screenshots, and terminal output. ProofDock collects explicit local artifacts into one static proof bundle.

2. A useful agent handoff should be portable. ProofDock emits `proof.json`, `summary.md`, `index.html`, and `pr-comment.md` from a checked-in config.

3. ProofDock is local-first: it reads configured artifacts, runs allowlisted commands, redacts obvious secrets, and writes static review outputs.

4. The reviewer handoff demo shows the full loop: note, sample test log, git facts, Markdown summary, HTML bundle, and PR-comment snippet.

5. This is not a CI replacement. It is a way to package the evidence a reviewer needs after a change is made.

## Demo CTA

```sh
npm install
bash demo/reviewer-handoff-bundle.sh
```

## Limits to say plainly

ProofDock does not upload results, post comments, merge PRs, or prove that a change is correct. The bundle is only as useful as the artifacts and commands configured for the task.
