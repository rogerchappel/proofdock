import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText } from '../dist/index.js';

test('redacts common secret patterns', () => {
  const result = redactText('token=sk-abcdefghijklmnopqrstuvwxyz and ghp_abcdefghijklmnopqrstuvwxyz123456');
  assert.equal(result.includes('[REDACTED]'), true);
  assert.equal(result.includes('abcdefghijklmnopqrstuvwxyz'), false);
});
