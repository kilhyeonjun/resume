import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

const expectedFeatured = ['flex-work-schedule', 'ai-coding-harness', 'concert-reservation'];
const expectedListed = ['family-budget-demo', 'gamebang', 'clinical-lab-jobs', 'daesin-logistics-bot', 'innovalley-menu-bot', 'startuppool'];
const expectedHidden = ['slack-clone', 'react-nodebird', 'multichat', 'trollgg'];

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

test('portfolio supports explicit backend-platform and product-algorithm featured orders', async () => {
  const template = await read('src/components/templates/PortfolioTemplate.astro');
  assert.match(template, /backend-platform.*ai-coding-harness.*concert-reservation.*flex-work-schedule/s);
  assert.match(template, /product-algorithm.*flex-work-schedule.*concert-reservation.*ai-coding-harness/s);
  assert.match(template, /new URLSearchParams\(location\.search\)/);
  assert.match(template, /data-slug=\{project\.slug\}/);
  assert.match(template, /focus=backend-platform/);
  assert.match(template, /focus=product-algorithm/);
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
    assert.match(diagram, /(?:코드 설정|code config) TTL (?:2분|2 min)/);
  }
  assert.doesNotMatch(concertEnDiagram, /[가-힣]/);

  for (const evidence of daesin.publicEvidence) {
    for (const url of [evidence.url, evidence.testUrl].filter(Boolean)) {
      if (url.includes('/blob/')) assert.doesNotMatch(url, /\/blob\/main\//);
    }
  }
  assert.equal(daesin.publicEvidence.at(-1).claim.en, 'BE clean CI run');
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

test('family budget demo is listed only with synthetic browser-local production evidence', async () => {
  const { projects } = JSON.parse(await read('src/data/portfolio.json'));
  const demo = projects.find((project) => project.slug === 'family-budget-demo');
  assert.equal(demo?.listed, true);
  assert.equal(demo?.featured, undefined);
  assert.equal(demo?.links?.demo, 'https://family-budget-demo-three.vercel.app');
  assert.match(JSON.stringify(demo), /synthetic|합성/);
  assert.match(JSON.stringify(demo), /localStorage|browser-local|브라우저/);
  assert.doesNotMatch(JSON.stringify(demo), /real family financial (?:records|transactions)|실제 가족 (?:거래|계좌|잔액)/);
});

test('listed projects retain backend summaries in portfolio print', async () => {
  const printTemplate = await read('src/components/templates/PortfolioPrintTemplate.astro');
  assert.match(printTemplate, /Additional Backend Projects/);
  assert.match(printTemplate, /project\.summary\[lang\]/);
  assert.match(printTemplate, /listed-project-summary/);
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
