import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ProofdockError } from './errors.js';
import { ProofdockConfig } from './types.js';

export async function loadConfig(configPath: string): Promise<ProofdockConfig> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await fs.readFile(configPath, 'utf8'));
  } catch (error) {
    throw new ProofdockError('CONFIG_READ_FAILED', `Unable to read config: ${configPath}`, error);
  }

  validateConfig(parsed);
  return parsed;
}

function validateConfig(value: unknown): asserts value is ProofdockConfig {
  if (!value || typeof value !== 'object') {
    throw new ProofdockError('INVALID_CONFIG', 'Config must be a JSON object.');
  }

  const config = value as Record<string, unknown>;

  if (config.version !== 1) {
    throw new ProofdockError('INVALID_CONFIG', 'Config version must be 1.');
  }

  const summary = requireObject(config.summary, 'summary');
  requireString(summary.title, 'summary.title');
  requireString(summary.overview, 'summary.overview');

  const repo = optionalObject(config.repo, 'repo');
  if (repo) optionalString(repo.root, 'repo.root');

  const artifacts = optionalArray(config.artifacts, 'artifacts');
  artifacts?.forEach((entry, index) => {
    const field = `artifacts[${index}]`;
    const artifact = requireObject(entry, field);
    requireNonEmptyString(artifact.path, `${field}.path`);
    optionalString(artifact.title, `${field}.title`);
    optionalArtifactType(artifact.type, `${field}.type`);
  });

  const globs = optionalArray(config.globs, 'globs');
  globs?.forEach((entry, index) => {
    const field = `globs[${index}]`;
    const glob = requireObject(entry, field);
    requireNonEmptyString(glob.pattern, `${field}.pattern`);
    optionalArtifactType(glob.type, `${field}.type`);
    optionalString(glob.titlePrefix, `${field}.titlePrefix`);
  });

  const commands = optionalArray(config.commands, 'commands');
  commands?.forEach((entry, index) => {
    const field = `commands[${index}]`;
    const command = requireObject(entry, field);
    requireNonEmptyString(command.id, `${field}.id`);
    optionalString(command.title, `${field}.title`);
    const argv = requireArray(command.command, `${field}.command`);
    if (argv.length === 0) invalid(`${field}.command`, 'must not be empty');
    argv.forEach((argument, argumentIndex) => requireNonEmptyString(argument, `${field}.command[${argumentIndex}]`));
    optionalString(command.cwd, `${field}.cwd`);
    optionalBoolean(command.allowFailure, `${field}.allowFailure`);
  });

  const reviewer = optionalObject(config.reviewer, 'reviewer');
  if (reviewer) {
    optionalStringArray(reviewer.risks, 'reviewer.risks');
    optionalStringArray(reviewer.nextSteps, 'reviewer.nextSteps');
  }

  optionalBoolean(config.redact, 'redact');
}

const artifactTypes = new Set(['note', 'log', 'screenshot', 'file']);

function invalid(field: string, requirement: string): never {
  throw new ProofdockError('INVALID_CONFIG', `Config ${field} ${requirement}.`);
}

function requireObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(field, 'must be an object');
  return value as Record<string, unknown>;
}

function optionalObject(value: unknown, field: string): Record<string, unknown> | undefined {
  return value === undefined ? undefined : requireObject(value, field);
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) invalid(field, 'must be an array');
  return value;
}

function optionalArray(value: unknown, field: string): unknown[] | undefined {
  return value === undefined ? undefined : requireArray(value, field);
}

function requireString(value: unknown, field: string): void {
  if (typeof value !== 'string') invalid(field, 'must be a string');
}

function requireNonEmptyString(value: unknown, field: string): void {
  if (typeof value !== 'string' || value.trim() === '') invalid(field, 'must be a non-empty string');
}

function optionalString(value: unknown, field: string): void {
  if (value !== undefined) requireString(value, field);
}

function optionalBoolean(value: unknown, field: string): void {
  if (value !== undefined && typeof value !== 'boolean') invalid(field, 'must be a boolean');
}

function optionalArtifactType(value: unknown, field: string): void {
  if (value !== undefined && (typeof value !== 'string' || !artifactTypes.has(value))) {
    invalid(field, 'must be one of note, log, screenshot, or file');
  }
}

function optionalStringArray(value: unknown, field: string): void {
  if (value === undefined) return;
  const entries = requireArray(value, field);
  entries.forEach((entry, index) => requireString(entry, `${field}[${index}]`));
}

export function defaultConfig(): ProofdockConfig {
  return {
    version: 1,
    summary: {
      title: 'Proof bundle',
      overview: 'Describe the change, the evidence, and what a reviewer should verify.',
    },
    artifacts: [
      { path: 'notes/handoff.md', title: 'Agent handoff', type: 'note' },
      { path: 'artifacts/test.log', title: 'Test log', type: 'log' },
    ],
    globs: [
      { pattern: 'artifacts/screenshots/*', type: 'screenshot', titlePrefix: 'Screenshot' },
    ],
    commands: [
      { id: 'git-status', title: 'Git status', command: ['git', 'status', '--short'] },
      { id: 'tests', title: 'Test run', command: ['npm', 'test'], allowFailure: true },
    ],
    reviewer: {
      risks: ['Call out any known gaps or manual verification needs.'],
      nextSteps: ['List the next action after review or merge.'],
    },
    redact: true,
  };
}

export function resolveRepoRoot(configPath: string, rootFromConfig?: string): string {
  const baseDir = path.dirname(path.resolve(configPath));
  return path.resolve(baseDir, rootFromConfig ?? '.');
}
