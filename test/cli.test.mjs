import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createFixtureRepo } from './helpers.mjs';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve('dist/cli.js');

test('cli summary emits markdown', async () => {
  const repoRoot = await createFixtureRepo();
  await execFileAsync('node', [cliPath, 'collect', '--config', path.join(repoRoot, 'proofdock.config.json')], { cwd: repoRoot });
  const { stdout } = await execFileAsync('node', [cliPath, 'summary', '--input', path.join(repoRoot, 'proofdock', 'proof.json')], { cwd: repoRoot });
  assert.match(stdout, /## Checks/);
});
