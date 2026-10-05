import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('resume experience headings do not retain the overlapping legacy marker', async () => {
  const css = await readFile(new URL('src/styles/global.css', root), 'utf8');
  assert.match(
    css,
    /\.resume-dossier \.experience-item::before\s*\{[^}]*display:\s*none/s,
  );
});

const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const readDist = (path) => readFile(new URL(`dist/${path}`, root), 'utf8');

test('side projects render in their own section, not inside work experience', async () => {
  for (const [lang, prefix, heading, experienceHeading] of [
    ['ko', '', '사이드 프로젝트', '경력'],
    ['en', 'en/', 'Side Projects', 'Experience'],
  ]) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const side = resume.main.experience.filter((item) => item.side);
    assert.deepEqual(side.map((item) => item.slug), ['personal'], lang);
    assert.equal(resume.main.labels.sideProjects, heading);
    for (const [page, caseOf] of [
      [`${prefix}index.html`, (text) => text],
      [`${prefix}resume-print/index.html`, (text) => text],
      [`${prefix}resume-ats/index.html`, (text) => text.toUpperCase()],
    ]) {
      const html = await readDist(page);
      const sideAt = html.indexOf(`>${caseOf(heading)}</h2>`);
      const experienceAt = html.indexOf(`>${caseOf(experienceHeading)}</h2>`);
      assert.ok(experienceAt >= 0 && sideAt > experienceAt, `${page} side section follows experience`);
      const companyAt = html.indexOf(side[0].company);
      assert.ok(companyAt > sideAt, `${page} side entry sits under the side heading`);
    }
    await readDist(`${prefix}experience/personal/index.html`);
  }
});

test('skills list concrete tools instead of invented capability labels', async () => {
  for (const lang of ['ko', 'en']) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const names = resume.main.skills.flatMap((group) => group.items.map((item) => item.name));
    assert.doesNotMatch(names.join('|'), /TDD Governance|Evidence Search|AI Output Verification|Git Hooks/, lang);
    for (const tool of ['k6', 'Grafana', 'DynamoDB', 'LocalStack', 'Claude Code']) assert.ok(names.includes(tool), `${lang} ${tool}`);
  }
});

test('Platform Part leader highlights carry measurable outcomes', async () => {
  for (const lang of ['ko', 'en']) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const leader = resume.main.experience[0].positions[0];
    const measured = leader.highlights.filter((item) => /\d/.test(item.result));
    assert.equal(measured.length, leader.highlights.length, `${lang} leader results with numbers: ${measured.length}`);
  }
});

test('evidence board pairs each kicker with the metric from its own highlight', async () => {
  for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const proofs = resume.main.experience
      .flatMap((exp) => exp.positions?.flatMap((position) => position.highlights) ?? exp.highlights ?? [])
      .filter((item) => item.proofLabel);
    assert.equal(proofs.length, 3, lang);
    const html = await readDist(`${prefix}index.html`);
    const rows = [...html.matchAll(/class="result-kicker"[^>]*>([^<]*)<\/span>\s*<strong class="result-metric"[^>]*>([^<]*)<\/strong>/g)];
    assert.deepEqual(rows.map(([, kicker]) => kicker), proofs.map((item) => item.proofLabel), lang);
    rows.forEach(([, kicker, metric], index) => {
      const { result } = proofs[index];
      assert.ok(result.startsWith(kicker), `${lang} ${kicker} prefixes its result`);
      assert.ok(result.slice(kicker.length).trim().startsWith(metric), `${lang} ${kicker} metric comes from the same result`);
      assert.match(metric, /\d/, `${lang} ${kicker} metric carries a number`);
      assert.doesNotMatch(metric, /\([^)]*$/, `${lang} ${kicker} metric keeps parentheses balanced`);
    });
  }
});

test('evidence board leads with the company case metrics, not list-price savings', async () => {
  for (const [lang, expected] of [
    ['ko', ['ack p95 767ms→6.6ms', '26배', '3시간→15분']],
    ['en', ['ack p95 767ms→6.6ms', '26x', '3hrs→15min']],
  ]) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const proofs = resume.main.experience
      .flatMap((exp) => exp.positions?.flatMap((position) => position.highlights) ?? exp.highlights ?? [])
      .filter((item) => item.proofLabel);
    expected.forEach((metric, index) => assert.ok(proofs[index].result.includes(metric), `${lang} proof ${index}`));
    assert.ok(proofs.every((item) => !item.result.includes('82%')), lang);
  }
  for (const page of ['index.html', 'en/index.html']) {
    const html = await readDist(page);
    const [, kicker] = html.match(/<header class="resume-header"[^>]*>\s*<span class="dossier-label"[^>]*>([^<]*)<\/span>/) ?? [];
    assert.equal(kicker, 'Resume', page);
  }
});

test('HR resume surfaces state each flagship metric once and keep the summary to three sentences', async () => {
  for (const [lang, metrics, sentenceEnd] of [
    ['ko', ['82%', '18초', '270배', '3시간→15분', '26배', '767ms→6.6ms'], /다\.(?:\s|$)/g],
    ['en', ['82%', '18s', '270x', '3hrs→15min', '26x', '767ms→6.6ms'], /\.(?:\s|$)/g],
  ]) {
    const { main } = await readJson(`src/content/resume/${lang}.json`);
    const visible = [
      main.summary,
      ...main.coreCompetencies.flatMap((group) => group.items),
      ...main.experience.flatMap((exp) => [...(exp.positions?.flatMap((position) => position.highlights ?? []) ?? []), ...(exp.highlights ?? [])])
        .flatMap((item) => [item.problem, item.solution, item.result]),
      ...main.technicalWriting.map((item) => item.achievement ?? ''),
    ].join('\n');
    for (const metric of metrics) assert.equal(visible.split(metric).length - 1, 1, `${lang} ${metric}`);
    assert.equal(main.summary.match(sentenceEnd)?.length, 3, `${lang} summary sentences`);
    for (const project of main.experience.flatMap((exp) => exp.projects ?? [])) {
      assert.ok((project.details ?? []).length <= 7, `${lang} ${project.name} details`);
    }
    assert.doesNotMatch(JSON.stringify(main), /\b(?:BANE|BNID|BNKR|BNTW|NB2|DFD)\b/, `${lang} internal game codes`);
  }
});
