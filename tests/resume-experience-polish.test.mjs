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
    assert.ok(measured.length >= 2, `${lang} leader results with numbers: ${measured.length}`);
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
