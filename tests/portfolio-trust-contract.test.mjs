import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const withoutComments = (html) => {
  let output = '';
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf('<!--', cursor);
    if (start < 0) return output + html.slice(cursor);
    output += html.slice(cursor, start);
    const end = html.indexOf('-->', start + 4);
    if (end < 0) return output;
    cursor = end + 3;
  }
  return output;
};
const robotsMetaCount = (html) => (withoutComments(html).match(
  /<meta\s+name=["']robots["']\s+content=["']noindex, follow["']\s*\/?>/g,
) || []).length;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const directionalHrefs = (html, label) => [...withoutComments(html).matchAll(new RegExp(
  `<a\\b(?=[^>]*aria-label="${escapeRegExp(label)}:[^"]+")[^>]*href="([^"]+)"[^>]*>`,
  'g',
))].map((match) => match[1]);

const expectedFeatured = ['realtime-game-chat', 'rds-saturation-rca', 'shared-package-ci-platform', 'ai-agent-control-platform'];
const expectedListed = ['family-budget-demo', 'flex-work-schedule', 'ai-coding-harness', 'daesin-logistics-bot', 'concert-reservation'];
const expectedHidden = ['gamebang', 'clinical-lab-jobs', 'innovalley-menu-bot', 'startuppool', 'slack-clone', 'react-nodebird', 'multichat', 'trollgg'];

test('portfolio visibility has one shared public-route contract', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const featured = data.projects.filter((project) => project.featured && !project.hidden)
    .sort((a, b) => a.printOrder - b.printOrder).map((project) => project.slug);
  const listed = data.projects.filter((project) => project.listed && !project.hidden)
    .sort((a, b) => new Date(b.period.start) - new Date(a.period.start)).map((project) => project.slug);
  const hidden = data.projects.filter((project) => project.hidden).map((project) => project.slug);

  for (const project of data.projects) {
    assert.equal(
      Number(project.featured === true) + Number(project.listed === true) + Number(project.hidden === true),
      1,
      project.slug,
    );
  }
  assert.deepEqual(featured, expectedFeatured);
  assert.deepEqual(listed, expectedListed);
  assert.deepEqual(hidden, expectedHidden);
  assert.equal(new Set([...featured, ...listed, ...hidden]).size, data.projects.length);

  const [indexTemplate, printTemplate, koRoute, enRoute, selector] = await Promise.all([
    read('src/components/templates/PortfolioTemplate.astro'),
    read('src/components/templates/PortfolioPrintTemplate.astro'),
    read('src/pages/portfolio/[slug].astro'),
    read('src/pages/en/portfolio/[slug].astro'),
    read('src/utils/portfolio-visibility.ts'),
  ]);
  for (const source of [indexTemplate, printTemplate]) {
    assert.match(source, /selectFeaturedPortfolioProjects/);
    assert.match(source, /selectListedPortfolioProjects/);
  }
  assert.doesNotMatch(indexTemplate, /slice\(0,\s*3\)/);
  assert.match(koRoute, /selectPublicPortfolioProjects/);
  assert.match(enRoute, /selectPublicPortfolioProjects/);
  assert.match(selector, /\.\.\.selectFeaturedPortfolioProjects\(projects\)/);
  assert.match(selector, /\.\.\.selectListedPortfolioProjects\(projects\)/);
});

test('every public case with operating limits exposes a linked limits section', async () => {
  const { projects } = JSON.parse(await read('src/data/portfolio.json'));
  for (const project of projects.filter((item) => !item.hidden && (item.featured || item.listed))) {
    for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
      const html = withoutComments(await read(`dist/${prefix}portfolio/${project.slug}/index.html`));
      if (project.operationalLimits?.[lang]?.length) {
        assert.match(html, /<section\b[^>]*id="limits"/, `${lang}/${project.slug} discloses limits`);
        assert.match(html, /href="#limits"/, `${lang}/${project.slug} links to limits`);
      } else {
        assert.doesNotMatch(html, /<section\b[^>]*id="limits"/, `${lang}/${project.slug} has no empty limits section`);
      }
    }
  }
});

