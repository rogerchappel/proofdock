#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const tag = process.argv[2];

function fail(message) {
  console.error(`release recovery error: ${message}`);
  process.exit(1);
}

if (!tag || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  fail('provide a version tag such as v0.1.0');
}

let packageJson;
try {
  packageJson = JSON.parse(await readFile('package.json', 'utf8'));
} catch (error) {
  fail(`cannot read package.json: ${error.message}`);
}

const expectedTag = `v${packageJson.version}`;
if (tag !== expectedTag) {
  fail(`requested tag ${JSON.stringify(tag)} does not match package version ${JSON.stringify(expectedTag)}`);
}

function gitRevParse(revision) {
  try {
    return execFileSync('git', ['rev-parse', '--verify', revision], { encoding: 'utf8' }).trim();
  } catch {
    fail(`cannot resolve ${JSON.stringify(revision)}`);
  }
}

const tagCommit = gitRevParse(`refs/tags/${tag}^{commit}`);
const headCommit = gitRevParse('HEAD^{commit}');

if (tagCommit !== headCommit) {
  fail(`HEAD ${headCommit} is not requested tag ${tag} (${tagCommit})`);
}

console.log(`release recovery ok: ${packageJson.name}@${packageJson.version}, tag ${tag}, commit ${headCommit}`);
