import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ProofdockError } from './errors.js';

export async function ensureDir(targetPath: string): Promise<void> {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function resolveInside(root: string, value: string): string {
  const resolved = path.resolve(root, value);
  const relative = path.relative(root, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ProofdockError('PATH_OUTSIDE_ROOT', `Path escapes repository root: ${value}`);
  }

  return resolved;
}

export async function walk(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

export function globToRegExp(pattern: string): RegExp {
  const normalized = pattern.replaceAll('\\', '/');
  const escaped = normalized.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const withDoubleStar = escaped.replaceAll('**', '::DOUBLE_STAR::');
  const withSingleStar = withDoubleStar.replaceAll('*', '[^/]*');
  const withGlob = withSingleStar.replaceAll('::DOUBLE_STAR::', '.*');
  return new RegExp(`^${withGlob}$`);
}

export function isTextFile(filePath: string): boolean {
  return /\.(txt|md|log|json|ya?ml|csv|html?)$/i.test(filePath);
}
