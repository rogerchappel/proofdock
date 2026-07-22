import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText } from '../dist/index.js';

test('redacts common secret patterns', () => {
  const result = redactText('token=sk-abcdefghijklmnopqrstuvwxyz and ghp_abcdefghijklmnopqrstuvwxyz123456');
  assert.equal(result.includes('[REDACTED]'), true);
  assert.equal(result.includes('abcdefghijklmnopqrstuvwxyz'), false);
});

test('removes values assigned to generic secret fields', () => {
  const values = ['token-value', 'secret-value', 'password-value'];
  const result = redactText(`token=${values[0]} secret: ${values[1]} password = ${values[2]}`);

  assert.equal(result, 'token=[REDACTED] secret: [REDACTED] password = [REDACTED]');
  for (const value of values) {
    assert.equal(result.includes(value), false);
  }
});

test('removes Authorization Bearer values', () => {
  const secret = 'bearer-secret-value';
  const result = redactText(`Authorization: Bearer ${secret}`);

  assert.equal(result, 'Authorization: Bearer [REDACTED]');
  assert.equal(result.includes(secret), false);
});
