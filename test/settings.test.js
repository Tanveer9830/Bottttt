import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultsFor } from '../src/services/settings.js';

test('security defaults are conservative and allowlists do not imply permission bypass', () => {
  const security = defaultsFor('security');
  assert.equal(security.phishingProtection, true);
  assert.equal(security.webhookMonitor, true);
  assert.deepEqual(security.allowUserIds, []);
  assert.equal(Object.hasOwn(security, 'permissionBypass'), false);
});

test('defaults are fresh mutable values', () => {
  const first = defaultsFor('automod');
  first.badwords.push('x');
  assert.deepEqual(defaultsFor('automod').badwords, []);
});
