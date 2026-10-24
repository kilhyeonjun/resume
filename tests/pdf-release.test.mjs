import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const font = await readFile(new URL('../public/fonts/PretendardVariable.woff2', import.meta.url));

async function rejectedPDF(body, { fontAvailable = true, filename = 'resume-hr-ko.pdf' } = {}) {
  const output = await mkdtemp(join(tmpdir(), 'resume-release-reject-'));
  const destination = join(output, filename);
  await writeFile(destination, 'previous valid release');
  const server = createServer((request, response) => {
    if (request.url === '/font.woff2') {
      response.writeHead(200, { 'content-type': 'font/woff2' });
      response.end(font);
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><html><head><style>
      ${fontAvailable ? '@font-face{font-family:"Resume Print";src:url(/font.woff2);font-weight:100 900}' : ''}
      body{font-family:"Resume Print",sans-serif}.no-print{display:none}
    </style></head><body><main><h1>Release fixture</h1>${body}
      <a class="no-print" download href="/pdf/resume-hr-ko.pdf">Download</a>
    </main></body></html>`);
  });
  const listening = Promise.withResolvers();
  server.once('error', listening.reject);
  server.listen(0, '127.0.0.1', listening.resolve);
  let child;
  try {
    await listening.promise;
    const completion = Promise.withResolvers();
    let text = '';
    child = spawn(process.execPath, [
      '--import', 'tsx', 'scripts/generate-pdf.ts', '--ko', '--hr',
      '--base-url', `http://127.0.0.1:${server.address().port}`, '--output', output,
    ], { cwd: root });
    child.stdout.on('data', chunk => { text += chunk; });
    child.stderr.on('data', chunk => { text += chunk; });
    child.once('error', completion.reject);
    child.once('close', code => completion.resolve(code));
    const code = await completion.promise;
    assert.notEqual(code, 0, text);
    assert.equal(await readFile(destination, 'utf8'), 'previous valid release');
    return text;
  } finally {
    if (child && child.exitCode === null) child.kill();
    server.closeAllConnections();
    server.close();
    await rm(output, { recursive: true, force: true });
  }
}

test('HR overflow fails instead of silently publishing its first two pages', { timeout: 30000 }, async () => {
  const text = await rejectedPDF('<p>First page</p><p style="break-before:page">Second page</p><p style="break-before:page">Required third-page fact</p>');
  assert.match(text, /PDF exceeds 2-page limit \(3 pages\); refusing to truncate content/);
});

test('missing bundled font cannot pass through a system fallback', { timeout: 30000 }, async () => {
  const text = await rejectedPDF('<p>길현준 Backend Engineer</p>', { fontAvailable: false });
  assert.match(text, /Required bundled Resume Print font is unavailable/);
});

test('a career PDF cannot omit source positions even when its rendered text is complete', { timeout: 30000 }, async () => {
  const text = await rejectedPDF('<p>Projects without the source role history</p>', { filename: 'career-detail-ko.pdf' });
  assert.match(text, /Missing career source content/);
});

test('hidden required content cannot redefine PDF completeness', { timeout: 30000 }, async () => {
  const text = await rejectedPDF('<p>Visible fact</p><p style="display:none">MISSING_REQUIRED_FACT</p>');
  assert.match(text, /Missing PDF text \(0\/1\): MISSING_REQUIRED_FACT/);
});