test('company chat case study stays sanitized and scoped to load-test evidence', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const project = data.projects.find((candidate) => candidate.slug === 'realtime-game-chat');
  assert.ok(project);
  assert.equal(project.type, 'team');
  assert.equal(project.featured, true);
  assert.equal(project.printOrder, 1);
  assert.equal(project.github, undefined);
  for (const lang of ['ko', 'en']) {
    assert.match(project.operationalLimits[lang].join(' '), /sandbox/);
    assert.match(project.operationalLimits[lang].join(' '), /dev/);
  }
  assert.ok(project.metrics.length >= 4);
  for (const metric of project.metrics) assert.match(JSON.stringify(metric.after), /\d/);
  assert.doesNotMatch(JSON.stringify(project), /glider|vivox|bane|DTP-|gameduo\/|amazonaws|PR #\d|hyperdx/i);
  for (const lang of ['ko', 'en']) {
    assert.doesNotMatch(await read(`src/content/resume/${lang}.json`), /glider|vivox|DTP-\d|amazonaws|hyperdx/i, lang);
  }
  const svg = await read(`public/${project.architectureDiagram.replace(/^\//, '')}`);
  assert.match(svg, /role="img"/);
  assert.match(svg, /<title>/);
  assert.match(svg, /<desc>/);
  assert.doesNotMatch(svg, /glider|vivox|bane|gameduo|amazonaws/i);
});

test('derivative sources declare active noindex and robots allows crawlers to read it', async () => {
  const [config, portfolioPrint, experiencePrint, resumePrint, resumeAts, ogImage, robots] = await Promise.all([
    read('astro.config.mjs'),
    read('src/components/templates/PortfolioPrintTemplate.astro'),
    read('src/components/templates/ExperienceDetailPrintTemplate.astro'),
    read('src/components/templates/ResumePrintTemplate.astro'),
    read('src/components/templates/ResumeAtsTemplate.astro'),
    read('src/pages/og-image.astro'),
    read('public/robots.txt'),
  ]);
  assert.match(config, /page\.includes\('\/portfolio-print'\)/);
  assert.match(config, /page\.includes\('\/experience-print'\)/);
  assert.equal(
    robotsMetaCount('<!-- <meta name="robots" content="noindex, follow">'),
    0,
  );
  for (const source of [portfolioPrint, experiencePrint, resumePrint, resumeAts, ogImage]) {
    assert.equal(robotsMetaCount(source), 1);
  }
  assert.doesNotMatch(robots, /^Disallow:/m);
});

test('Concert and Daesin claims stay pinned to public evidence', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const concert = data.projects.find((project) => project.slug === 'concert-reservation');
  const daesin = data.projects.find((project) => project.slug === 'daesin-logistics-bot');
  const concertCopy = JSON.stringify(concert);

  for (const unsupported of [
    /10K concurrent/i, /1만 동시/, /15x TPS/i, /TPS 15배/, /94% DB/i,
    /DB 쿼리 94%/, /1,678ms/, /835ms/, /100% balance/i, /정합성 100%/,
    /Kafka 3-broker/i, /메시지 유실 방지/, /eliminat(?:e|ed|ing) coupling/i,
    /무한 루프|infinite retry/i, /알림|notification/i,
  ]) assert.doesNotMatch(concertCopy, unsupported);

  assert.deepEqual(concert.metrics.map((metric) => metric.after), ['676ms', '0.64%', '62.5ms']);
  assert.match(concert.summary.ko, /5\.74초에서 676ms/);
  assert.match(concert.summary.en, /5\.74s to 676ms/);
  assert.match(concert.scale.ko, /설정값 3,000 requests\/s/);
  assert.match(concert.scale.en, /Configured 3,000 requests\/s/);
  for (const url of Object.values(concert.links)) {
    assert.match(url, /\/blob\/6eb289b019354f8eb710c6bedbfd2d5d567d583e\//);
  }

  assert.equal(concert.architectureDiagram.ko, '/images/portfolio/concert-reservation-arch.svg');
  assert.equal(concert.architectureDiagram.en, '/images/portfolio/concert-reservation-arch-en.svg');
  const [concertKoDiagram, concertEnDiagram] = await Promise.all([
    read('public/images/portfolio/concert-reservation-arch.svg'),
    read('public/images/portfolio/concert-reservation-arch-en.svg'),
  ]);
  for (const diagram of [concertKoDiagram, concertEnDiagram]) {
    assert.match(diagram, /role="img"/);
    assert.match(diagram, /<title>/);
    assert.match(diagram, /<desc>/);
    assert.match(diagram, /(?:코드별 TTL 2분|Per-code TTL: 2 min)/);
  }
  assert.doesNotMatch(concertEnDiagram, /[가-힣]/);

  for (const evidence of daesin.publicEvidence) {
    for (const url of [evidence.url, evidence.testUrl].filter(Boolean)) {
      if (url.includes('/blob/')) assert.doesNotMatch(url, /\/blob\/main\//);
    }
  }
});

test('new portfolio candidates stay synthetic, scoped, and visually evidenced', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const candidates = ['flex-work-schedule', 'gamebang', 'clinical-lab-jobs']
    .map((slug) => data.projects.find((project) => project.slug === slug));
  assert.equal(candidates.every(Boolean), true);
  assert.equal(data.projects.some((project) => project.slug === 'medical-recruit'), false);
  assert.doesNotMatch(candidates[1].highlights.en.join(' '), /Tests cover/);
  assert.match(candidates[2].role.en, /Family-user-informed/);
  assert.doesNotMatch(JSON.stringify(candidates[0]), /stored locally|browser-history restoration|Plans are browser-local|reset boundary|로컬에 저장|브라우저 history 복원|reset 경계/);
  assert.doesNotMatch(JSON.stringify(candidates[1]), /same player key|player-key return|같은 player key/);
  assert.match(JSON.stringify(candidates[1]), /valid reconnect token/);
  assert.doesNotMatch(JSON.stringify(candidates[2]), /official-posting|official source|공식 공고|공식 원문/);
  for (const project of candidates) {
    assert.ok(project.architectureDiagram, project.slug);
    assert.ok(project.scenarioEvidence?.length, project.slug);
    assert.ok(project.operationalLimits?.ko.length, project.slug);
    for (const path of [project.architectureDiagram, ...project.scenarioEvidence.flatMap((item) => Object.values(item.image))]) {
      const svg = await read(`public/${path.replace(/^\//, '')}`);
      assert.match(svg, /role="img"/);
      assert.match(svg, /<title>/);
      assert.match(svg, /<desc>/);
    }
  }
  assert.doesNotMatch(JSON.stringify(candidates), /\/Users\/|CLINICAL_JOBS_|room code \w{4,}/);
});

