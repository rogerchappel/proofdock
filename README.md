# proofdock

proofdock turns scattered agent evidence into a portable local mini-site and JSON bundle for review.

## Status

This repository is an early StackForge scaffold. The public contract is the PRD-driven V1 described in `docs/PRD.md`; implementation should stay local-first, deterministic, and reviewable.

## What it will do

- Collect explicitly declared evidence paths and command outputs.
- Render proofdock/index.html and proofdock/proof.json.
- Organize commits, checks, changed files, screenshots, logs, risks, and next steps.
- Redact obvious token patterns before writing bundles.

## Install

```sh
npm install proofdock
```

For local development from this repository:

```sh
npm install
npm test
```

## CLI sketch

```sh
proofdock init
proofdock collect --config proofdock.config.json
proofdock render --out ./proofdock
proofdock summary --format markdown
```

These commands describe the intended V1 interface from the PRD. Keep implementation changes aligned with `docs/TASKS.md` and update this section as behavior lands.

## Local-first safety

- No hidden network calls in core flows.
- No credential exfiltration or secret value printing.
- No destructive filesystem or Git operations without explicit user intent.
- Prefer deterministic JSON/Markdown output that agents and humans can review.

## Verify

Run the local validation script before opening a pull request:

```sh
npm test
bash scripts/validate.sh
```

`scripts/validate.sh` checks required repo files and runs package scripts that exist. Missing optional `agent-qc` is treated as a skip, not a failure.

## Documentation

- [Product requirements](docs/PRD.md)
- [Task breakdown](docs/TASKS.md)
- [Orchestration plan](docs/ORCHESTRATION.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT
