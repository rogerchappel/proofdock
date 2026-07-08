# PR Comment Export Demo

This demo shows the smallest review handoff path for a maintainer who wants a
copyable PR comment instead of opening the full HTML bundle.

## Run it

```sh
bash demo/pr-comment-export-demo.sh
```

The script builds the local CLI, collects the checked-in
`examples/reviewer-handoff/proofdock.config.json` fixture, and verifies that the
generated `pr-comment.md` contains the reviewer handoff title and a passing
check summary.

## What it proves

- `proofdock collect` can turn a fixture config into review artifacts.
- The generated PR comment is a standalone Markdown file.
- The fuller `summary.md` is still available beside the copyable snippet.

## Expected outputs

The demo prints the temporary paths for:

- `pr-comment.md`
- `summary.md`

Use the PR comment snippet when the reviewer needs a compact handoff, and open
the summary or HTML bundle when the reviewer needs the artifact list and command
details.
