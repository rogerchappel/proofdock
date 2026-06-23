# Summary Export for PR Review

This recipe turns the checked-in reviewer handoff fixture into two compact
outputs that are easy to paste into a PR or hand to another reviewer:

- `review-comment.md` for a human-readable handoff
- `review-comment.json` for tools that want the same bundle facts

## Run the Demo

```sh
npm install
bash demo/summary-export-demo.sh
```

The script builds the CLI, collects `examples/reviewer-handoff`, then runs
`proofdock summary` in Markdown and JSON modes.

## What to Show

Open the generated Markdown file first and point out that the title, overview,
artifacts, checks, risks, and next steps all come from the local config and
bundle output. Then open the JSON file to show the same handoff shape without
screen-scraping the HTML report.

## Safety Notes

This demo uses public fixture content. For real PRs, keep configs explicit,
avoid broad globs, and review generated summaries before pasting them into a
public thread.
