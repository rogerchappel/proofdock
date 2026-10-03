import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

test('release workflow honors the reviewed npm publishing policy', async () => {
  const configPath = new URL('../releasebox.config.json', import.meta.url);
  const workflowPath = new URL('../.github/workflows/release.yml', import.meta.url);
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const workflow = await readFile(workflowPath, 'utf8');
  const shouldPublish = config.release.publishNpm === true;
  assert.equal(/^\\s*run:\\s*npm publish(?:\\s|$)/m.test(workflow), shouldPublish);
  assert.equal(/^\\s*id-token:\\s*write\\s*$/m.test(workflow), shouldPublish);

  const check = spawnSync(process.execPath, ['scripts/release-config-check.mjs'], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});
