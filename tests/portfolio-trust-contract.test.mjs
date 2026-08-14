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

const expectedFeatured = ['flex-work-schedule', 'ai-coding-harness', 'concert-reservation', 'family-budget-demo'];
const expectedListed = ['gamebang', 'clinical-lab-jobs', 'daesin-logistics-bot', 'innovalley-menu-bot', 'startuppool'];
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
    assert.match(diagram, /(?:코드별 TTL 2분|Per-code TTL: 2 min)/);
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

test('family budget case study centers the operational product and keeps the demo as public evidence', async () => {
  const { projects } = JSON.parse(await read('src/data/portfolio.json'));
  const project = projects.find((candidate) => candidate.slug === 'family-budget-demo');
  assert.equal(project?.hidden, undefined);
  assert.equal(project?.featured, true);
  assert.equal(project?.listed, undefined);
  assert.match(project?.name?.ko ?? '', /^Family Budget.*부부 가계부/);
  assert.match(project?.name?.en ?? '', /^Family Budget.*Household Budget/i);
  assert.match(project?.summary?.ko ?? '', /부부 공용 가계부/);
  assert.match(project?.summary?.en ?? '', /shared household budget/i);
  assert.match(project?.role?.ko ?? '', /개인 제품.*기획.*백엔드.*데이터 모델.*운영 자동화.*반응형 UX.*전 범위 담당/);
  assert.doesNotMatch(`${project?.name?.ko} ${project?.summary?.ko} ${project?.role?.ko}`, /7개 화면|localStorage|공개 데모 설계/);
  assert.ok(project?.coverImage);
  assert.ok(project?.printScenarioImage);
  assert.equal(project?.productScreens?.length, 4);
  assert.deepEqual(project?.contentImages, [
    '/images/portfolio/family-budget-product-today.webp',
    '/images/portfolio/family-budget-product-mobile.webp',
    '/images/portfolio/family-budget-product-recurring.webp',
  ]);
  for (const path of [project.coverImage.ko, project.printScenarioImage.ko, ...project.productScreens.flatMap((screen) => Object.values(screen.image))]) {
    assert.match(path, /^\/images\/portfolio\/family-budget-product-/);
    assert.ok((await stat(`public/${path.replace(/^\//, '')}`)).size > 10_000, path);
  }
  assert.deepEqual(project?.metrics?.map((metric) => metric.label.ko), ['운영 정본 전환', '계획 ≠ 실제', '중복·불확실성 차단']);
  assert.equal(project?.problemSolving?.length, 3);
  assert.equal(project?.techDecisions?.ko.length, 3);
  assert.equal(project?.operationalLimits?.ko.length, 3);
  assert.ok(project?.architectureDiagram);
  assert.ok(project?.sequenceDiagram);
  assert.ok(project?.scenarioEvidence?.length >= 2);
  assert.ok(project?.publicEvidence?.length >= 4);
  assert.equal(project?.links?.Demo, 'https://family-budget-demo-three.vercel.app');
  for (const evidence of project.publicEvidence) {
    for (const url of [evidence.url, evidence.testUrl].filter(Boolean)) {
      if (url.includes('/blob/')) assert.match(url, /\/blob\/b822842ea84d7e63401d2288a8944afd9f4fe5cd\//);
    }
  }
  for (const path of [project.architectureDiagram.ko, project.architectureDiagram.en, project.sequenceDiagram.ko, project.sequenceDiagram.en, ...project.scenarioEvidence.flatMap((item) => Object.values(item.image))]) {
    const svg = await read(`public/${path.replace(/^\//, '')}`);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
  }
  const claimCopy = JSON.stringify({
    name: project.name,
    summary: project.summary,
    description: project.description,
    role: project.role,
    highlights: project.highlights,
    metrics: project.metrics,
    problemSolving: project.problemSolving,
  });
  assert.doesNotMatch(claimCopy, /단독|solo ownership|private API 0건|zero private API|사용자 수|user count|재무 효과|financial impact|실제 금액|real financial amount/);

  const detailTemplate = await read('src/components/templates/PortfolioDetailTemplate.astro');
  assert.match(detailTemplate, /isFamilyBudgetCase/);
  assert.match(detailTemplate, /실제 제품 화면으로 보는 사용자 여정|implemented product UI/);
  assert.match(detailTemplate, /projectProductScreens\.map/);
  assert.match(detailTemplate, /case-product-screen-hero/);
  assert.match(detailTemplate, /운영 제품 경계|Operational product boundary/);
  assert.match(detailTemplate, /조정 흐름|reconciliation flow/);
  assert.match(detailTemplate, /공개 증거 저장소|Public evidence repository/);
  assert.match(detailTemplate, /합성 공개 데모 · 운영 미연결|Synthetic public demo · not connected to operations/);
  assert.doesNotMatch(detailTemplate, /라이브 데모 · 합성 데이터|Live demo · synthetic data/);
  assert.match(detailTemplate, /project\.links\.Demo/);

  const printTemplate = await read('src/components/templates/PortfolioPrintTemplate.astro');
  assert.match(printTemplate, /family-budget-product-print/);
  assert.match(printTemplate, /Family Budget 월말 대시보드|Family Budget month-end dashboard/);
  assert.match(printTemplate, /핵심 시스템 설계|Core system design/);
  assert.match(printTemplate, /핵심 문제 해결|Key problem solving/);
  assert.match(printTemplate, /project\.problemSolving\[0\]/);
  assert.doesNotMatch(printTemplate, /isFamilyBudgetCase \? `\$\{period\} · \$\{typeLabel\}`/);
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
