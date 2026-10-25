import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const data = JSON.parse(await read('src/data/portfolio.json'));
const diagramEvidence = async project => {
  if (!project.designDiagrams?.length) return '';
  const assets = await Promise.all(project.designDiagrams.flatMap(diagram => Object.values(diagram.image)).map(path => read(join('public', path))));
  const directory = `docs/diagrams/${project.slug}`;
  const sources = await Promise.all((await readdir(join(root, directory))).filter(name => name.endsWith('.json')).map(name => read(join(directory, name))));
  return sources.join('\n') + assets.map(svg => svg.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).join('\n');
};
const order = (a, b) => (a.printOrder ?? Number.MAX_SAFE_INTEGER) - (b.printOrder ?? Number.MAX_SAFE_INTEGER)
  || new Date(b.period.start) - new Date(a.period.start);
const featured = data.projects.filter(p => p.featured && !p.hidden).sort(order);
const listed = data.projects.filter(p => p.listed && !p.hidden).sort(order);
const hidden = data.projects.filter(p => p.hidden);
const withoutComments = html => {
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
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const directionalHrefs = (html, label) => [...withoutComments(html).matchAll(new RegExp(
  `<a\\b(?=[^>]*aria-label="${escapeRegExp(label)}:[^"]+")[^>]*href="([^"]+)"[^>]*>`, 'g',
))].map(match => match[1]);

test('public cases expose operating limits without empty disclosure sections', async () => {
  for (const project of [...featured, ...listed]) {
    for (const [lang, prefix] of [['ko', ''], ['en', 'en/']]) {
      const html = withoutComments(await read(`dist/${prefix}portfolio/${project.slug}/index.html`));
      if (project.operationalLimits?.[lang]?.length) {
        assert.match(html, /<section\b[^>]*id="limits"/, `${lang}/${project.slug}`);
        assert.match(html, /href="#limits"/, `${lang}/${project.slug}`);
      } else {
        assert.doesNotMatch(html, /<section\b[^>]*id="limits"/, `${lang}/${project.slug}`);
      }
    }
  }
});

test('public routes exclude hidden cases and print derivatives from discovery', async () => {
  const sitemap = await read('dist/sitemap-0.xml');
  for (const { slug } of hidden) {
    await assert.rejects(read(`dist/portfolio/${slug}/index.html`), error => error.code === 'ENOENT');
    await assert.rejects(read(`dist/en/portfolio/${slug}/index.html`), error => error.code === 'ENOENT');
    assert.doesNotMatch(sitemap, new RegExp(`/portfolio/${escapeRegExp(slug)}/`));
  }
  const publicOrder = [...featured, ...listed].map(p => p.slug);
  for (const [lang, prefix, previousLabel, nextLabel] of [
    ['ko', '', '이전 프로젝트', '다음 프로젝트'],
    ['en', '/en', 'Previous Project', 'Next Project'],
  ]) {
    for (const [index, slug] of publicOrder.entries()) {
      const html = await read(`dist${prefix}/portfolio/${slug}/index.html`);
      for (const item of hidden) assert.doesNotMatch(html, new RegExp(`${prefix}/portfolio/${escapeRegExp(item.slug)}`));
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
    const html = withoutComments(await read(`dist${path}index.html`));
    assert.equal((html.match(/<meta\s+name=["']robots["']\s+content=["']noindex, follow["']\s*\/?>/g) || []).length, 1, path);
  }
});

test('company case flow figures retain their own before-after attribution', () => {
  const numbers = text => text.match(/\d+(?:[.,]\d+)*/g) ?? [];
  const compact = text => text.replace(/\s+/g, '');
  const pairs = text => compact(text).match(/\d[\d.,]*[A-Za-z가-힣%]*→\d[\d.,]*[A-Za-z가-힣%]*/g) ?? [];
  for (const project of featured) {
    for (const [index, entry] of (project.problemSolving ?? []).entries()) {
      if (!entry.flow) continue;
      for (const lang of ['ko', 'en']) {
        const sourceText = [entry.problem, entry.process, entry.result].map(part => part[lang]).join(' ');
        const source = new Set(numbers(sourceText));
        for (const step of entry.flow) {
          for (const figure of numbers(step.text[lang])) assert.ok(source.has(figure), `${project.slug}[${index}] ${lang}: ${figure}`);
          for (const pair of pairs(step.text[lang])) assert.ok(compact(sourceText).includes(pair), `${project.slug}[${index}] ${lang}: ${pair}`);
        }
      }
    }
  }
});

test('company chat and resume surfaces do not publish internal infrastructure identifiers', async () => {
  const project = data.projects.find(p => p.slug === 'realtime-game-chat');
  assert.doesNotMatch(JSON.stringify(project) + await diagramEvidence(project), /glider|vivox|bane|DTP-|gameduo\/|amazonaws|PR #\d|hyperdx/i);
  for (const lang of ['ko', 'en']) {
    assert.doesNotMatch(await read(`src/content/resume/${lang}.json`), /glider|vivox|DTP-\d|amazonaws|hyperdx/i, lang);
  }
  const svg = await read(join('public', project.architectureDiagram));
  assert.doesNotMatch(svg, /glider|vivox|bane|gameduo|amazonaws/i);
});

test('company case data and covers exclude private identifiers and ticket references', async () => {
  for (const slug of ['rds-saturation-rca', 'shared-package-ci-platform', 'ai-agent-control-platform']) {
    const project = data.projects.find(p => p.slug === slug);
    const covers = await Promise.all(Object.values(project.coverImage).map(path => read(join('public', path))));
    const copy = JSON.stringify(project) + await diagramEvidence(project) + covers.map(svg => svg.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).join(' ');
    assert.doesNotMatch(copy, /glider|vivox|bane|\bBN\b|\bHB\b|\bNB2\b|\bBBC\b|\bDFD\b|\blmk\b|IDX_|gameduo|amazonaws|PR #\d|#\d{3,}|findLatest|sheet_localized|marketing_metric_daily/i, slug);
    assert.doesNotMatch(copy, /\b[A-Z][A-Z0-9]+-\d+\b/, `${slug} ticket keys`);
  }
});

test('personal demos exclude local paths, private configuration and room credentials', () => {
  const projects = ['flex-work-schedule', 'gamebang', 'clinical-lab-jobs'].map(slug => data.projects.find(p => p.slug === slug));
  assert.doesNotMatch(JSON.stringify(projects), /\/Users\/|CLINICAL_JOBS_|room code \w{4,}/);
});

test('AI agent platform case keeps policy-enforcement mechanics off the public page', async () => {
  const project = data.projects.find(p => p.slug === 'ai-agent-control-platform');
  const covers = await Promise.all(Object.values(project.coverImage).map(path => read(join('public', path))));
  const copy = JSON.stringify(project) + covers.join(' ') + await diagramEvidence(project);
  assert.doesNotMatch(copy, /MITM|netlock|중간자|인증서|certificate|\bCA\b|PATCH|POST |\/api\/|\b403\b|\b10\.\d+\.\d+\.\d+\b|i-[0-9a-f]{8,}|\bt[34]g?\.[a-z0-9]+\b|claude\.ai|selective|선택(?:적)?\s*검사|Ed25519|프롬프트|prompt|thinking|세션 로그|원본 동기화|session[- ]log|raw session|jsonl|1,913|1\.68GiB/i);
});
