import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}

async function textFiles(dir) {
  return (await files(dir)).filter((path) => /\.(?:astro|css|html|js|json|md|mjs|svg|ts|txt)$/.test(path));
}

test('private operating namespaces are never tracked', () => {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root })
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  for (const path of [
    '.jd-custom', '.claude', '.rag', '.superpowers', 'CLAUDE.md',
    'docs/plans', 'docs/superpowers', 'scripts/jd-custom', 'scripts/external-review',
    'templates/jd-custom-triage.md', 'templates/external-review-triage.md',
  ]) {
    assert.equal(tracked.some((file) => file === path || file.startsWith(`${path}/`)), false, path);
  }
});

const digest = (value) => createHash('sha256').update(value).digest('hex');
const blockedSingleTokenDigests = new Map([
  [2, new Set(['274ecb82cbde2598a9ce6d67a49b4f3265f651808184e3b5532534b33b575a8f'])],
  [3, new Set([
    'd83bb039516e24276bbc01914f3ee284c9513e0ed21372ba0cbe1849f1c5b8d0',
    'c4a45442c3d76ed87e0638bf4a21bcaae8907202fe464138c029ffcaad489fb8',
    '27a2a133cf78f11cc3e188892c7a40cb8a5a028136a4bc9480a050f298a3b169',
  ])],
  [4, new Set(['2a256bd9880d04cbff89decde90f61d1d9c2fc1524c85e807523923c16b2018c'])],
  [5, new Set([
    'c5ba1dc4254e9e0c55476aa0b9bdc058589dca2dfa6aeed9c2b7e5d8435d2400',
    '8914c6ae54be15472e0d09c0e109e19f9439b64ccc21f3fca1bf4f30c0c30cf0',
  ])],
  [14, new Set(['c5e4100818226fdc671a449e2a6f8cbf58782352a801d1f612adf335b4d63742'])],
]);
const blockedLiteralDigests = new Map([
  [19, new Set(['ed1d57472eb9f23ba54cdb64965fe859945443cb0868acc6dd32dc12f4810301'])],
]);
const blockedPhraseDigests = new Map([
  [2, new Set([
    'b59dc46066658d51f275fa8c30a12fc20fdafe0947dbddd2c3117761586e8699',
    '1810aa33ce17e16466dc1eae3779a0487098b3b3941d336a5e670d9408594f2d',
    'b13c1e5a21ee022c7b5faf57d75c49433fc545f31f2856835934319bec168751',
    '8b4246aef1e5f71a74810db3b777f811e792af9cf3a557ea301dba8fda669fb3',
    '5ab5335ba18276f2687fcefea09f5012c498974b4ed3b6e11fced8c86f62db2a',
    '43f017b77cfafbb9175e9f265fb1eb1e42f4a6bc63ee7eaf8047b7062d671929',
    '35ec87dd53d619d538af7fdc945b3e470d8a946d7c4dc980b71a2fc9a14a854b',
    'b66ae591dc187187afb8860cad16aee7912ffbbbe617da9158e86207b7e1ba4d',
    '70a0ba5c52bcaf47ef54812e08071ee168d199021c5fafa828ac9e3567542809',
    'fbb29c9647673c70b6f7e58718aa38d67b961647631940b976e8b8a551035d8f',
    '27d14bc5aaedb7b6fc3ba215784c4e9be9175b3f77f985f48d0a1338d2f91db5',
  ])],
  [3, new Set([
    'afcf446cdbc87af2d5840376ae466151aa6bf44d8d60cfc38cba356f406f34c9',
    '08bf3b8c42832e4c3fdb2948c129e0427d85069331ff429868b1f940615e76d7',
    '41fc6d8a00f252963e9ae28deffc41aa2395e575e061402c942750f98ae4d9bc',
    'bc44d1ce406742d367369a5e6706f50e7e2828b0fdf540b6c4cec49a723ff313',
    'a6a43cb85d7384bdaf3b06d9cd88f5051c382fafea53eb269e1055912e1638a7',
    '2f6f3dd9e64697455bb72f8b65113d37aaa1c87a6ba291d8aace31f2820d507d',
    'd8182a0fd46cb0b33603c1234c98291e370cce6d60262b9fbe29687a603ae905',
    '8c6cba7320c511badd6b8b40422b9da2315b1e340e3325bae2d7ff6561af6311',
    '213686cd95307c9bb0ac7c451146898dfb6e616322bb1cc1e3eee265c711bc0c',
    '446b22e32e9fe1062df08ecf942c3fe2481f6e3750b26604f3159cbdf6de2dec',
    '4b910278cea0dea72ac07c5e66ecea6f0d4f4fdf06f06cb1b603cbb6539a1438',
    '402bceacc4cf0c46abcaa33b61000c86026ef98c8dfd9f0b6292f1401c2987b5',
  ])],
  [4, new Set([
    '4b9ffcb105b37eba86c47e9fb355a9e6331980d26910bc8fe9826e4c7fa9253b',
    '2adeeafef1abc8db278033d42063820b963b3a8954d890e1363a99c055a0de34',
  ])],
]);

function hasBlockedFingerprint(text) {
  const literal = text.normalize('NFKC').toLowerCase();
  for (const [length, hashes] of blockedLiteralDigests) {
    for (let start = 0; start + length <= literal.length; start += 1) {
      if (hashes.has(digest(literal.slice(start, start + length)))) return true;
    }
  }
  const normalized = literal.replace(/[^\p{L}\p{N}_]+/gu, ' ').trim();
  const tokens = normalized ? normalized.split(/\s+/) : [];
  for (const token of tokens) {
    for (const [length, hashes] of blockedSingleTokenDigests) {
      for (let start = 0; start + length <= token.length; start += 1) {
        if (hashes.has(digest(token.slice(start, start + length)))) return true;
      }
    }
  }
  for (const [wordCount, hashes] of blockedPhraseDigests) {
    for (let start = 0; start + wordCount <= tokens.length; start += 1) {
      if (hashes.has(digest(tokens.slice(start, start + wordCount).join(' ')))) return true;
    }
  }
  return false;
}

test('deployable sources exclude blocked recruiting evidence fingerprints', async () => {
  const files = [
    ...await textFiles(join(root, 'src')),
    ...await textFiles(join(root, 'public')),
  ];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    assert.equal(hasBlockedFingerprint(text), false, file);
  }
});

test('deprecated Ledgerly is absent from public release surfaces', async () => {
  const portfolio = JSON.parse(await readFile(join(root, 'src/data/portfolio.json'), 'utf8'));
  assert.equal(portfolio.projects.some((project) => project.slug === 'ledgerly'), false);
  assert.equal(portfolio.projects.filter((project) => project.featured).length, 3);

  for (const dir of ['src', 'public', 'dist']) {
    const releaseFiles = await files(join(root, dir));
    for (const file of releaseFiles) assert.doesNotMatch(file, /ledgerly/i);
    for (const file of await textFiles(join(root, dir))) {
      assert.doesNotMatch(await readFile(file, 'utf8'), /ledgerly/i, file);
    }
  }
});
