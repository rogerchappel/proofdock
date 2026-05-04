import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'proofdock-package-smoke-'));
const packDir = path.join(tmpRoot, 'pack');
const installDir = path.join(tmpRoot, 'install');

await fs.mkdir(packDir, { recursive: true });
await fs.mkdir(installDir, { recursive: true });

try {
  const { stdout } = await execFileAsync('npm', ['pack', '--pack-destination', packDir, '--json'], { cwd: repoRoot });
  const packed = JSON.parse(stdout)[0];
  if (!packed?.filename) {
    throw new Error(`Could not determine packed filename from npm pack output: ${stdout}`);
  }

  const tarball = path.join(packDir, packed.filename);
  await execFileAsync('npm', ['init', '-y'], { cwd: installDir });
  await execFileAsync('npm', ['install', '--no-audit', '--no-fund', tarball], { cwd: installDir });

  const commands = [
    ['npx', ['--yes', 'proofdock', '--help']],
    ['npx', ['--yes', 'proofdock', '--version']],
    ['npx', ['--yes', 'proofdock', 'init']]
  ];

  for (const [command, args] of commands) {
    await execFileAsync(command, args, { cwd: installDir });
  }

  await fs.access(path.join(installDir, 'proofdock.config.json'));
  console.log(`package smoke ok: ${packed.filename}`);
} finally {
  await fs.rm(tmpRoot, { recursive: true, force: true });
}
