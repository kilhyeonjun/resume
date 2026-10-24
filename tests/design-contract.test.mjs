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
  assert.match(layout, /noindex \? getHomePath\('ko'\) : withBasePath\(hrefRelativePath\)/);
  assert.match(layout, /noindex \? getHomePath\('en'\) : withBasePath\(`en\$\{hrefRelativePath\}`\)/);
  assert.match(layout, /new URL\(withBasePath\('og-image\.png'\), Astro\.site\)/);
  assert.match(layout, /href=\{homePath\}/);
  assert.match(layout, /startsWith\(`\$\{localePrefix\}\/experience`\)/);
  assert.match(css, /--dossier-ink:\s*#0b1220/i);
  assert.match(css, /\.touch-target[^}]*min-height:\s*44px/s);
  assert.match(config, /site:\s*'https:\/\/career\.kilpenguin\.com'/);
  assert.match(config, /base:\s*'\/'/);
  assert.match(robots, /Sitemap: https:\/\/career\.kilpenguin\.com\/sitemap-index\.xml/);
});

test('experience position periods keep WCAG AA text contrast', async () => {
  const [resume, detail] = await Promise.all([
    read('src/components/resume/ResumeExperience.astro'),
    read('src/components/templates/ExperienceDetailTemplate.astro'),
  ]);
  assert.match(
    resume,
    /<span class="text-xs text-gray-600 dark:text-gray-400">\s*\{pos\.startDate/,
  );
  assert.match(
    detail,
    /<span class="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">\s*\{pos\.startDate/,
  );
});

test('AI harness diagrams retain verified sources and accessible rendering assets', async () => {
  const portfolio = JSON.parse(await read('src/data/portfolio.json'));
  const project = portfolio.projects.find((item) => item.slug === 'ai-coding-harness');
  assert.ok(project);
  assert.equal(project.sequenceDiagram.ko, '/images/portfolio/ai-coding-harness-sequence-ko.svg');
  assert.equal(project.sequenceDiagram.en, '/images/portfolio/ai-coding-harness-sequence-en.svg');
  assert.equal(project.printArchitectureDiagram.ko, '/images/portfolio/ai-coding-harness-boundary-print-ko.svg');
  assert.equal(project.printArchitectureDiagram.en, '/images/portfolio/ai-coding-harness-boundary-print-en.svg');
  for (const path of [project.printArchitectureDiagram.ko, project.printArchitectureDiagram.en]) {
    const printDiagram = await read(`public${path}`);
    assert.doesNotMatch(printDiagram, /class="cluster"/);
    assert.match(printDiagram, /marker-end=/);
  }
  const concertDiagrams = await Promise.all([
    read('public/images/portfolio/concert-reservation-arch.svg'),
    read('public/images/portfolio/concert-reservation-arch-en.svg'),
  ]);
  for (const diagram of concertDiagrams) assert.doesNotMatch(diagram, /Concert\/Schedule/);
  const diagrams = await Promise.all([
    read('public/images/portfolio/ai-coding-harness-boundary-ko.svg'),
    read('public/images/portfolio/ai-coding-harness-boundary-en.svg'),
    read('public/images/portfolio/ai-coding-harness-sequence-ko.svg'),
    read('public/images/portfolio/ai-coding-harness-sequence-en.svg'),
  ]);
  for (const diagram of diagrams) {
    assert.match(diagram, /<svg[^>]+viewBox=/);
    assert.match(diagram, /mermaid/i);
  }
  const [boundaryKo, boundaryEn, sequenceKo, sequenceEn, packageJson, mermaidConfig] = await Promise.all([
    read('docs/diagrams/ai-harness/boundary-ko.mmd'),
    read('docs/diagrams/ai-harness/boundary-en.mmd'),
    read('docs/diagrams/ai-harness/sequence-ko.mmd'),
    read('docs/diagrams/ai-harness/sequence-en.mmd'),
    read('package.json'),
    read('scripts/mermaid-config.json'),
  ]);
  assert.match(boundaryKo, /경로 정규화/);
  assert.match(boundaryKo, /프로필 레지스트리 탐색/);
  assert.match(boundaryKo, /최장 일치 소유자/);
  assert.match(boundaryKo, /심볼릭 링크 이탈/);
  assert.match(boundaryEn, /Canonicalize path/);
  assert.match(boundaryEn, /Scan profile registry/);
  assert.match(boundaryEn, /Longest matching owner/);
  assert.match(boundaryEn, /symlink escape/);
  for (const [source, diagram] of [
    [boundaryKo, diagrams[0]], [boundaryEn, diagrams[1]],
    [sequenceKo, diagrams[2]], [sequenceEn, diagrams[3]],
  ]) {
    const sourceDigest = createHash('sha256').update(source).digest('hex');
    assert.match(diagram, new RegExp(`<metadata data-source-sha256="${sourceDigest}"/>`));
  }
  for (const source of [sequenceKo, sequenceEn]) {
    assert.match(source, /^sequenceDiagram/m);
    assert.ok((source.match(/^\s*alt\s/gm) ?? []).length >= 3);
    assert.match(source, /fingerprint/i);
  }
  const pkg = JSON.parse(packageJson);
  const mermaid = JSON.parse(mermaidConfig);
  assert.equal(pkg.scripts.diagrams, 'bash scripts/generate-ai-harness-diagrams.sh');
  assert.equal(mermaid.deterministicIds, true);
  assert.equal(mermaid.deterministicIDSeed, 'ai-harness-v1');
  const detail = await read('src/components/templates/PortfolioDetailTemplate.astro');
  assert.match(detail, /class="outcome-register"/);
  assert.ok(detail.indexOf('id="outcomes"') < detail.indexOf('id="boundary"'));
  assert.ok(detail.indexOf('id="boundary"') < detail.indexOf('id="sequence"'));
  assert.ok(detail.indexOf('id="sequence"') < detail.indexOf('id="problems"'));
  await assert.rejects(read('public/images/portfolio/ai-coding-harness-cover.svg'), (error) => error.code === 'ENOENT');
  await assert.rejects(read('public/images/portfolio/ai-coding-harness-arch.svg'), (error) => error.code === 'ENOENT');
  await assert.rejects(read('public/images/portfolio/ai-coding-harness-boundary.svg'), (error) => error.code === 'ENOENT');
  await assert.rejects(read('public/images/portfolio/ai-coding-harness-sequence.svg'), (error) => error.code === 'ENOENT');
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
  const resumePrint = await read('src/components/templates/ResumePrintTemplate.astro');
  assert.match(resumePrint, /new URL\(getHomePath\(lang\), Astro\.site\)/);
  assert.doesNotMatch(resumePrint, /https:\/\/career\.kilpenguin\.com\$\{lang/);
});

test('portfolio print keeps project identity with continuation content', async () => {
  const source = await read('src/components/templates/PortfolioPrintTemplate.astro');
  assert.doesNotMatch(source, /\.evidence-register-print \.problem-solving-print\s*\{[^}]*break-before:\s*page/s);
  assert.match(source, /\.project-header\s*\{[^}]*break-after:\s*avoid-page/s);
  assert.match(source, /\.project-header \+ \.project-links\s*\{[^}]*break-before:\s*avoid-page/s);
  assert.match(source, /\.project-links\s*\{[^}]*break-after:\s*avoid-page/s);
  assert.match(source, /\.scale-badge\s*\{[^}]*break-after:\s*avoid-page/s);
  assert.match(source, /\.project-summary\s*\{[^}]*break-before:\s*avoid-page/s);
  assert.match(source, /\.listed-project-row\s*\{[^}]*break-inside:\s*avoid/s);
});

test('career print avoids forced spill pages and orphan section headings', async () => {
  const source = await read('src/components/templates/ExperienceDetailPrintTemplate.astro');
  assert.doesNotMatch(source, /\.company-section\s*\{[^}]*page-break-after:\s*always/s);
  assert.match(source, /\.company-header\s*\{[^}]*break-after:\s*avoid-page/s);
  assert.match(source, /\.section-heading\s*\{[^}]*break-after:\s*avoid-page/s);
  assert.match(source, /class="company-section"/);
  assert.doesNotMatch(source, /idx < data\.experience\.length - 1/);
});

test('production build includes the English portfolio print route', async (t) => {
  assert.match(await read('src/pages/en/portfolio-print.astro'), /PortfolioPrintTemplate lang="en"/);
  let files;
  try { files = await htmlFiles(join(rootPath, 'dist')); }
  catch { return t.skip('run after npm run build'); }
  assert.equal(files.length, 42);
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /<h1(?:\s|>)/, file);
    assert.doesNotMatch(html, /blog\.kilpenguin\.com\/resume|(?:href|src)="\/resume\//, file);
    assert.doesNotMatch(html, /(?:href|src)="\/\//, file);
    assert.doesNotMatch(html, /career\.kilpenguin\.com\/(?:[^"?#]*\/)\/(?:portfolio|experience)/, file);
  }
  const koIndex = await readFile(join(rootPath, 'dist/index.html'), 'utf8');
  const koPortfolioIndex = await readFile(join(rootPath, 'dist/portfolio/index.html'), 'utf8');
  const enPortfolioIndex = await readFile(join(rootPath, 'dist/en/portfolio/index.html'), 'utf8');
  const enPortfolioPrint = await readFile(join(rootPath, 'dist/en/portfolio-print/index.html'), 'utf8');
  assert.doesNotMatch(koPortfolioIndex, /\[object Object\]/);
  assert.doesNotMatch(enPortfolioIndex, /\[object Object\]/);
  assert.match(koIndex, /https:\/\/career\.kilpenguin\.com\/?"/);
  assert.match(enPortfolioPrint, /href="https:\/\/career\.kilpenguin\.com\/en\/portfolio"/);
  assert.doesNotMatch(enPortfolioPrint, /href="https:\/\/career\.kilpenguin\.com\/portfolio(?:\/|\")/);
});

test('every rendered anchor has a non-empty destination', async (t) => {
  let files;
  try { files = await htmlFiles(join(rootPath, 'dist')); }
  catch { return t.skip('run after npm run build'); }
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.doesNotMatch(html, /<a\s+href(?:\s|>)/, file);
    assert.doesNotMatch(html, /<a\s+[^>]*href=(?:""|'')/, file);
  }
});

test('local generation and deployment use the same IPv4 dev-server origin', async () => {
  const expected = /http:\/\/127\.0\.0\.1:4321/;
  const workflow = await read('.github/workflows/deploy.yml');
  const packageJson = JSON.parse(await read('package.json'));
  const ogGenerator = await read('scripts/generate-og.ts');
  assert.match(await read('scripts/generate-pdf.ts'), expected);
  assert.match(ogGenerator, expected);
  assert.match(workflow, expected);
  assert.equal(packageJson.scripts.pdf, 'tsx scripts/generate-pdf.ts && tsx scripts/generate-og.ts --output dist/og-image.png');
  assert.match(ogGenerator, /querySelector\('astro-dev-toolbar'\)\?\.remove\(\)/);
  assert.match(workflow, /pull_request:\s*\n\s+branches: \[main\]/);
  assert.match(workflow, /workflow_dispatch:\s*\n\s+inputs:\s*\n\s+deploy:/);
  assert.match(workflow, /^permissions:\n  contents: read\n\nconcurrency:/m);
  const buildStart = workflow.search(/^  build:/m);
  const deployStart = workflow.search(/^  deploy:/m);
  assert.ok(buildStart >= 0 && deployStart > buildStart);
  const buildJob = workflow.slice(buildStart, deployStart);
  assert.doesNotMatch(buildJob, /^    permissions:/m);
  const afterDeploy = workflow.slice(deployStart + 1);
  const nextJobOffset = afterDeploy.search(/^  [\w-]+:\n/m);
  const deployEnd = nextJobOffset < 0 ? workflow.length : deployStart + 1 + nextJobOffset;
  const deployJob = workflow.slice(deployStart, deployEnd);
  assert.match(deployJob, /^    permissions:\n      pages: write\n      id-token: write/m);
  assert.deepEqual(
    workflow.match(/^\s+uses: \S+(?: # \S+)?$/gm),
    [
      '        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7',
      '        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7',
      '        uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6',
      '        uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5',
      '        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5',
    ],
  );
  assert.equal(
    await read('.github/dependabot.yml'),
    'version: 2\nupdates:\n  - package-ecosystem: github-actions\n    directory: /\n    schedule:\n      interval: weekly\n',
  );
  assert.match(workflow, /node-version: "24"/);
  assert.match(workflow, /name: Type Check\s*\n\s+run: npm run check/);
  assert.doesNotMatch(workflow, /npx astro check/);
  assert.equal((workflow.match(/if: github\.event_name == 'push' \|\| \(github\.event_name == 'workflow_dispatch' && inputs\.deploy\)/g) ?? []).length, 2);
  assert.match(workflow, /diagram-source-contract\.mjs verify[\s\S]*sha256sum[\s\S]*git restore -- public\/images\/portfolio\/ai-coding-harness-/);
  assert.doesNotMatch(workflow, /name: Start dev server/);
  assert.ok(workflow.indexOf('run: npm run build') < workflow.indexOf('run: npm test'));
  assert.ok(workflow.indexOf('run: npm test') < workflow.indexOf('name: Generate release PDFs and OG'));
  assert.match(workflow, /name: Generate release PDFs and OG[\s\S]*\.\/node_modules\/\.bin\/astro dev --host 127\.0\.0\.1 --port 4321[\s\S]*trap '[^']*kill[\s\S]*kill -0 "\$server_pid"[\s\S]*npm run pdf/);
});

test('Astro schemas use the supported Zod export', async () => {
  for (const path of ['src/content.config.ts', 'src/types/portfolio.ts']) {
    const source = await read(path);
    assert.match(source, /import \{ z \} from 'astro\/zod';/);
    assert.doesNotMatch(source, /import \{[^}]*\bz\b[^}]*\} from 'astro:content';/);
  }
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
