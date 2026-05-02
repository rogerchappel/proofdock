import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'proofdock-smoke-'));

await fs.mkdir(path.join(repoRoot, 'notes'), { recursive: true });
await fs.mkdir(path.join(repoRoot, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(repoRoot, 'notes', 'handoff.md'), '# Smoke\n');
await fs.writeFile(path.join(repoRoot, 'artifacts', 'test.log'), 'ok\n');
await execFileAsync('git', ['init'], { cwd: repoRoot });
await execFileAsync('git', ['config', 'user.name', 'Smoke Test'], { cwd: repoRoot });
await execFileAsync('git', ['config', 'user.email', 'smoke@example.com'], { cwd: repoRoot });
await execFileAsync('git', ['add', '.'], { cwd: repoRoot });
await execFileAsync('git', ['commit', '-m', 'smoke'], { cwd: repoRoot });

const config = {
  version: 1,
  summary: { title: 'Smoke proof', overview: 'Smoke test bundle.' },
  artifacts: [
    { path: 'notes/handoff.md', title: 'Handoff', type: 'note' },
    { path: 'artifacts/test.log', title: 'Test log', type: 'log' }
  ],
  commands: [
    { id: 'git-status', title: 'Git status', command: ['git', 'status', '--short'] }
  ],
  redact: true
};

await fs.writeFile(path.join(repoRoot, 'proofdock.config.json'), `${JSON.stringify(config, null, 2)}\n`);
const cli = path.resolve('dist/cli.js');
await execFileAsync('node', [cli, 'collect', '--config', path.join(repoRoot, 'proofdock.config.json')], { cwd: path.resolve('.') });
await fs.access(path.join(repoRoot, 'proofdock', 'proof.json'));
await fs.access(path.join(repoRoot, 'proofdock', 'summary.md'));
await fs.access(path.join(repoRoot, 'proofdock', 'index.html'));
console.log('smoke ok');
