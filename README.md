# proofdock

proofdock assembles a local proof-of-work bundle for agent or developer changes. It collects explicit artifacts, runs allowlisted checks, and emits portable review outputs: JSON, Markdown, HTML, and a PR-comment snippet.

## What ships in this MVP

- `proofdock init` to create a starter config
- `proofdock collect` to validate artifacts and build a bundle
- `proofdock render` to regenerate HTML/Markdown from `proof.json`
- `proofdock summary` to print Markdown or JSON for handoff workflows
- Secret redaction for obvious token patterns before bundle output is written

## 60-second demo

```sh
npm install
npm run build

node dist/cli.js init
# edit proofdock.config.json to point at your evidence files
node dist/cli.js collect --config proofdock.config.json
open proofdock/index.html
```

Generated bundle contents:

- `proofdock/proof.json`
- `proofdock/summary.md`
- `proofdock/index.html`
- `proofdock/pr-comment.md`
- `proofdock/artifacts/...`

## Config example

```json
{
  "version": 1,
  "summary": {
    "title": "Proof bundle for retry fix",
    "overview": "Shows the patch, checks, and handoff notes for review."
  },
  "artifacts": [
    { "path": "notes/handoff.md", "title": "Agent handoff", "type": "note" },
    { "path": "artifacts/test.log", "title": "Test log", "type": "log" }
  ],
  "globs": [
    { "pattern": "artifacts/screenshots/*", "type": "screenshot", "titlePrefix": "Screenshot" }
  ],
  "commands": [
    { "id": "git-status", "title": "Git status", "command": ["git", "status", "--short"] },
    { "id": "unit", "title": "Unit tests", "command": ["npm", "test"], "allowFailure": true }
  ],
  "reviewer": {
    "risks": ["UI change still needs a visual pass."],
    "nextSteps": ["Attach summary.md to the agent handoff."]
  },
  "redact": true
}
```

## CLI reference

```sh
proofdock init [--config proofdock.config.json] [--force]
proofdock collect --config proofdock.config.json [--out proofdock]
proofdock render --input proofdock/proof.json [--out proofdock]
proofdock summary --input proofdock/proof.json [--format markdown|json]
```

## Safety model

- Local-first only; no network calls in the core flow
- Explicit config for commands and artifacts
- Rejects artifact paths that escape the repo root
- Fails fast when a referenced artifact is missing
- Redacts obvious token and private-key patterns in text outputs

## Agent handoff example

A practical sprint flow:

1. Agent writes `notes/handoff.md`
2. Checks write logs into `artifacts/`
3. Screenshots land in `artifacts/screenshots/`
4. `proofdock collect --config proofdock.config.json`
5. Reviewer opens `proofdock/index.html` or reads `proofdock/summary.md`
6. `proofdock/pr-comment.md` gets pasted into the PR or handoff thread

This fits well beside tools like `branchbrief`, `prpack`, and local review bundles.

## Demo Recipes

- [Reviewer Handoff Bundle](docs/tutorials/reviewer-handoff-bundle.md) uses checked-in sample artifacts to generate JSON, Markdown, HTML, and PR-comment outputs.
- [Video brief](docs/promo/video-brief.md) outlines a grounded walkthrough for promotion or screencast prep.

## Non-goals

- No hosted service
- No telemetry
- No automatic PR posting or cloud upload
- No CI replacement

## Development

```sh
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Task breakdown](docs/TASKS.md)
- [Orchestration plan](docs/ORCHESTRATION.md)
- [Machine-readable orchestration](docs/orchestration.json)

## License

MIT

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

The package smoke uses `npm pack --dry-run` so the published file list can be reviewed without publishing.
