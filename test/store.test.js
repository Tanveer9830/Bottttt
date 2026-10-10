import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { JsonStore } from '../src/services/store.js';

test('store serializes concurrent atomic updates without losing writes', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sentinel-store-'));
  const file = path.join(dir, 'store.json');
  try {
    const store = await new JsonStore(file).init();
    await Promise.all(Array.from({ length: 30 }, (_, i) => store.updateGuild('g1', async (guild) => {
      guild.values ??= [];
      guild.values.push(i);
    })));
    assert.equal(store.guild('g1').values.length, 30);
    const disk = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(disk.guilds.g1.values.length, 30);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('failed mutation does not alter in-memory or disk state', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sentinel-store-'));
  const file = path.join(dir, 'store.json');
  try {
    const store = await new JsonStore(file).init();
    await assert.rejects(store.updateGuild('g1', (guild) => { guild.bad = true; throw new Error('stop'); }));
    assert.equal(store.guild('g1').bad, undefined);
    assert.equal(JSON.parse(await readFile(file, 'utf8')).guilds.g1, undefined);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
