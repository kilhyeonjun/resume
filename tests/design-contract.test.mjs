import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const rootPath = fileURLToPath(new URL('../', import.meta.url));

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  }))).flat();
}

test('published pages expose semantic titles and valid localized destinations', async () => {
  const files = await htmlFiles(join(rootPath, 'dist'));
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /<h1(?:\s|>)/, file);
    assert.doesNotMatch(html, /blog\.kilpenguin\.com\/resume|(?:href|src)="\/resume\//, file);
    assert.doesNotMatch(html, /(?:href|src)="\/\//, file);
    assert.doesNotMatch(html, /career\.kilpenguin\.com\/(?:[^"?#]*\/)\/(?:portfolio|experience)/, file);
    assert.doesNotMatch(html, /<a\s+href(?:\s|>)/, file);
    assert.doesNotMatch(html, /<a\s+[^>]*href=(?:""|'')/, file);
    assert.doesNotMatch(html, /\[object Object\]/, file);
  }
  const englishPrint = await readFile(join(rootPath, 'dist/en/portfolio-print/index.html'), 'utf8');
  assert.match(englishPrint, /href="https:\/\/career\.kilpenguin\.com\/en\/portfolio"/);
  assert.doesNotMatch(englishPrint, /href="https:\/\/career\.kilpenguin\.com\/portfolio(?:\/|\")/);
});

test('PDF generator rejects HTTP error pages before writing output', { timeout: 30000 }, async () => {
  const server = createServer((_request, response) => {
    response.writeHead(404, { 'content-type': 'text/html' });
    response.end('<main><h1>Error response</h1></main>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const output = await mkdtemp(join(tmpdir(), 'resume-pdf-reject-'));
  try {
    const result = await new Promise((resolve) => {
      const child = spawn(join(rootPath, 'node_modules/.bin/tsx'), [
        'scripts/generate-pdf.ts', '--ko', '--hr', '--base-url', `http://127.0.0.1:${port}`, '--output', output,
      ], { cwd: rootPath });
      let text = '';
      child.stdout.on('data', (chunk) => { text += chunk; });
      child.stderr.on('data', (chunk) => { text += chunk; });
      child.on('close', (code) => resolve({ code, text }));
    });
    assert.notEqual(result.code, 0);
    assert.match(result.text, /Refusing to generate PDF from HTTP 404/);
    assert.deepEqual(await readdir(output), []);
  } finally {
    server.close();
    await rm(output, { recursive: true, force: true });
  }
});

test('OG generator rejects HTTP error pages before overwriting output', { timeout: 30000 }, async () => {
  const server = createServer((_request, response) => {
    response.writeHead(404, { 'content-type': 'text/html' });
    response.end('<main><h1>Error response</h1></main>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const outputDir = await mkdtemp(join(tmpdir(), 'resume-og-reject-'));
  const output = join(outputDir, 'og-image.png');
  await writeFile(output, 'sentinel');
  try {
    const result = await new Promise((resolve) => {
      const child = spawn(join(rootPath, 'node_modules/.bin/tsx'), [
        'scripts/generate-og.ts', '--base-url', `http://127.0.0.1:${port}`, '--output', output,
      ], { cwd: rootPath });
      let text = '';
      child.stdout.on('data', (chunk) => { text += chunk; });
      child.stderr.on('data', (chunk) => { text += chunk; });
      child.on('close', (code) => resolve({ code, text }));
    });
    assert.notEqual(result.code, 0);
    assert.match(result.text, /Refusing to generate OG image from HTTP 404/);
    assert.equal(await readFile(output, 'utf8'), 'sentinel');
  } finally {
    server.close();
    await rm(outputDir, { recursive: true, force: true });
  }
});