test('featured portfolio cards always show a cover or case diagram', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  for (const slug of expectedFeatured) {
    const project = data.projects.find((item) => item.slug === slug);
    const image = project.coverImage ?? project.architectureDiagram;
    assert.ok(image, `${slug} card image`);
    for (const path of typeof image === 'string' ? [image] : Object.values(image)) {
      assert.match(path, /\.svg$/, `${slug} card image is a drawn diagram`);
      await stat(join(root, 'public', path));
    }
  }
  for (const page of ['portfolio/index.html', 'en/portfolio/index.html']) {
    const html = await read(`dist/${page}`);
    assert.doesNotMatch(html, /portfolio-cover|concert-reservation-cover/, page);
    const cards = html.split('<article').slice(1).map((card) => card.split('</article>')[0]).filter((card) => card.includes('portfolio-case'));
    assert.equal(cards.length, expectedFeatured.length, page);
    for (const card of cards) assert.match(card, /<img\b/, page);
  }
});

test('company RCA and shared-package cases stay sanitized and name their environments', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  for (const slug of ['rds-saturation-rca', 'shared-package-ci-platform', 'ai-agent-control-platform']) {
    const project = data.projects.find((candidate) => candidate.slug === slug);
    assert.equal(project?.type, 'team', slug);
    assert.equal(project.github, undefined, slug);
    assert.ok(project.metrics.length >= 4, slug);
    assert.ok(project.operationalLimits.ko.length >= 3 && project.operationalLimits.en.length === project.operationalLimits.ko.length, slug);
    assert.equal(project.highlights.en.length, project.highlights.ko.length, slug);
    const covers = await Promise.all(Object.values(project.coverImage).map((path) => read(join('public', path))));
    const copy = JSON.stringify(project) + covers.map((svg) => svg.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).join(' ');
    assert.doesNotMatch(copy, /glider|vivox|bane|\bBN\b|\bHB\b|\bNB2\b|\bBBC\b|\bDFD\b|\blmk\b|IDX_|gameduo|amazonaws|PR #\d|#\d{3,}|findLatest|sheet_localized|marketing_metric_daily/i, slug);
    assert.doesNotMatch(copy, /\b[A-Z][A-Z0-9]+-\d+\b/, `${slug} ticket keys`);
  }
  const rds = data.projects.find((candidate) => candidate.slug === 'rds-saturation-rca');
  for (const lang of ['ko', 'en']) {
    for (const item of rds.problemSolving) assert.match(item.problem[lang], /live|sandbox|백필|backfill/, lang);
  }
  assert.doesNotMatch(JSON.stringify([rds.summary, rds.highlights, rds.metrics]), /5~7%|5–7%/, 'idle CPU is not an outcome');
});

