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

test('approved convention-preserving polish is screen-only and keeps content visible', async () => {
  const css = await read('src/styles/global.css');
  const prefix = '/* Convention-preserving polish · P1 */\n';
  assert.equal(css.split(prefix).length, 2, 'approved polish layer must appear exactly once');
  const polish = css.split(prefix, 2)[1];
  assert.equal(
    createHash('sha256').update(polish).digest('hex'),
    '772d6b4db61258094110d49c5824557428a2e6bc3a7d652c8352e79c40786ab1',
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
    assert.match(source, /id="outcomes"/, path);
  }
  const portfolioDetail = await read('src/components/templates/PortfolioDetailTemplate.astro');
  assert.match(portfolioDetail, /evidenceIndex\.map/);
  assert.match(portfolioDetail, /href=\{`#\$\{item\.id\}`\}/);
  assert.match(await read('src/components/templates/ExperienceDetailTemplate.astro'), /href="#outcomes"/);
  assert.match(await read('src/styles/global.css'), /\.resume-actions\s*\{[^}]*grid-row:\s*2/s);
  assert.match(await read('src/styles/global.css'), /\.portfolio-detail > #outcomes\s*\{[^}]*order:\s*-2/s);
});

test('evidence board separates metric, context, and supporting result copy', async () => {
  const [template, css] = await Promise.all([
    read('src/components/templates/ResumeTemplate.astro'),
    read('src/styles/global.css'),
  ]);
  assert.match(template, /const outcomeKickers = lang === 'ko'/);
  assert.ok(template.includes('proof.result.split(/,\\s*/)'));
  assert.match(template, /metricText\.startsWith\(kicker\)/);
  assert.match(template, /metricText\.slice\(kicker\.length\)\.trim\(\)/);
  assert.match(template, /class="result-metric"/);
  assert.match(template, /class="result-tail"/);
  assert.match(template, /class="outcome-problem"/);
  assert.match(css, /span:not\(\.skill-name\):not\(\.skill-category\):not\(\.skill-sep\):not\(\.dossier-label\):not\(\.result-kicker\):not\(\.result-tail\)/);
  assert.match(css, /\.resume-header > \.dossier-label\s*\{/);
  assert.match(css, /\.resume-dossier \.board-heading\s*\{/);
  assert.match(css, /\.resume-dossier \.result-kicker\s*\{/);
  assert.match(css, /\.resume-dossier \.outcome-problem\s*\{/);
  assert.match(css, /@media screen and \(max-width: 760px\)[\s\S]*\.resume-header > div:not\(\.no-print\)\s*\{[^}]*margin-top:\s*0\.875rem/s);
  assert.match(css, /@media screen and \(max-width: 760px\)[\s\S]*\.resume-header \.no-print\s*\{[^}]*margin-top:\s*0\.5rem/s);
  assert.match(css, /@media screen and \(max-width: 760px\)[\s\S]*\.resume-actions\s*\{[^}]*margin-top:\s*0/s);
  assert.match(css, /@media screen and \(max-width: 760px\)[\s\S]*\.outcome-board\s*\{[^}]*grid-row:\s*3/s);
  assert.match(css, /\.result-metric\s*\{[^}]*color:\s*var\(--dossier-blue\)/s);
  assert.match(css, /\.outcome-problem\s*\{[^}]*border-left:\s*1px solid var\(--dossier-line\)/s);
});

test('portfolio polish keeps featured proof and detail evidence in recruiter-first flow', async () => {
  const [template, css] = await Promise.all([
    read('src/components/templates/PortfolioTemplate.astro'),
    read('src/styles/global.css'),
  ]);
  assert.match(template, /index === 0 && project\.metrics/);
  assert.match(template, /project\.metrics\.slice\(0, 2\)/);
  assert.match(template, /typeof metric\.after === 'string'/);
  assert.match(template, /class="portfolio-proof-strip"/);
  assert.match(css, /\.portfolio-detail > header\s*\{[^}]*grid-row:\s*2\s*\/\s*span\s*20/s);
  assert.match(css, /\.portfolio-detail > #outcomes\s*\{[^}]*grid-row:\s*2/s);
  assert.match(css, /@media screen and \(max-width: 760px\)[\s\S]*\.portfolio-detail\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
});

test('AI harness case study keeps public evidence current and recruiter-first', async () => {
  const portfolio = JSON.parse(await read('src/data/portfolio.json'));
  const project = portfolio.projects.find((item) => item.slug === 'ai-coding-harness');
  assert.ok(project);
  assert.equal(project.role.ko, '개인 설계·구현·운영');
  assert.equal(project.role.en, 'Sole designer, implementer, and operator');
  assert.equal(project.metrics.length, 3);
  assert.equal(project.problemSolving.length, 3);
  assert.equal(project.glossary.length, 8);
  assert.equal(project.github, 'https://github.com/kilhyeonjun/harness-launcher');
  assert.equal(project.links.Demo, 'https://github.com/kilhyeonjun/harness-launcher-demo');
  assert.equal(project.links['v0.20.0 Release'], 'https://github.com/kilhyeonjun/harness-launcher/releases/tag/v0.20.0');
  assert.equal(project.links.CI, 'https://github.com/kilhyeonjun/harness-launcher/actions');
  assert.equal(project.sequenceDiagram.ko, '/images/portfolio/ai-coding-harness-sequence-ko.svg');
  assert.equal(project.sequenceDiagram.en, '/images/portfolio/ai-coding-harness-sequence-en.svg');
  const publicCopy = JSON.stringify(project);
  assert.match(publicCopy, /runtime state stays project-scoped/i);
  assert.match(publicCopy, /public contract demo/i);
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
  assert.match(pkg.dependencies.astro, /^\^7\./);
  assert.equal(pkg.engines.node, '>=22.12.0');
  assert.equal(pkg.devDependencies['@mermaid-js/mermaid-cli'], '^11.16.0');
  assert.equal(pkg.overrides['basic-ftp'], '5.3.1');
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

test('Daesin case study keeps KO/EN facts, evidence, and print budgets aligned', async () => {
  const portfolio = JSON.parse(await read('src/data/portfolio.json'));
  const project = portfolio.projects.find((item) => item.slug === 'daesin-logistics-bot');
  assert.ok(project);
  assert.equal(project.name.ko, '대신물류 배차 운영 원장');
  assert.equal(project.name.en, 'Daesin Logistics Dispatch Operations Ledger');
  assert.equal(project.role.ko, '기획·FE·BE·배포·운영 단독');
  assert.equal(project.role.en, 'Sole owner of planning, frontend, backend, deployment, and operations');
  assert.equal(project.links.Live, undefined);
  assert.equal(project.links.FE, 'https://github.com/kilhyeonjun/daesin-logistics-bot-fe');
  assert.equal(project.links.BE, 'https://github.com/kilhyeonjun/daesin-logistics-bot-be');
  assert.equal(project.metrics.length, 3);
  assert.equal(project.problemSolving.length, 3);
  assert.equal(project.scenarioEvidence.length, 3);
  assert.equal(project.publicEvidence.length, 4);
  assert.equal(project.operationalLimits.ko.length, 3);
  assert.equal(project.operationalLimits.en.length, 3);
  assert.match(project.coverImage.ko, /daesin-scenario-journey\.svg$/);
  assert.match(project.coverImage.en, /daesin-scenario-journey-en\.svg$/);
  assert.match(project.printScenarioImage.ko, /daesin-scenario-journey-print\.svg$/);
  assert.match(project.printArchitectureDiagram.en, /daesin-arch-print-en\.svg$/);
  assert.equal(project.techDecisions.ko.length, 2);
  assert.equal(project.techDecisions.en.length, 2);
  const publicCopy = JSON.stringify(project);
  for (const forbidden of [/zero[- ]downtime/i, /real[- ]time/i, /automatic rollback/i, /Recharts/i, /Kakao/i, /카카오/, /무중단/, /실시간/, /자동 롤백/]) {
    assert.doesNotMatch(publicCopy, forbidden);
  }
  assert.doesNotMatch(publicCopy, /2026-07-\d{2}|280,925|485일|485 days/);
  assert.doesNotMatch(publicCopy, /30\/day|15\/day|일 30회|일 15회/);
  assert.match(publicCopy, /정각 15개/);
  assert.match(publicCopy, /15 scheduled/);
  assert.match(publicCopy, /singleton KST/);
  assert.match(publicCopy, /오늘 날짜/);
  assert.match(publicCopy, /current date/);
  assert.match(publicCopy, /고정 출력 projection/);
  assert.match(publicCopy, /fixed output projection/i);
  assert.match(publicCopy, /credential-bearing tracking URL/);
  assert.match(publicCopy, /public route DTO/i);
  assert.doesNotMatch(publicCopy, /Vercel read-only proxy|Public DTO proxy|hourly retry/);
  assert.doesNotMatch(publicCopy, /검증 완료 전|until verified/i);
  assert.match(publicCopy, /즉시 retry\/backoff는 없다/);
  assert.match(publicCopy, /no immediate retry or backoff/);
  assert.doesNotMatch(publicCopy, /daesin\.kilpenguin\.com|unlisted public|noindex/);
  assert.match(publicCopy, /source-URL contracts/);
  assert.match(publicCopy, /SearchDate\.ts/);
  assert.match(publicCopy, /GitHub Actions/);

  const [detail, print, css, diagram] = await Promise.all([
    read('src/components/templates/PortfolioDetailTemplate.astro'),
    read('src/components/templates/PortfolioPrintTemplate.astro'),
    read('src/styles/global.css'),
    read('public/images/portfolio/daesin-arch.svg'),
  ]);
  assert.match(detail, /isDaesinCase/);
  assert.match(detail, /daesin-cover-frame/);
  assert.match(detail, /public route DTO branch/);
  assert.match(detail, /projectScenarioEvidence/);
  assert.match(detail, /projectPublicEvidence/);
  assert.match(detail, /projectOperationalLimits/);
  assert.doesNotMatch(detail, /Vercel read-only proxy|Public DTO proxy|hourly retry|current anonymized|익명화된 현재/);
  assert.match(detail, /실시간 데이터 근거로 사용하지 않습니다/);
  assert.match(detail, /project\.links && Object\.entries\(project\.links\)/);
  assert.match(css, /\.daesin-cover-frame\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.portfolio-detail\.daesin-case > #problems\s*\{[^}]*grid-row:\s*4/s);
  assert.match(css, /\.daesin-case > #public-evidence\s*\{[^}]*grid-row:\s*7/s);
  assert.match(print, /isDaesinCase/);
  assert.match(print, /public route DTO branch/);
  assert.match(print, /scenario-strip/);
  assert.match(print, /operationalLimits/);
  assert.match(print, /publicEvidence/);
  assert.doesNotMatch(print, /Vercel read-only proxy|Public DTO proxy|hourly retry/);
  assert.match(print, /project\.metrics\.slice\(0, 3\)/);
  assert.match(diagram, /수집 흐름 · Collection flow/);
  assert.match(diagram, /조회 흐름 · Query flow/);
  assert.match(diagram, /singleton KST scheduler/);
  assert.match(diagram, /Next.js proxy/);
  assert.match(diagram, /public route DTO branch/);
  assert.match(diagram, /current date · hourly recheck/);
  assert.doesNotMatch(diagram, /Public DTO proxy|hourly retry/);
  assert.match(diagram, /health-gated switch/);
  assert.match(diagram, /manual rollback/);
  assert.match(diagram, /<title>/);
  assert.match(diagram, /<desc>/);
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
  assert.match(source, /\.listed-box\s*\{[^}]*break-inside:\s*avoid/s);
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
  assert.equal(files.length, 44);
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
  for (const action of [
    'actions/checkout@v7',
    'actions/setup-node@v7',
    'actions/configure-pages@v6',
    'actions/upload-pages-artifact@v5',
    'actions/deploy-pages@v5',
  ]) assert.match(workflow, new RegExp(`uses: ${action.replace('/', '\\/')}`));
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
