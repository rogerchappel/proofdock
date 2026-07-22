import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { collectProof } from '../dist/index.js';
import { createFixtureRepo } from './helpers.mjs';

test('collectProof creates JSON, markdown, html, and redacted previews', async () => {
  const repoRoot = await createFixtureRepo();
  const secret = 'ghp_abcdefghijklmnopqrstuvwxyz123456';
  const bundle = await collectProof({
    configPath: path.join(repoRoot, 'proofdock.config.json'),
  });

  assert.equal(bundle.summary.title, 'Fixture proof bundle');
  assert.equal(bundle.artifacts.length, 3);
  assert.equal(bundle.checks.length, 2);
  const handoff = bundle.artifacts.find((artifact) => artifact.title === 'Agent handoff');
  assert.match(handoff?.preview ?? '', /\[REDACTED\]/);
  assert.match(bundle.checks[1].stdout, /\[REDACTED\]/);

  const markdown = await fs.readFile(path.join(repoRoot, 'proofdock', 'summary.md'), 'utf8');
  const jsonText = await fs.readFile(path.join(repoRoot, 'proofdock', 'proof.json'), 'utf8');
  const json = JSON.parse(jsonText);
  const html = await fs.readFile(path.join(repoRoot, 'proofdock', 'index.html'), 'utf8');
  const bundledHandoff = await fs.readFile(path.join(repoRoot, 'proofdock', 'artifacts', 'notes', 'handoff.md'), 'utf8');

  assert.match(markdown, /Fixture proof bundle/);
  assert.equal(json.summary.title, 'Fixture proof bundle');
  assert.match(html, /Markdown Summary/);
  assert.match(bundledHandoff, /\[REDACTED\]/);

  for (const output of [bundledHandoff, handoff?.preview ?? '', jsonText, markdown, html]) {
    assert.equal(output.includes(secret), false);
  }
});

test('collectProof rejects missing artifacts', async () => {
  const repoRoot = await createFixtureRepo();
  const configPath = path.join(repoRoot, 'proofdock.config.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  config.artifacts.push({ path: 'missing.txt' });
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

  await assert.rejects(
    () => collectProof({ configPath }),
    /Referenced artifact does not exist/
  );
});
