import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function gitStatusCheck(proof) {
  return proof.checks.find((check) => check.id === 'git-status');
}

test('release and reviewer demos preserve clean Git status evidence', async () => {
  const demoTmp = await mkdtemp(path.join(tmpdir(), 'proofdock-demo-sequence-'));
  const env = { ...process.env, TMPDIR: demoTmp };

  execFileSync('bash', ['demo/release-evidence-bundle.sh'], { cwd: root, env, stdio: 'pipe' });
  execFileSync('bash', ['demo/reviewer-handoff-bundle.sh'], { cwd: root, env, stdio: 'pipe' });

  for (const directory of ['proofdock-release-evidence-bundle', 'proofdock-reviewer-handoff']) {
    const proof = JSON.parse(await readFile(path.join(demoTmp, directory, 'proof.json'), 'utf8'));
    assert.deepEqual(proof.git.status, [], `${directory} recorded repository changes`);
    assert.equal(gitStatusCheck(proof)?.stdout, '', `${directory} git-status check was not clean`);
  }

  const status = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' });
  assert.equal(status, '', 'demo sequence created files inside the repository');
});
