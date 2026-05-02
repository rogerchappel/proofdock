#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { collectProof } from './collect.js';
import { defaultConfig } from './config.js';
import { ProofdockError } from './errors.js';
import { renderHtml, renderMarkdown, renderPrComment } from './render.js';

interface ParsedArgs {
  command?: string;
  flags: Map<string, string | boolean>;
  positionals: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value.startsWith('--')) {
      const key = value.slice(2);
      const next = rest[index + 1];
      if (next && !next.startsWith('--')) {
        flags.set(key, next);
        index += 1;
      } else {
        flags.set(key, true);
      }
    } else {
      positionals.push(value);
    }
  }

  return { command, flags, positionals };
}

function helpText(): string {
  return `proofdock ${process.env.npm_package_version ?? '0.1.0'}

Usage:
  proofdock init [--config proofdock.config.json] [--force]
  proofdock collect --config proofdock.config.json [--out proofdock]
  proofdock render --input proofdock/proof.json [--out proofdock]
  proofdock summary --input proofdock/proof.json [--format markdown|json]
`;
}

async function commandInit(flags: Map<string, string | boolean>): Promise<void> {
  const configPath = path.resolve(String(flags.get('config') ?? 'proofdock.config.json'));
  const force = flags.get('force') === true;
  let alreadyExists = false;

  try {
    await fs.access(configPath);
    alreadyExists = true;
  } catch {
    alreadyExists = false;
  }

  if (alreadyExists && !force) {
    throw new ProofdockError('CONFIG_EXISTS', `Config already exists: ${configPath}`);
  }

  await fs.writeFile(configPath, `${JSON.stringify(defaultConfig(), null, 2)}\n`);
  process.stdout.write(`${configPath}\n`);
}

async function commandRender(flags: Map<string, string | boolean>): Promise<void> {
  const input = path.resolve(String(flags.get('input') ?? 'proofdock/proof.json'));
  const outDir = path.resolve(String(flags.get('out') ?? path.dirname(input)));
  const bundle = JSON.parse(await fs.readFile(input, 'utf8'));
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'summary.md'), renderMarkdown(bundle));
  await fs.writeFile(path.join(outDir, 'index.html'), renderHtml(bundle));
  await fs.writeFile(path.join(outDir, 'pr-comment.md'), renderPrComment(bundle));
  process.stdout.write(`${path.join(outDir, 'index.html')}\n`);
}

async function commandSummary(flags: Map<string, string | boolean>): Promise<void> {
  const input = path.resolve(String(flags.get('input') ?? 'proofdock/proof.json'));
  const format = String(flags.get('format') ?? 'markdown');
  const bundle = JSON.parse(await fs.readFile(input, 'utf8'));

  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${renderMarkdown(bundle)}\n`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help')) {
    process.stdout.write(helpText());
    return;
  }

  if (argv.includes('--version')) {
    process.stdout.write('0.1.0\n');
    return;
  }

  const parsed = parseArgs(argv);

  switch (parsed.command) {
    case 'init':
      await commandInit(parsed.flags);
      return;
    case 'collect': {
      const configPath = parsed.flags.get('config');
      if (typeof configPath !== 'string') {
        throw new ProofdockError('MISSING_ARG', 'collect requires --config <path>.');
      }
      const bundle = await collectProof({
        configPath,
        outDir: typeof parsed.flags.get('out') === 'string' ? String(parsed.flags.get('out')) : undefined,
      });
      process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
      return;
    }
    case 'render':
      await commandRender(parsed.flags);
      return;
    case 'summary':
      await commandSummary(parsed.flags);
      return;
    default:
      throw new ProofdockError('UNKNOWN_COMMAND', `Unknown command: ${parsed.command}`);
  }
}

main().catch((error: unknown) => {
  if (error instanceof ProofdockError) {
    process.stderr.write(`${JSON.stringify({ error: { code: error.code, message: error.message, details: error.details ?? null } }, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  const unexpected = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
  process.stderr.write(`${JSON.stringify({ error: { code: 'UNEXPECTED', ...unexpected } }, null, 2)}\n`);
  process.exitCode = 1;
});
