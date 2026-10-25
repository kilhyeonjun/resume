import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// These elapsed timers nest and may overlap. Never sum them into a total.
// Do not expose receipt metadata, arbitrary package keys, paths, or debug logs.
const timerNames = [
  'npm', 'command:ci', 'reify', 'reify:loadTrees', 'reify:diffTrees',
  'reify:unpack', 'reify:build', 'reify:audit', 'build:deps',
  'build:run:preinstall', 'build:run:install', 'build:run:postinstall',
  'build:run:postinstall:node_modules/puppeteer',
  'build:run:postinstall:node_modules/esbuild',
  'build:run:postinstall:node_modules/vite/node_modules/esbuild',
];
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

async function main() {
  const [directory, ...extra] = process.argv.slice(2);
  if (!directory || extra.length) throw new Error('Supply one npm timing directory.');
  let names;
  try { names = await readdir(directory); }
  catch { throw new Error('Cannot read npm timing directory.'); }
  const receipts = [];
  for (const name of names.filter(name => name.endsWith('-timing.json'))) {
    let receipt;
    try { receipt = JSON.parse(await readFile(join(directory, name), 'utf8')); }
    catch { throw new Error('Cannot read or parse npm timing receipt.'); }
    if (!isRecord(receipt) || !isRecord(receipt.timers) || !isRecord(receipt.unfinishedTimers)) {
      throw new Error('Invalid npm timing receipt structure.');
    }
    if (Object.hasOwn(receipt.timers, 'command:ci') || Object.hasOwn(receipt.unfinishedTimers, 'command:ci')) {
      receipts.push(receipt);
    }
  }
  if (receipts.length !== 1) throw new Error('Expected exactly one npm ci timing receipt.');
  const receipt = receipts[0];
  const timers = Object.fromEntries(timerNames.map(name => {
    if (Object.hasOwn(receipt.unfinishedTimers, name) || !Object.hasOwn(receipt.timers, name)) return [name, null];
    const value = receipt.timers[name];
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid duration for ${name}.`);
    return [name, value];
  }));
  if (timers.npm === null || timers['command:ci'] === null) throw new Error('Incomplete npm ci total timers.');
  console.log(JSON.stringify({
    measurement: 'npm-ci-stage-timings', unit: 'ms', timers,
    interpretation: 'Elapsed timers are inclusive and can overlap; do not sum them. reify:unpack includes package fetch/cache extraction, not isolated network time. null means unrecorded or unfinished, not zero. Installation success is determined by the separate npm ci exit status.',
  }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