test('listed projects retain backend links and skill signals in compact portfolio print', async () => {
  const printTemplate = await read('src/components/templates/PortfolioPrintTemplate.astro');
  assert.match(printTemplate, /Additional Backend Projects/);
  assert.match(printTemplate, /topSkills/);
  assert.match(printTemplate, /class="listed-project-skills"/);
  assert.match(printTemplate, /class="listed-project-summary"/);
  assert.match(printTemplate, /\.listed-project-summary\s*\{\s*display:\s*none;/s);
});

test('built public routes exclude hidden projects and print derivatives from discovery', async (t) => {
  let sitemap;
  try { sitemap = await read('dist/sitemap-0.xml'); }
  catch (error) {
    if (error.code === 'ENOENT') return t.skip('run after build');
    throw error;
  }
  for (const slug of expectedHidden) {
    await assert.rejects(read(`dist/portfolio/${slug}/index.html`), (error) => error.code === 'ENOENT');
    await assert.rejects(read(`dist/en/portfolio/${slug}/index.html`), (error) => error.code === 'ENOENT');
    assert.doesNotMatch(sitemap, new RegExp(`/portfolio/${slug}/`));
  }
  const publicOrder = [...expectedFeatured, ...expectedListed];
  for (const { lang, prefix, previousLabel, nextLabel } of [
    { lang: 'ko', prefix: '', previousLabel: '이전 프로젝트', nextLabel: '다음 프로젝트' },
    { lang: 'en', prefix: '/en', previousLabel: 'Previous Project', nextLabel: 'Next Project' },
  ]) {
    for (const [index, slug] of publicOrder.entries()) {
      const html = await read(`dist${prefix}/portfolio/${slug}/index.html`);
      for (const hidden of expectedHidden) assert.doesNotMatch(html, new RegExp(`${prefix}/portfolio/${hidden}`));
      const previous = index > 0 ? [`${prefix}/portfolio/${publicOrder[index - 1]}`] : [];
      const next = index < publicOrder.length - 1 ? [`${prefix}/portfolio/${publicOrder[index + 1]}`] : [];
      assert.deepEqual(directionalHrefs(html, previousLabel), previous, `${lang}:${slug}:previous`);
      assert.deepEqual(directionalHrefs(html, nextLabel), next, `${lang}:${slug}:next`);
    }
  }
  for (const path of [
    '/portfolio-print/', '/experience-print/', '/en/portfolio-print/', '/en/experience-print/',
    '/resume-print/', '/resume-ats/', '/en/resume-print/', '/en/resume-ats/', '/og-image/',
  ]) {
    assert.doesNotMatch(sitemap, new RegExp(path.replaceAll('/', '\\/')));
    const html = await read(`dist${path}index.html`);
    assert.equal(robotsMetaCount(html), 1, path);
  }
});

test('company case flows restate only figures from their own problem-solving entry', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const numbers = (text) => text.match(/\d+(?:[.,]\d+)*/g) ?? [];
  // A before→after pair must appear as the same pair in the source, not as two loose numbers.
  const compact = (text) => text.replace(/\s+/g, '');
  const pairs = (text) => compact(text).match(/\d[\d.,]*[A-Za-z가-힣%]*→\d[\d.,]*[A-Za-z가-힣%]*/g) ?? [];
  for (const slug of ['realtime-game-chat', 'rds-saturation-rca', 'shared-package-ci-platform', 'ai-agent-control-platform']) {
    const project = data.projects.find((candidate) => candidate.slug === slug);
    for (const [index, entry] of project.problemSolving.entries()) {
      assert.ok(entry.flow?.some((step) => step.kind === 'result'), `${slug}[${index}] needs a result step`);
      for (const lang of ['ko', 'en']) {
        const sourceText = [entry.problem, entry.process, entry.result].map((part) => part[lang]).join(' ');
        const source = new Set(numbers(sourceText));
        for (const step of entry.flow) {
          for (const figure of numbers(step.text[lang])) {
            assert.ok(source.has(figure), `${slug}[${index}] ${lang} "${step.text[lang]}" cites ${figure} not in the entry`);
          }
          for (const pair of pairs(step.text[lang])) {
            assert.ok(compact(sourceText).includes(pair), `${slug}[${index}] ${lang} pair ${pair} not in the entry`);
          }
        }
      }
    }
  }
});

test('AI agent platform case keeps policy-enforcement mechanics off the public page', async () => {
  const data = JSON.parse(await read('src/data/portfolio.json'));
  const project = data.projects.find((candidate) => candidate.slug === 'ai-agent-control-platform');
  const covers = await Promise.all(Object.values(project.coverImage).map((path) => read(join('public', path))));
  const copy = JSON.stringify(project) + covers.join(' ');
  assert.doesNotMatch(copy, /MITM|netlock|중간자|인증서|certificate|\bCA\b|PATCH|POST |\/api\/|\b403\b|\b10\.\d+\.\d+\.\d+\b|i-[0-9a-f]{8,}|\bt[34]g?\.[a-z0-9]+\b|claude\.ai|selective|선택(?:적)?\s*검사|Ed25519|프롬프트|prompt|thinking|세션 로그|원본 동기화|session[- ]log|raw session|jsonl|1,913|1\.68GiB/i);
  for (const lang of ['ko', 'en']) {
    assert.ok(project.operationalLimits[lang].some((line) => /87/.test(line) && /92/.test(line)), `${lang} states 87 counts devices, not the 92 people`);
  }
});
