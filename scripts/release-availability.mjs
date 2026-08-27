import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function availability(response, label) {
  if (response.status === 404) return 'missing';
  if (response.ok) return 'available';
  throw new Error(`${label} lookup failed with HTTP ${response.status}`);
}

export async function checkReleaseAvailability({
  fetch: fetchImpl = globalThis.fetch,
  githubApiUrl = 'https://api.github.com',
  npmRegistryUrl = 'https://registry.npmjs.org',
  repository,
  packageName,
  version
}) {
  const tag = `v${version}`;
  const githubUrl = `${githubApiUrl.replace(/\/$/, '')}/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`;
  const npmUrl = `${npmRegistryUrl.replace(/\/$/, '')}/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
  const [githubResponse, npmResponse] = await Promise.all([
    fetchImpl(githubUrl, { headers: { accept: 'application/vnd.github+json' } }),
    fetchImpl(npmUrl, { headers: { accept: 'application/json' } })
  ]);

  return {
    version,
    tag,
    githubRelease: await availability(githubResponse, 'GitHub release'),
    npmPackage: await availability(npmResponse, 'npm package')
  };
}

async function main() {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const repository = process.env.GITHUB_REPOSITORY || 'rogerchappel/proofdock';
  const result = await checkReleaseAvailability({
    githubApiUrl: process.env.GITHUB_API_URL,
    npmRegistryUrl: process.env.NPM_REGISTRY_URL,
    repository,
    packageName: pkg.name,
    version: pkg.version
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
