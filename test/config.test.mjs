import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadConfig } from '../dist/index.js';

const baseConfig = () => ({
  version: 1,
  summary: { title: 'Proof', overview: 'Evidence' }
});

async function writeConfig(config) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'proofdock-config-'));
  const configPath = path.join(directory, 'proofdock.json');
  await fs.writeFile(configPath, JSON.stringify(config));
  return configPath;
}

for (const [field, mutate] of [
  ['summary.title', (config) => { config.summary.title = 1; }],
  ['summary.overview', (config) => { config.summary.overview = null; }],
  ['repo.root', (config) => { config.repo = { root: false }; }],
  ['artifacts[0]', (config) => { config.artifacts = [null]; }],
  ['artifacts[0].path', (config) => { config.artifacts = [{ path: ' ' }]; }],
  ['artifacts[0].title', (config) => { config.artifacts = [{ path: 'proof.txt', title: 1 }]; }],
  ['artifacts[0].type', (config) => { config.artifacts = [{ path: 'proof.txt', type: 'video' }]; }],
  ['globs[0]', (config) => { config.globs = [null]; }],
  ['globs[0].pattern', (config) => { config.globs = [{ pattern: '' }]; }],
  ['globs[0].titlePrefix', (config) => { config.globs = [{ pattern: '*', titlePrefix: false }]; }],
  ['commands[0]', (config) => { config.commands = [null]; }],
  ['commands[0].id', (config) => { config.commands = [{ id: 0, command: ['true'] }]; }],
  ['commands[0].command', (config) => { config.commands = [{ id: 'test', command: [] }]; }],
  ['commands[0].command[1]', (config) => { config.commands = [{ id: 'test', command: ['npm', 1] }]; }],
  ['commands[0].cwd', (config) => { config.commands = [{ id: 'test', command: ['true'], cwd: 1 }]; }],
  ['commands[0].allowFailure', (config) => { config.commands = [{ id: 'test', command: ['true'], allowFailure: 'yes' }]; }],
  ['reviewer.risks', (config) => { config.reviewer = { risks: 'none' }; }],
  ['reviewer.nextSteps[0]', (config) => { config.reviewer = { nextSteps: [false] }; }],
  ['redact', (config) => { config.redact = 'yes'; }]
]) {
  test(`loadConfig rejects malformed ${field}`, async () => {
    const config = baseConfig();
    mutate(config);
    await assert.rejects(loadConfig(await writeConfig(config)), (error) => {
      assert.equal(error.code, 'INVALID_CONFIG');
      assert.match(error.message, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      return true;
    });
  });
}

test('loadConfig accepts all valid optional nested configuration', async () => {
  const config = {
    ...baseConfig(),
    repo: { root: '.' },
    artifacts: [{ path: 'proof.txt', title: 'Proof', type: 'file' }],
    globs: [{ pattern: 'logs/*.txt', type: 'log', titlePrefix: 'Log' }],
    commands: [{ id: 'tests', title: 'Tests', command: ['npm', 'test'], cwd: '.', allowFailure: true }],
    reviewer: { risks: ['None'], nextSteps: ['Review'] },
    redact: false
  };

  assert.deepEqual(await loadConfig(await writeConfig(config)), config);
});
