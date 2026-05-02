import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function createFixtureRepo() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'proofdock-'));
  await fs.mkdir(path.join(root, 'notes'), { recursive: true });
  await fs.mkdir(path.join(root, 'artifacts', 'screenshots'), { recursive: true });
  await fs.writeFile(path.join(root, 'notes', 'handoff.md'), '# Handoff\n\nToken: ghp_abcdefghijklmnopqrstuvwxyz123456\n');
  await fs.writeFile(path.join(root, 'artifacts', 'test.log'), 'tests ok\nAuthorization: Bearer secretvalue\n');
  await fs.writeFile(path.join(root, 'artifacts', 'screenshots', 'step.txt'), 'pretend screenshot');
  await fs.writeFile(path.join(root, 'feature.txt'), 'feature ready\n');
  await execFileAsync('git', ['init'], { cwd: root });
  await execFileAsync('git', ['config', 'user.name', 'Proof Dock'], { cwd: root });
  await execFileAsync('git', ['config', 'user.email', 'proof@example.com'], { cwd: root });
  await execFileAsync('git', ['add', '.'], { cwd: root });
  await execFileAsync('git', ['commit', '-m', 'initial commit'], { cwd: root });
  await fs.writeFile(path.join(root, 'feature.txt'), 'feature ready\nmore proof\n');
  await execFileAsync('git', ['add', 'feature.txt'], { cwd: root });
  await execFileAsync('git', ['commit', '-m', 'add feature'], { cwd: root });

  const config = {
    version: 1,
    summary: {
      title: 'Fixture proof bundle',
      overview: 'Collect evidence for the latest change.',
    },
    artifacts: [
      { path: 'notes/handoff.md', title: 'Agent handoff', type: 'note' },
      { path: 'artifacts/test.log', title: 'Test log', type: 'log' }
    ],
    globs: [
      { pattern: 'artifacts/screenshots/*', type: 'screenshot', titlePrefix: 'Screenshot' }
    ],
    commands: [
      { id: 'git-status', title: 'Git status', command: ['git', 'status', '--short'] },
      { id: 'echo', title: 'Echo', command: ['node', '-e', 'console.log("token=sk-abcdefghijklmnopqrstuvwxyz")'] }
    ],
    reviewer: {
      risks: ['Needs manual visual review.'],
      nextSteps: ['Attach summary.md to the handoff.']
    },
    redact: true
  };

  await fs.writeFile(path.join(root, 'proofdock.config.json'), `${JSON.stringify(config, null, 2)}\n`);
  return root;
}
