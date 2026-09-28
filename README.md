# proofdock

proofdock assembles a local proof-of-work bundle for agent or developer changes. It collects explicit artifacts, runs allowlisted checks, and emits portable review outputs: JSON, Markdown, HTML, and a PR-comment snippet.

## What ships in this MVP

- `proofdock init` to create a starter config
- `proofdock collect` to validate artifacts and build a bundle
- `proofdock render` to regenerate HTML/Markdown from `proof.json`
- `proofdock summary` to print Markdown or JSON for handoff workflows
- Secret redaction for obvious token patterns before bundle output is written

## Quickstart

proofdock is not currently available from the npm registry. For checkout-based
development, clone this repository and run:

```sh
npm install
npm run build

node dist/cli.js init
# edit proofdock.config.json to point at your evidence files
node dist/cli.js collect --config proofdock.config.json
open proofdock/index.html
```

The published `v0.1.0` GitHub release also includes the verified source package
[`proofdock-0.1.0.tgz`](https://github.com/rogerchappel/proofdock/releases/download/v0.1.0/proofdock-0.1.0.tgz).
Download and inspect that artifact when you need the released snapshot; do not
use `npm install proofdock` until the package becomes available on npm.

Config fields are validated before collection. `summary.title` and
`summary.overview` are strings; `repo.root` is an optional string; and
`redact` is an optional boolean. Each artifact requires a non-empty `path`,
each glob requires a non-empty `pattern`, and each command requires a
non-empty `id` plus a non-empty `command` array of non-empty strings. Optional
titles, `titlePrefix`, and `cwd` are strings, `allowFailure` is a boolean, and
artifact/glob `type` is one of `note`, `log`, `screenshot`, or `file`.
`reviewer.risks` and `reviewer.nextSteps` are arrays of strings when provided.

Generated bundle contents:

- `proofdock/proof.json`
- `proofdock/summary.md`
- `proofdock/index.html`
- `proofdock/pr-comment.md`
- `proofdock/artifacts/...`

After the package is installed or linked, the same flow is available through
the published bin:

```sh
proofdock init
proofdock collect --config proofdock.config.json
proofdock summary --input proofdock/proof.json --format markdown
```

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

`render` and both `summary` formats validate the complete `proof.json` structure
before producing output. Malformed JSON or a missing/wrongly typed nested field
exits with code 1 and a stable `INVALID_PROOF_BUNDLE` diagnostic naming the
invalid input or field. A failed `render` does not create its requested output
directory or write partial files.

Options are command-specific. Values are required after `--config`, `--out`,
`--input`, and `--format`; `--force` is the only valueless command option.
Unknown options, positional arguments, and summary formats other than `markdown`
or `json` are rejected with a usage error.

Collection excludes the resolved output directory from glob discovery, including
custom `--out` directories inside the repository. Repeating `collect` therefore
rebuilds the same artifact set instead of collecting files from an earlier proof
bundle. Explicit artifacts elsewhere in the repository remain included.

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
- `bash demo/reviewer-handoff-bundle.sh` runs that reviewer handoff flow and checks the generated bundle files.
- [Redacted Review Bundle](docs/tutorials/redacted-review-bundle.md) uses fake token-shaped fixture data to show redacted previews and command output.
- `bash demo/redacted-review-bundle.sh` verifies generated previews and command output contain `[REDACTED]`.
- [Summary Export for PR Review](docs/tutorials/summary-export-for-pr-review.md) produces Markdown and JSON summaries from the reviewer handoff bundle.
- `bash demo/summary-export-demo.sh` verifies both summary export formats for the fixture bundle.
- [PR comment summary demo](docs/tutorials/pr-comment-summary-demo.md) shows how to derive a smaller Markdown handoff from an existing bundle.
- [Demo runbook](docs/promo/demo-runbook.md) gives a promotion-safe sequence for reviewer handoff, redaction, and summary export clips.
- [PR Comment Export Demo](docs/tutorials/pr-comment-export.md) focuses on the copyable `pr-comment.md` handoff.
- `bash demo/pr-comment-export-demo.sh` verifies the generated PR comment snippet from the reviewer handoff fixture.
- [Release Evidence Bundle](docs/tutorials/release-evidence-bundle.md) packages a release handoff note and verification log into review outputs.
- `bash demo/release-evidence-bundle.sh` verifies the release evidence fixture and generated PR comment.
- [CI Readiness Bundle](docs/tutorials/ci-readiness-bundle.md) packages a CI-change handoff note and verification log into reviewer-ready outputs.
- `bash demo/ci-readiness-bundle.sh` verifies the generated CI readiness bundle and PR comment.
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
npm run release:availability
```

The package smoke and release check use `npm pack --dry-run`, so pull requests
validate the published file list without publishing. `release:availability`
performs read-only GitHub and npm lookups and reports each distribution channel
independently; it never creates a release or publishes a package. The tag
workflow is the only automated publication path:

1. Set `package.json` to the intended version and merge the fully verified
   change.
2. Push the matching tag (for example, version `0.2.0` requires tag `v0.2.0`).
3. The workflow validates the exact tag/version pair, builds and tests the
   package, creates the tarball, publishes it to npm with provenance, and then
   creates the GitHub release with that tarball.

Configure npm trusted publishing for the `release.yml` workflow before tagging.
No long-lived npm token is required. If npm publication fails, no GitHub release
is created; fix the trusted-publisher or package configuration and rerun the
failed job. If npm succeeds but GitHub release creation fails, do not publish
again: create the GitHub release from the workflow tarball, or rerun only after
confirming the package version already exists on npm.

### Recovering an existing release tag

Use the **Release recovery** workflow only when the matching immutable tag
already exists but the ordinary tag workflow did not finish. In GitHub Actions,
choose **Release recovery**, select **Run workflow**, enter the exact existing
tag (for example, `v0.1.0`), and enable **Confirm this is recovery**.

The recovery job checks out that tag, verifies that `HEAD`, the requested tag,
and `package.json` version agree, and runs the tagged revision's
`npm run release:check` before packing anything. It also runs the preserved,
non-publishing availability check so both distribution states are visible
before recovery proceeds. It preserves trusted-publishing
provenance and public access. It queries npm before publishing and queries
GitHub before creating a release, so rerunning after either partial success does
not attempt to publish the same package version or create the same release
again.

If validation or the tagged checks fail, fix the source on a new version and
tag; do not move or replace the existing tag. If npm publication fails, correct
the trusted-publisher or package configuration and rerun recovery. If npm
publication succeeds but release creation fails, rerun recovery: the npm step
will be skipped and only the missing GitHub release will be created. If the
GitHub release already exists but npm is missing, recovery publishes the package
and leaves the existing release unchanged.
