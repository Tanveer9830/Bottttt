import test from 'node:test';
import assert from 'node:assert/strict';
import { commands, allPayloads } from '../src/commands/index.js';
import { validateCommands } from '../src/commands/validate.js';

test('registry contains unique valid implemented actions', () => {
  assert.deepEqual(validateCommands(commands), []);
  assert.equal(commands.length, 3);
  assert.equal(commands.reduce((n, c) => n + c.actions.length, 0), 75);
  for (const command of commands) assert.equal(command.actions.length, 25);
});

test('registration payloads serialize and contain handlers for every subcommand', () => {
  const payloads = allPayloads();
  assert.doesNotThrow(() => JSON.stringify(payloads));
  for (const payload of payloads) {
    const source = commands.find((command) => command.name === payload.name);
    assert.ok(source);
    for (const item of payload.options) assert.equal(typeof source.actions.find((a) => a.name === item.name)?.run, 'function');
  }
});
