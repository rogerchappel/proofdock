# PRD: proofdock

Status: ready
Decision: build now

## Scorecard

Total: 88/100
Band: build now
Last scored: 2026-05-02
Scored by: Atlas

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Clear pain in high-throughput agentic development workflows. |
| Demand signal | 17/20 | Strong internal OSS sprint need plus adjacent public tooling demand. |
| V1 buildability | 18/20 | Feasible as a deterministic local-first CLI with fixtures and smoke tests. |
| Differentiation | 13/15 | Focused on agent handoff/review gaps rather than broad platform replacement. |
| Agentic workflow leverage | 15/15 | Directly improves agent dispatch, supervision, verification, or handoff quality. |
| Distribution potential | 7/10 | Easy to demo with real repo/PR workflows and build-in-public examples. |

## Pitch

A static proof bundle generator that turns commits, checks, screenshots, and agent notes into a reviewable local mini-site.

## Why It Matters

Agent work needs evidence, not vibes. PR descriptions, terminal logs, and screenshots get scattered across tools. ProofDock creates one portable review artifact that a human can open locally or attach to a PR.

## Qualification

### Pub Test

“A static proof bundle generator that turns commits, checks, screenshots, and agent notes into a reviewable local mini-site.” is understandable in one sentence by a developer who has used coding agents, CI, or multi-branch OSS workflows.

### Competitors / Adjacent Tools

- Storybook/Chromatic — prove visual review value, but are app/component oriented and often cloud-backed.
- GitHub Checks/Actions summaries — useful but tied to CI and not great for local agent proof.
- branchbrief/prpack — adjacent summary tools; ProofDock focuses on rich static evidence bundles.

### Star / Demand Signal

Agent coding workflows, CI-heavy repos, and local OSS factories repeatedly need better proof, isolation, reproducibility, and review affordances. The recent sprint pipeline already has `repoctx`, `taskbrief`, `branchbrief`, `qualitygate`, `prpack`, `tooltrace`, `stackforge`, and `crewcmd`; this idea fills a neighboring gap without replacing those projects.

### Real Problem

Roger's OSS sprint is pushing multiple agents, repos, branches, checks, and handoffs at once. This project removes one recurring source of ambiguity or failure from that pipeline while remaining useful to any developer team adopting coding agents.

### V1 Buildability

V1 can be implemented as a TypeScript CLI using deterministic filesystem/git/process operations, fixture repos, and Markdown/JSON output. It does not require a hosted backend, hidden LLM calls, or privileged credentials.

## V1 Scope

- `proofdock collect` gathers declared evidence paths and command outputs.
- Generate `proofdock/index.html` plus `proofdock/proof.json`.
- Sections for summary, commits, checks, changed files, screenshots, logs, risks, and next steps.
- Config file with allowlisted commands and attachment globs.
- PR comment Markdown snippet linking to bundle artifacts.
- Redaction pass for obvious tokens before writing the bundle.

## Out of Scope

- No hosted service.
- No hidden telemetry or cloud upload.
- No replacing CI or PR review.

## CLI/API Sketch

```bash
proofdock init
proofdock collect --config proofdock.config.json
proofdock render --out ./proofdock
proofdock summary --format markdown
```

## Verification

- Golden HTML/JSON snapshots from fixture evidence.
- Redaction tests for common token patterns.
- CLI smoke test in a temp git repo.
- No-network test for render path.

## Agent Prompt

Build `proofdock`, a local-first CLI that assembles a static proof-of-work bundle for agent-generated changes. Keep evidence collection explicit and allowlisted, emit portable HTML/JSON/Markdown, and include redaction safeguards.
