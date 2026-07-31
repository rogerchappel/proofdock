import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validator = path.join(root, 'scripts/release-recovery-check.mjs');

async function repository(version = '1.2.3') {
  const directory = await mkdtemp(path.join(tmpdir(), 'proofdock-release-recovery-'));
  execFileSync('git', ['init', '--quiet'], { cwd: directory });
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'proofdock', version }));
  execFileSync('git', ['add', 'package.json'], { cwd: directory });
  execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '--quiet', '-m', 'fixture'], { cwd: directory });
  execFileSync('git', ['tag', `v${version}`], { cwd: directory });
  return directory;
}

test('accepts a checkout at the requested matching tag', async () => {
  const cwd = await repository();
  const result = spawnSync(process.execPath, [validator, 'v1.2.3'], { cwd, encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /release recovery ok: proofdock@1\.2\.3, tag v1\.2\.3/);
});

test('rejects a requested tag whose version differs from package.json', async () => {
  const cwd = await repository();
  const result = spawnSync(process.execPath, [validator, 'v1.2.4'], { cwd, encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not match package version/);
});

test('rejects HEAD when it has moved beyond the requested tag', async () => {
  const cwd = await repository();
  await writeFile(path.join(cwd, 'after-tag.txt'), 'later\n');
  execFileSync('git', ['add', 'after-tag.txt'], { cwd });
  execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '--quiet', '-m', 'later'], { cwd });
  const result = spawnSync(process.execPath, [validator, 'v1.2.3'], { cwd, encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /HEAD .* is not requested tag/);
});

test('workflow skips duplicate npm publication and GitHub release creation', async () => {
  const workflow = await readFile(path.join(root, '.github/workflows/release-recovery.yml'), 'utf8');

  assert.match(workflow, /elif grep -q 'E404'/);
  assert.match(workflow, /refusing to publish/);
  assert.match(workflow, /Package already exists on npm; skipping publication/);
  assert.match(workflow, /gh api --paginate/);
  assert.match(workflow, /grep -Fxq "\$RECOVERY_TAG"/);
  assert.match(workflow, /GitHub release already exists; skipping release creation/);
});
