import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const workflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const releaseConfigText = await readFile(new URL('../releasebox.config.json', import.meta.url), 'utf8');
const releasePolicy = JSON.parse(releaseConfigText).release;
const tag = process.argv[2] ?? process.env.RELEASE_TAG;
const expectedTag = `v${packageJson.version}`;

const failures = [];

const publishesNpm = releasePolicy.publishNpm === true;
const runsNpmPublish = /^\s*run:\s*npm publish(?:\s|$)/m.test(workflow);

if (runsNpmPublish !== publishesNpm) {
  failures.push(`release workflow npm publish step must ${publishesNpm ? 'be present' : 'be absent'} to match release.publishNpm`);
}

if (publishesNpm && (!packageJson.publishConfig || packageJson.publishConfig.access !== 'public')) {
  failures.push('package.json publishConfig.access must be "public" when npm publishing is enabled');
}

if (publishesNpm && packageJson.publishConfig?.provenance !== true) {
  failures.push('package.json publishConfig.provenance must be true when npm publishing is enabled');
}

if (publishesNpm !== /^\s*id-token:\s*write\s*$/m.test(workflow)) {
  failures.push(`release workflow id-token: write permission must ${publishesNpm ? 'be present' : 'be absent'} to match npm publishing policy`);
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
