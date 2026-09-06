import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createFixtureRepo } from './helpers.mjs';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve('dist/cli.js');

async function runCli(args, cwd) {
  try {
    const result = await execFileAsync('node', [cliPath, ...args], { cwd });
    return { ...result, exitCode: 0 };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, exitCode: error.code };
  }
}

function assertUsageError(result, code, message) {
  assert.equal(result.exitCode, 1);
  const payload = JSON.parse(result.stderr);
  assert.equal(payload.error.code, code);
  assert.match(payload.error.message, message);
  assert.match(payload.error.message, /Run 'proofdock --help' for usage\./);
}

function assertBundleError(result, message) {
  assert.equal(result.exitCode, 1);
  const payload = JSON.parse(result.stderr);
  assert.equal(payload.error.code, 'INVALID_PROOF_BUNDLE');
  assert.match(payload.error.message, message);
  assert.equal(payload.error.details, null);
  assert.equal('stack' in payload.error, false);
}

async function collectedBundleFixture() {
  const repoRoot = await createFixtureRepo();
  await execFileAsync('node', [cliPath, 'collect', '--config', path.join(repoRoot, 'proofdock.config.json')], { cwd: repoRoot });
  const input = path.join(repoRoot, 'proofdock', 'proof.json');
  return { repoRoot, input, bundle: JSON.parse(await fs.readFile(input, 'utf8')) };
}

test('cli summary emits markdown', async () => {
  const repoRoot = await createFixtureRepo();
  await execFileAsync('node', [cliPath, 'collect', '--config', path.join(repoRoot, 'proofdock.config.json')], { cwd: repoRoot });
  const { stdout } = await execFileAsync('node', [cliPath, 'summary', '--input', path.join(repoRoot, 'proofdock', 'proof.json')], { cwd: repoRoot });
  assert.match(stdout, /## Checks/);
});

test('cli accepts documented init, collect, render, and summary forms', async () => {
  const repoRoot = await createFixtureRepo();
  const configPath = path.join(repoRoot, 'generated.config.json');
  await execFileAsync('node', [cliPath, 'init', '--config', configPath], { cwd: repoRoot });
  await execFileAsync('node', [cliPath, 'init', '--config', configPath, '--force'], { cwd: repoRoot });

  const sourceConfig = path.join(repoRoot, 'proofdock.config.json');
  const outDir = path.join(repoRoot, 'custom-proof');
  await execFileAsync('node', [cliPath, 'collect', '--config', sourceConfig, '--out', outDir], { cwd: repoRoot });
  await execFileAsync('node', [cliPath, 'render', '--input', path.join(outDir, 'proof.json'), '--out', outDir], { cwd: repoRoot });
  const markdown = await execFileAsync('node', [cliPath, 'summary', '--input', path.join(outDir, 'proof.json'), '--format', 'markdown'], { cwd: repoRoot });
  const json = await execFileAsync('node', [cliPath, 'summary', '--input', path.join(outDir, 'proof.json'), '--format', 'json'], { cwd: repoRoot });
  assert.match(markdown.stdout, /## Checks/);
  assert.ok(JSON.parse(json.stdout).checks);
});

test('cli rejects malformed proof JSON in both summary formats without an internal stack', async () => {
  const repoRoot = await createFixtureRepo();
  const input = path.join(repoRoot, 'malformed.json');
  await fs.writeFile(input, '{ not json');

  for (const format of ['markdown', 'json']) {
    const result = await runCli(['summary', '--input', input, '--format', format], repoRoot);
    assertBundleError(result, /Proof bundle input is not valid JSON: .*malformed\.json/);
  }
});

test('cli reports missing and wrongly typed nested proof fields', async () => {
  const fixture = await collectedBundleFixture();
  const cases = [
    [{}, /field generatedAt must be a string/],
    [{ ...fixture.bundle, summary: { ...fixture.bundle.summary, title: 1 } }, /field summary\.title must be a string/],
    [{ ...fixture.bundle, git: { ...fixture.bundle.git, commits: {} } }, /field git\.commits must be an array/],
    [{ ...fixture.bundle, checks: [{ ...fixture.bundle.checks[0], command: ['node', 1] }] }, /field checks\[0\]\.command\[1\] must be a string/],
  ];

  for (const [bundle, message] of cases) {
    const input = path.join(fixture.repoRoot, 'invalid.json');
    await fs.writeFile(input, JSON.stringify(bundle));
    assertBundleError(await runCli(['summary', '--input', input, '--format', 'json'], fixture.repoRoot), message);
  }
});

test('render validates a proof bundle before creating its output directory', async () => {
  const fixture = await collectedBundleFixture();
  const input = path.join(fixture.repoRoot, 'invalid-render.json');
  const outDir = path.join(fixture.repoRoot, 'must-not-exist');
  await fs.writeFile(input, JSON.stringify({ ...fixture.bundle, artifacts: 'invalid' }));

  const result = await runCli(['render', '--input', input, '--out', outDir], fixture.repoRoot);
  assertBundleError(result, /field artifacts must be an array/);
  await assert.rejects(fs.access(outDir), { code: 'ENOENT' });
});

test('cli rejects unknown flags and unexpected positionals', async () => {
  const repoRoot = await createFixtureRepo();
  assertUsageError(await runCli(['init', '--bogus'], repoRoot), 'UNKNOWN_OPTION', /Unknown option for init: --bogus/);
  assertUsageError(await runCli(['summary', 'proof.json'], repoRoot), 'UNEXPECTED_ARGUMENT', /Unexpected argument for summary: proof.json/);
});

test('cli rejects missing option values', async () => {
  const repoRoot = await createFixtureRepo();
  for (const [command, option] of [['init', '--config'], ['collect', '--out'], ['render', '--input'], ['summary', '--format']]) {
    assertUsageError(await runCli([command, option], repoRoot), 'MISSING_OPTION_VALUE', new RegExp(`${option} requires a value`));
  }
});

test('cli treats only --force as a valueless command option', async () => {
  const repoRoot = await createFixtureRepo();
  assertUsageError(await runCli(['collect', '--force'], repoRoot), 'UNKNOWN_OPTION', /Unknown option for collect: --force/);
  assertUsageError(await runCli(['init', '--force', 'extra'], repoRoot), 'UNEXPECTED_ARGUMENT', /Unexpected argument for init: extra/);
});

test('cli rejects unsupported summary formats before reading input', async () => {
  const repoRoot = await createFixtureRepo();
  const result = await runCli(['summary', '--input', 'missing.json', '--format', 'yaml'], repoRoot);
  assertUsageError(result, 'INVALID_OPTION_VALUE', /Unsupported --format value: yaml/);
  assert.doesNotMatch(result.stderr, /ENOENT|UNEXPECTED/);
});
