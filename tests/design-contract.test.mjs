import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);
const read = (path) => readFile(new URL(path, root), 'utf8');

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  }))).flat();
}

test('shared layout exposes the approved dossier design hooks and 44px controls', async () => {
  const [layout, css, config, robots] = await Promise.all([
    read('src/layouts/Layout.astro'), read('src/styles/global.css'), read('astro.config.mjs'), read('public/robots.txt'),
  ]);
  assert.match(layout, /KILPENGUIN \/ RESUME/);
  assert.match(layout, /class="site-shell/);
  assert.match(layout, /withBasePath\('favicon\.svg'\)/);
  assert.match(layout, /href=\{enHref\}/);
  assert.match(layout, /href=\{koHref\}/);
  assert.match(layout, /startsWith\(`\$\{basePath\}\/experience`\)/);
  assert.match(css, /--dossier-ink:\s*#0b1220/i);
  assert.match(css, /\.touch-target[^}]*min-height:\s*44px/s);
  assert.match(config, /site:\s*'https:\/\/career\.kilpenguin\.com'/);
  assert.match(config, /base:\s*'\/'/);
  assert.match(robots, /Sitemap: https:\/\/career\.kilpenguin\.com\/sitemap-index\.xml/);
});

test('approved convention-preserving polish is screen-only and keeps content visible', async () => {
  const css = await read('src/styles/global.css');
  const prefix = '/* Convention-preserving polish · P1 */\n';
  assert.equal(css.split(prefix).length, 2, 'approved polish layer must appear exactly once');
  const polish = css.split(prefix, 2)[1];
  assert.equal(
    createHash('sha256').update(polish).digest('hex'),
    '723cb13fe47d2e0a5039dbcb8f0c8ad9da061c6c6fc453f707fe2a941885f42c',
  );
});

test('interactive route families expose their shared design hooks', async () => {
  const families = [
    ['src/components/templates/ResumeTemplate.astro', 'resume-dossier'],
    ['src/components/templates/PortfolioTemplate.astro', 'portfolio-index'],
    ['src/components/templates/PortfolioDetailTemplate.astro', 'detail-dossier'],
    ['src/components/templates/ExperienceDetailTemplate.astro', 'detail-dossier'],
  ];
  for (const [path, hook] of families) assert.match(await read(path), new RegExp(hook), path);
  assert.match(await read('src/components/templates/ResumeTemplate.astro'), /filter\(\(proof\) => \/\\d\//);
  assert.match(await read('src/components/templates/PortfolioTemplate.astro'), /portfolio-archive/);
  assert.match(await read('src/components/templates/PortfolioTemplate.astro'), /filter\(\(project\) => project\.featured\)/);
  assert.match(await read('src/components/templates/PortfolioTemplate.astro'), /printOrder/);
  assert.match(await read('src/components/resume/ResumeHeader.astro'), /\{data\.title\}<\/span>/);
  for (const path of ['src/components/templates/PortfolioDetailTemplate.astro', 'src/components/templates/ExperienceDetailTemplate.astro']) {
    const source = await read(path);
    assert.match(source, /class="evidence-index"/, path);
    assert.match(source, /href="#outcomes"/, path);
    assert.match(source, /id="outcomes"/, path);
  }
  assert.match(await read('src/styles/global.css'), /\.resume-actions\s*\{[^}]*grid-row:\s*2/s);
  assert.match(await read('src/styles/global.css'), /\.portfolio-detail > #outcomes\s*\{[^}]*order:\s*-2/s);
});

test('fonts are local/system-only and every standalone output has a semantic h1', async () => {
  const sourceFiles = [
    'src/styles/global.css',
    'src/components/templates/ResumePrintTemplate.astro',
    'src/components/templates/ExperienceDetailPrintTemplate.astro',
    'src/components/templates/PortfolioPrintTemplate.astro',
    'src/components/templates/ResumeAtsTemplate.astro',
  ];
  for (const path of sourceFiles) {
    const source = await read(path);
    assert.doesNotMatch(source, /cdn\.jsdelivr\.net|fonts\.googleapis\.com/, path);
    if (path.includes('Template')) {
      assert.match(source, /<h1(?:\s|>)/, path);
      assert.match(source, /<main(?:\s|>)/, path);
    }
    if (path.includes('PrintTemplate') || path.includes('AtsTemplate')) {
      assert.match(source, /withBasePath\(`pdf\//, path);
      assert.doesNotMatch(source, /(?:basePath|baseUrl)}\/pdf\//, path);
    }
  }
});

test('production build includes the English portfolio print route', async (t) => {
  assert.match(await read('src/pages/en/portfolio-print.astro'), /PortfolioPrintTemplate lang="en"/);
  let files;
  try { files = await htmlFiles(join(rootPath, 'dist')); }
  catch { return t.skip('run after npm run build'); }
  assert.equal(files.length, 45);
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /<h1(?:\s|>)/, file);
    assert.doesNotMatch(html, /blog\.kilpenguin\.com\/resume|(?:href|src)="\/resume\//, file);
    assert.doesNotMatch(html, /(?:href|src)="\/\//, file);
  }
  assert.match(await readFile(join(rootPath, 'dist/index.html'), 'utf8'), /https:\/\/career\.kilpenguin\.com\/?"/);
});

test('local generation and deployment use the same IPv4 dev-server origin', async () => {
  const expected = /http:\/\/127\.0\.0\.1:4321/;
  const workflow = await read('.github/workflows/deploy.yml');
  assert.match(await read('scripts/generate-pdf.ts'), expected);
  assert.match(await read('scripts/generate-og.ts'), expected);
  assert.match(workflow, expected);
  assert.doesNotMatch(workflow, /name: Start dev server/);
  assert.match(workflow, /name: Generate release PDFs and OG[\s\S]*\.\/node_modules\/\.bin\/astro dev --host 127\.0\.0\.1 --port 4321[\s\S]*trap '[^']*kill[\s\S]*kill -0 "\$server_pid"[\s\S]*npm run pdf/);
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
