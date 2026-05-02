import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { redactText } from './redact.js';

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd, encoding: 'utf8' });
  return stdout.trimEnd();
}

export async function collectGitInfo(repoRoot: string) {
  const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD'], repoRoot);
  const head = await git(['rev-parse', 'HEAD'], repoRoot);
  const log = await git(['log', '--max-count=5', "--pretty=format:%H%x09%an%x09%s"], repoRoot);
  const diff = await git(['diff', '--name-only', 'HEAD~1..HEAD'], repoRoot).catch(() => '');
  const status = await git(['status', '--short'], repoRoot);

  return {
    branch,
    head,
    commits: log
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [sha = '', author = '', subject = ''] = line.split('\t');
        return { sha, author: redactText(author), subject: redactText(subject) };
      }),
    changedFiles: diff.split('\n').filter(Boolean).map((value) => path.normalize(value)),
    status: status.split('\n').filter(Boolean).map((value) => redactText(value)),
  };
}
