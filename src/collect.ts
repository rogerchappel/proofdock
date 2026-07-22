import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { loadConfig, resolveRepoRoot } from './config.js';
import { ProofdockError } from './errors.js';
import { collectGitInfo } from './git.js';
import { ensureDir, exists, globToRegExp, isTextFile, resolveInside, walk } from './fs-utils.js';
import { redactText } from './redact.js';
import { renderHtml, renderMarkdown, renderPrComment } from './render.js';
import { ProofArtifact, ProofBundle, ProofCheck, ProofdockConfig } from './types.js';

const execFileAsync = promisify(execFile);

export interface CollectOptions {
  configPath: string;
  outDir?: string;
}

async function runCommand(command: string[], cwd: string, redact: boolean): Promise<ProofCheck> {
  const [bin, ...args] = command;
  if (!bin) {
    throw new ProofdockError('INVALID_COMMAND', 'Command entries must include at least one argv item.');
  }

  try {
    const { stdout, stderr } = await execFileAsync(bin, args, { cwd, encoding: 'utf8' });
    return {
      id: command.join(' '),
      title: command.join(' '),
      cwd,
      command,
      exitCode: 0,
      status: 'passed',
      stdout: redact ? redactText(stdout.trimEnd()) : stdout.trimEnd(),
      stderr: redact ? redactText(stderr.trimEnd()) : stderr.trimEnd(),
    };
  } catch (error) {
    const failure = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number | string };
    return {
      id: command.join(' '),
      title: command.join(' '),
      cwd,
      command,
      exitCode: typeof failure.code === 'number' ? failure.code : 1,
      status: 'failed',
      stdout: redact ? redactText((failure.stdout ?? '').trimEnd()) : (failure.stdout ?? '').trimEnd(),
      stderr: redact ? redactText((failure.stderr ?? failure.message).trimEnd()) : (failure.stderr ?? failure.message).trimEnd(),
    };
  }
}

async function collectArtifacts(config: ProofdockConfig, repoRoot: string, bundleArtifactDir: string, redact: boolean): Promise<ProofArtifact[]> {
  const declared = [...(config.artifacts ?? [])];
  const files = await walk(repoRoot);

  for (const globInput of config.globs ?? []) {
    const matcher = globToRegExp(globInput.pattern);
    const matches = files
      .map((filePath) => path.relative(repoRoot, filePath).replaceAll(path.sep, '/'))
      .filter((relativePath) => matcher.test(relativePath));

    for (const match of matches) {
      declared.push({
        path: match,
        title: globInput.titlePrefix ? `${globInput.titlePrefix}: ${path.basename(match)}` : path.basename(match),
        type: globInput.type ?? 'file',
      });
    }
  }

  const deduped = new Map<string, ProofArtifact>();

  for (const item of declared) {
    const sourcePath = resolveInside(repoRoot, item.path);
    if (!await exists(sourcePath)) {
      throw new ProofdockError('MISSING_ARTIFACT', `Referenced artifact does not exist: ${item.path}`);
    }

    const relativeSourcePath = path.relative(repoRoot, sourcePath);
    const bundledPath = path.join('artifacts', relativeSourcePath).replaceAll(path.sep, '/');
    const outputPath = path.join(bundleArtifactDir, relativeSourcePath);
    await ensureDir(path.dirname(outputPath));

    const mediaType = isTextFile(sourcePath) ? 'text' : 'binary';
    let preview: string | undefined;

    if (mediaType === 'text') {
      const source = await fs.readFile(sourcePath, 'utf8');
      const bundled = redact ? redactText(source) : source;
      preview = bundled.slice(0, 2000);

      if (redact) {
        await fs.writeFile(outputPath, bundled);
      } else {
        await fs.copyFile(sourcePath, outputPath);
      }
    } else {
      await fs.copyFile(sourcePath, outputPath);
    }

    deduped.set(relativeSourcePath, {
      sourcePath,
      relativeSourcePath: relativeSourcePath.replaceAll(path.sep, '/'),
      bundledPath,
      title: item.title ?? path.basename(relativeSourcePath),
      type: item.type ?? 'file',
      mediaType,
      preview,
    });
  }

  return [...deduped.values()].sort((a, b) => a.relativeSourcePath.localeCompare(b.relativeSourcePath));
}

export async function collectProof(options: CollectOptions): Promise<ProofBundle> {
  const configPath = path.resolve(options.configPath);
  const config = await loadConfig(configPath);
  const repoRoot = resolveRepoRoot(configPath, config.repo?.root);
  const outDir = path.resolve(path.dirname(configPath), options.outDir ?? 'proofdock');
  const artifactRoot = path.join(outDir, 'artifacts');
  const redact = config.redact !== false;

  await ensureDir(artifactRoot);
  const git = await collectGitInfo(repoRoot);
  const artifacts = await collectArtifacts(config, repoRoot, artifactRoot, redact);

  const checks: ProofCheck[] = [];
  for (const command of config.commands ?? []) {
    const cwd = command.cwd ? resolveInside(repoRoot, command.cwd) : repoRoot;
    const result = await runCommand(command.command, cwd, redact);
    checks.push({ ...result, id: command.id, title: command.title ?? command.id });
    if (result.status === 'failed' && !command.allowFailure) {
      throw new ProofdockError('COMMAND_FAILED', `Configured command failed: ${command.id}`, result);
    }
  }

  const bundle: ProofBundle = {
    generatedAt: new Date().toISOString(),
    configPath,
    repoRoot,
    summary: config.summary,
    git,
    artifacts,
    checks,
    reviewer: {
      risks: config.reviewer?.risks ?? [],
      nextSteps: config.reviewer?.nextSteps ?? [],
    },
    output: {
      jsonPath: 'proof.json',
      markdownPath: 'summary.md',
      htmlPath: 'index.html',
      prCommentPath: 'pr-comment.md',
    },
  };

  await fs.writeFile(path.join(outDir, bundle.output.jsonPath), JSON.stringify(bundle, null, 2));
  await fs.writeFile(path.join(outDir, bundle.output.markdownPath), renderMarkdown(bundle));
  await fs.writeFile(path.join(outDir, bundle.output.htmlPath), renderHtml(bundle));
  await fs.writeFile(path.join(outDir, bundle.output.prCommentPath), renderPrComment(bundle));

  return bundle;
}
