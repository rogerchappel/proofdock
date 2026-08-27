import assert from 'node:assert/strict';
import test from 'node:test';

import { checkReleaseAvailability } from '../scripts/release-availability.mjs';

function response(status, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

test('reports GitHub release and npm availability independently', async () => {
  for (const githubAvailable of [false, true]) {
    for (const npmAvailable of [false, true]) {
      const fetch = async (url) => {
        if (url.includes('api.github.test')) {
          return response(githubAvailable ? 200 : 404, githubAvailable ? { tag_name: 'v0.1.0' } : {});
        }
        return response(npmAvailable ? 200 : 404, npmAvailable ? { versions: { '0.1.0': {} } } : {});
      };

      assert.deepEqual(await checkReleaseAvailability({
        fetch,
        githubApiUrl: 'https://api.github.test',
        npmRegistryUrl: 'https://registry.npm.test',
        repository: 'rogerchappel/proofdock',
        packageName: 'proofdock',
        version: '0.1.0'
      }), {
        version: '0.1.0',
        tag: 'v0.1.0',
        githubRelease: githubAvailable ? 'available' : 'missing',
        npmPackage: npmAvailable ? 'available' : 'missing'
      });
    }
  }
});

test('fails closed when an availability endpoint returns an unexpected error', async () => {
  await assert.rejects(
    checkReleaseAvailability({
      fetch: async () => response(503),
      githubApiUrl: 'https://api.github.test',
      npmRegistryUrl: 'https://registry.npm.test',
      repository: 'rogerchappel/proofdock',
      packageName: 'proofdock',
      version: '0.1.0'
    }),
    /GitHub release lookup failed with HTTP 503/
  );
});
