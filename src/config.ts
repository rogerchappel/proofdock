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

  if (!config.summary || typeof config.summary !== 'object') {
    throw new ProofdockError('INVALID_CONFIG', 'Config summary is required.');
  }

  const summary = config.summary as Record<string, unknown>;
  if (typeof summary.title !== 'string' || typeof summary.overview !== 'string') {
    throw new ProofdockError('INVALID_CONFIG', 'Config summary.title and summary.overview must be strings.');
  }

  for (const key of ['artifacts', 'globs', 'commands'] as const) {
    const entry = config[key];
    if (entry !== undefined && !Array.isArray(entry)) {
      throw new ProofdockError('INVALID_CONFIG', `${key} must be an array when provided.`);
    }
  }
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
