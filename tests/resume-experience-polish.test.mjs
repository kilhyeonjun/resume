import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const readDist = (path) => readFile(new URL(`dist/${path}`, root), 'utf8');

test('company tenure is not attributed to a later promoted role', async () => {
  for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
    const { main } = await readJson(`src/content/resume/${lang}.json`);
    const html = await readDist(`${prefix}index.html`);
    const entries = html.split(/<div class="experience-item\b/).slice(1);
    const period = (item) => `${item.startDate.replace('-', '.')} — ${item.current ? main.labels.current : item.endDate.replace('-', '.')}`;
    for (const experience of main.experience.filter((item) => item.positions?.length > 1)) {
      const entry = entries.find((item) => item.includes(`href="/${prefix}experience/${experience.slug}"`));
      assert.ok(entry, `${lang} company history is visible`);
      const heading = entry.match(/<h3\b[^>]*>\s*([^<]+?)\s*<\/h3>/)?.[1];
      const companyPeriod = entry.match(/<p\b[^>]*>\s*(20\d{2}\.\d{2}\s*—[^<]+?)\s*<\/p>/)?.[1];
      assert.deepEqual([heading, companyPeriod], [experience.company, period(experience)], `${lang} full employment tenure belongs to the company, not the latest role`);
      const roles = [...entry.matchAll(/<h4\b[^>]*>\s*([^<]+?)\s*<\/h4>\s*<span\b[^>]*>\s*([^<]+?)\s*<\/span>/g)];
      assert.deepEqual(roles.map(([, role, dates]) => [role, dates]), experience.positions.map((position) => [position.title, period(position)]), `${lang} each role retains its own promotion dates`);
    }
  }
});

test('side projects render in their own section, not inside work experience', async () => {
  for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
    const { main } = await readJson(`src/content/resume/${lang}.json`);
    const side = main.experience.filter((item) => item.side);
    for (const [page, caseOf] of [
      [`${prefix}index.html`, (text) => text],
      [`${prefix}resume-print/index.html`, (text) => text],
      [`${prefix}resume-ats/index.html`, (text) => text.toUpperCase()],
    ]) {
      const html = await readDist(page);
      const sideAt = html.indexOf(`>${caseOf(main.labels.sideProjects)}</h2>`);
      const experienceAt = html.indexOf(`>${caseOf(main.labels.experience)}</h2>`);
      assert.ok(experienceAt >= 0 && sideAt > experienceAt, `${page} side section follows experience`);
      for (const entry of side) assert.ok(html.indexOf(entry.company) > sideAt, `${page} ${entry.slug} belongs to side projects`);
    }
    for (const entry of side) await readDist(`${prefix}experience/${entry.slug}/index.html`);
  }
});

test('evidence board pairs each kicker with an intact metric from its own highlight', async () => {
  for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
    const resume = await readJson(`src/content/resume/${lang}.json`);
    const proofs = resume.main.experience
      .flatMap((exp) => exp.positions?.flatMap((position) => position.highlights) ?? exp.highlights ?? [])
      .filter((item) => item.proofLabel);
    const html = await readDist(`${prefix}index.html`);
    const rows = [...html.matchAll(/class="result-kicker"[^>]*>([^<]*)<\/span>\s*<strong class="result-metric"[^>]*>([^<]*)<\/strong>/g)];
    assert.deepEqual(rows.map(([, kicker]) => kicker), proofs.map((item) => item.proofLabel), lang);
    rows.forEach(([, kicker, metric], index) => {
      const { result } = proofs[index];
      assert.ok(result.startsWith(kicker), `${lang} ${kicker} prefixes its result`);
      assert.ok(result.slice(kicker.length).trim().startsWith(metric), `${lang} ${kicker} metric comes from the same result`);
      assert.match(metric, /\d/, `${lang} metric carries a number`);
      assert.doesNotMatch(metric, /\([^)]*$/, `${lang} metric keeps parentheses balanced`);
    });
  }
});
