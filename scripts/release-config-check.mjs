import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const workflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const tag = process.argv[2] ?? process.env.RELEASE_TAG;
const expectedTag = `v${packageJson.version}`;

const failures = [];

if (!packageJson.publishConfig || packageJson.publishConfig.access !== 'public') {
  failures.push('package.json publishConfig.access must be "public"');
}

if (packageJson.publishConfig?.provenance !== true) {
  failures.push('package.json publishConfig.provenance must be true');
}

if (!/^\s*id-token:\s*write\s*$/m.test(workflow)) {
  failures.push('release workflow must grant id-token: write for npm trusted publishing');
}

if (!/^\s*-\s+(?:name:\s*Publish package to npm[\s\S]*?\n\s+)?run:\s*npm publish(?:\s|$)/m.test(workflow)) {
  failures.push('release workflow must run npm publish (npm pack alone does not publish)');
}

if (!/^\s*-\s+name:\s*Create GitHub release\s*$/m.test(workflow)) {
  failures.push('release workflow must retain the GitHub release step');
}

if (tag && tag !== expectedTag) {
  failures.push(`release tag ${JSON.stringify(tag)} must match package version ${JSON.stringify(expectedTag)}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`release config error: ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`release config ok: package ${packageJson.name}@${packageJson.version}${tag ? `, tag ${tag}` : ''}`);
}
