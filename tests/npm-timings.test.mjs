import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/summarize-npm-timings.mjs', import.meta.url));
const valid = { timers: { npm: 1200, 'command:ci': 1100 }, unfinishedTimers: {} };
async function report(receipts) {
  const directory = await mkdtemp(join(tmpdir(), 'npm-timing-report-'));
  try {
    for (const [index, receipt] of receipts.entries()) {
      await writeFile(join(directory, `${index}-timing.json`), typeof receipt === 'string' ? receipt : JSON.stringify(receipt));
    }
    return spawnSync(process.execPath, [script, directory], { encoding: 'utf8' });
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test('timing reports cannot disclose raw metadata or arbitrary package keys', async () => {
  const secret = 'PRIVATE_TIMING_CANARY';
  const result = await report([{ ...valid,
    metadata: { command: ['ci', `--registry=https://${secret}@example.invalid`], logfiles: [`/home/${secret}/debug.log`] },
    timers: { ...valid.timers, [`reifyNode:node_modules/${secret}`]: 100 },
    unfinishedTimers: { [`private:${secret}`]: [0, 900] },
  }]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!`${result.stdout}${result.stderr}`.includes(secret));
});

test('missing or unfinished timers are not reported as zero or completed work', async () => {
  const result = await report([{ ...valid, timers: { ...valid.timers, 'reify:build': 300 }, unfinishedTimers: { 'reify:build': [10, 900] } }]);
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(result.stdout);
  assert.equal(data.timers['reify:build'], null);
  assert.equal(data.timers['reify:unpack'], null);
  const incomplete = await report([{ ...valid, unfinishedTimers: { 'command:ci': [0, 900] } }]);
  assert.notEqual(incomplete.status, 0);
  assert.equal(incomplete.stdout, '');
});

test('ambiguous, malformed, or invalid measurements fail without publishing a report', async () => {
  for (const receipts of [[valid, valid], ['{"PRIVATE_TIMING_CANARY":'], [{ ...valid, timers: { ...valid.timers, 'reify:build': -1 } }]]) {
    const result = await report(receipts);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.ok(!result.stderr.includes('PRIVATE_TIMING_CANARY'));
  }
});
