# Review Handoff

This fixture demonstrates how a reviewer can inspect ProofDock output when a
local log contains obvious token-shaped values.

The values in `artifacts/agent.log` are fake and intentionally shaped like
common credentials so the generated Markdown, HTML, JSON preview, and PR comment
can show redaction behavior.

## Review Focus

- Confirm that generated previews replace token-shaped values with `[REDACTED]`.
- Confirm that the original fixture remains local sample data and is not posted
  anywhere by ProofDock.
