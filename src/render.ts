import { ProofBundle } from './types.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderMarkdown(bundle: ProofBundle): string {
  const artifactLines = bundle.artifacts.map((artifact) => `- **${artifact.title}** (${artifact.type}) → \`${artifact.bundledPath}\``).join('\n') || '- None';
  const checkLines = bundle.checks.map((check) => `- **${check.title}**: ${check.status.toUpperCase()} (exit ${check.exitCode})`).join('\n') || '- None';
  const commitLines = bundle.git.commits.map((commit) => `- \`${commit.sha.slice(0, 7)}\` ${commit.subject} — ${commit.author}`).join('\n') || '- None';
  const changedFiles = bundle.git.changedFiles.map((file) => `- \`${file}\``).join('\n') || '- None';
  const risks = bundle.reviewer.risks.map((risk) => `- ${risk}`).join('\n') || '- None';
  const nextSteps = bundle.reviewer.nextSteps.map((step) => `- ${step}`).join('\n') || '- None';

  return `# ${bundle.summary.title}\n\n${bundle.summary.overview}\n\n## Repository\n\n- Branch: \`${bundle.git.branch}\`\n- Head: \`${bundle.git.head}\`\n- Generated: ${bundle.generatedAt}\n\n## Commits\n\n${commitLines}\n\n## Changed Files\n\n${changedFiles}\n\n## Checks\n\n${checkLines}\n\n## Artifacts\n\n${artifactLines}\n\n## Risks\n\n${risks}\n\n## Next Steps\n\n${nextSteps}\n`;
}

export function renderPrComment(bundle: ProofBundle): string {
  return [
    `## ProofDock: ${bundle.summary.title}`,
    '',
    bundle.summary.overview,
    '',
    `- Branch: \`${bundle.git.branch}\``,
    `- Head: \`${bundle.git.head.slice(0, 7)}\``,
    `- Bundle: \`${bundle.output.htmlPath}\``,
    `- JSON: \`${bundle.output.jsonPath}\``,
    '',
    '### Checks',
    ...bundle.checks.map((check) => `- ${check.title}: ${check.status.toUpperCase()} (exit ${check.exitCode})`),
  ].join('\n');
}

export function renderHtml(bundle: ProofBundle): string {
  const markdown = renderMarkdown(bundle);
  const checks = bundle.checks.map((check) => `<li><strong>${escapeHtml(check.title)}</strong>: ${escapeHtml(check.status)} (exit ${check.exitCode})<pre>${escapeHtml(`${check.stdout}${check.stderr ? `\n${check.stderr}` : ''}`)}</pre></li>`).join('');
  const artifacts = bundle.artifacts.map((artifact) => `<li><strong>${escapeHtml(artifact.title)}</strong> (${escapeHtml(artifact.type)}) — <code>${escapeHtml(artifact.bundledPath)}</code>${artifact.preview ? `<pre>${escapeHtml(artifact.preview)}</pre>` : ''}</li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(bundle.summary.title)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 2rem auto; max-width: 960px; padding: 0 1rem; line-height: 1.5; }
    pre { background: #111827; color: #f9fafb; padding: 1rem; overflow: auto; border-radius: 8px; }
    code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(bundle.summary.title)}</h1>
  <p>${escapeHtml(bundle.summary.overview)}</p>
  <h2>Repository</h2>
  <ul>
    <li>Branch: <code>${escapeHtml(bundle.git.branch)}</code></li>
    <li>Head: <code>${escapeHtml(bundle.git.head)}</code></li>
    <li>Generated: ${escapeHtml(bundle.generatedAt)}</li>
  </ul>
  <h2>Checks</h2>
  <ul>${checks || '<li>None</li>'}</ul>
  <h2>Artifacts</h2>
  <ul>${artifacts || '<li>None</li>'}</ul>
  <h2>Markdown Summary</h2>
  <pre>${escapeHtml(markdown)}</pre>
</body>
</html>`;
}
