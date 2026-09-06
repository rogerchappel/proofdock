import { ProofdockError } from './errors.js';
import { ProofBundle } from './types.js';

type JsonObject = Record<string, unknown>;

function invalid(field: string, requirement: string): never {
  throw new ProofdockError('INVALID_PROOF_BUNDLE', `Proof bundle field ${field} ${requirement}.`);
}

function object(value: unknown, field: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) invalid(field, 'must be an object');
  return value as JsonObject;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') invalid(field, 'must be a string');
  return value;
}

function number(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) invalid(field, 'must be a finite number');
  return value;
}

function strings(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) invalid(field, 'must be an array');
  return value.map((item, index) => string(item, `${field}[${index}]`));
}

function records(value: unknown, field: string, validate: (item: JsonObject, field: string) => void): void {
  if (!Array.isArray(value)) invalid(field, 'must be an array');
  value.forEach((item, index) => validate(object(item, `${field}[${index}]`), `${field}[${index}]`));
}

function literal(value: unknown, field: string, allowed: readonly string[]): void {
  if (typeof value !== 'string' || !allowed.includes(value)) invalid(field, `must be one of: ${allowed.join(', ')}`);
}

export function parseProofBundle(source: string, input: string): ProofBundle {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new ProofdockError('INVALID_PROOF_BUNDLE', `Proof bundle input is not valid JSON: ${input}.`);
  }

  const bundle = object(value, '<root>');
  string(bundle.generatedAt, 'generatedAt');
  string(bundle.configPath, 'configPath');
  string(bundle.repoRoot, 'repoRoot');

  const summary = object(bundle.summary, 'summary');
  string(summary.title, 'summary.title');
  string(summary.overview, 'summary.overview');

  const git = object(bundle.git, 'git');
  string(git.branch, 'git.branch');
  string(git.head, 'git.head');
  strings(git.changedFiles, 'git.changedFiles');
  strings(git.status, 'git.status');
  records(git.commits, 'git.commits', (commit, field) => {
    string(commit.sha, `${field}.sha`);
    string(commit.subject, `${field}.subject`);
    string(commit.author, `${field}.author`);
  });

  records(bundle.artifacts, 'artifacts', (artifact, field) => {
    string(artifact.sourcePath, `${field}.sourcePath`);
    string(artifact.relativeSourcePath, `${field}.relativeSourcePath`);
    string(artifact.bundledPath, `${field}.bundledPath`);
    string(artifact.title, `${field}.title`);
    literal(artifact.type, `${field}.type`, ['note', 'log', 'screenshot', 'file']);
    literal(artifact.mediaType, `${field}.mediaType`, ['text', 'binary']);
    if (artifact.preview !== undefined) string(artifact.preview, `${field}.preview`);
  });

  records(bundle.checks, 'checks', (check, field) => {
    string(check.id, `${field}.id`);
    string(check.title, `${field}.title`);
    string(check.cwd, `${field}.cwd`);
    strings(check.command, `${field}.command`);
    number(check.exitCode, `${field}.exitCode`);
    literal(check.status, `${field}.status`, ['passed', 'failed']);
    string(check.stdout, `${field}.stdout`);
    string(check.stderr, `${field}.stderr`);
  });

  const reviewer = object(bundle.reviewer, 'reviewer');
  strings(reviewer.risks, 'reviewer.risks');
  strings(reviewer.nextSteps, 'reviewer.nextSteps');

  const output = object(bundle.output, 'output');
  string(output.jsonPath, 'output.jsonPath');
  string(output.markdownPath, 'output.markdownPath');
  string(output.htmlPath, 'output.htmlPath');
  string(output.prCommentPath, 'output.prCommentPath');

  return bundle as unknown as ProofBundle;
}
