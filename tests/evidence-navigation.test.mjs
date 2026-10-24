import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import puppeteer from 'puppeteer';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'));
const highlights = (resume) => resume.main.experience.flatMap((experience) =>
  experience.positions?.flatMap((position) => position.highlights ?? []) ?? experience.highlights ?? [],
);

async function serveDist() {
  const server = createServer(async (request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname)).replace(/^\/+/, '');
    let file = join(root, 'dist', path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

test('localized evidence links navigate by keyboard to their public case and document actions remain distinct', { timeout: 60000 }, async () => {
  const { projects } = await readJson('src/data/portfolio.json');
  const { server, origin } = await serveDist();
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    for (const [lang, prefix] of [['ko', ''], ['en', '/en']]) {
      const resume = await readJson(`src/content/resume/${lang}.json`);
      const proofs = highlights(resume).filter((highlight) => highlight.proofLabel);
      assert.deepEqual(proofs.map((proof) => proof.evidenceProject), [
        'realtime-game-chat', 'rds-saturation-rca', 'shared-package-ci-platform',
      ]);
      await page.goto(`${origin}${prefix}/`);
      assert.equal(await page.$$eval('.outcome-case-link', (links) => links.length), proofs.length);
      for (const [index, proof] of proofs.entries()) {
        const project = projects.find((project) => project.slug === proof.evidenceProject);
        assert.ok(project && !project.hidden && (project.featured || project.listed));
        await page.goto(`${origin}${prefix}/`);
        const selector = `.outcome-row:nth-of-type(${index + 1}) .outcome-case-link`;
        const link = await page.$eval(selector, (element) => ({
          href: element.getAttribute('href'), name: element.getAttribute('aria-label'), nested: Boolean(element.querySelector('a')),
        }));
        assert.equal(link.href, `${prefix}/portfolio/${project.slug}`);
        assert.ok(link.name?.includes(project.name[lang]), `${lang} descriptive accessible case name`);
        assert.equal(link.nested, false);
        await page.focus(selector);
        await Promise.all([page.waitForNavigation(), page.keyboard.press('Enter')]);
        assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), link.href);
        assert.equal(await page.$eval('html', (element) => element.lang), lang);
        assert.ok((await page.$eval('h1', (element) => element.textContent)).includes(project.name[lang]));
      }
      await page.goto(`${origin}${prefix}/`);
      const actions = await page.$$eval('.resume-actions a', (links) => links.map((link) => ({
        href: link.getAttribute('href'), text: link.textContent.trim(),
      })));
      assert.deepEqual(new Set(actions.map((link) => link.href)), new Set([
        `${prefix}/resume-print`, `${prefix}/resume-ats`, `${prefix}/experience-print`,
        `${prefix}/portfolio`, `${prefix}/portfolio-print`,
      ]));
      const web = actions.find((link) => link.href === `${prefix}/portfolio`);
      const pdf = actions.find((link) => link.href === `${prefix}/portfolio-print`);
      assert.notEqual(web.text, pdf.text);
      assert.match(pdf.text, /PDF/);
      for (const action of actions) {
        const response = await page.goto(`${origin}${action.href}`);
        assert.equal(response.status(), 200, action.href);
        assert.equal(await page.$eval('html', (element) => element.lang), lang);
      }
    }
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

function build(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, output }));
  });
}

test('actual Astro builds reject missing, unknown, and hidden evidence targets', { timeout: 180000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'evidence-target-'));
  try {
    for (const path of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
      await cp(join(root, path), join(fixture, path), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
    const portfolio = await readJson('src/data/portfolio.json');
    const hidden = portfolio.projects.find((project) => project.hidden);
    assert.ok(hidden, 'a real hidden target exercises visibility rejection');
    for (const [target, expected] of [
      [undefined, /Evidence Board highlights require an evidenceProject slug/],
      ['not-a-public-case', /Invalid Evidence Board target.*must reference a public portfolio case/],
      [hidden.slug, /Invalid Evidence Board target.*must reference a public portfolio case/],
    ]) {
      for (const lang of ['ko', 'en']) {
        const resume = await readJson(`src/content/resume/${lang}.json`);
        const proof = highlights(resume).find((highlight) => highlight.proofLabel);
        if (target === undefined) delete proof.evidenceProject;
        else proof.evidenceProject = target;
        await writeFile(join(fixture, `src/content/resume/${lang}.json`), JSON.stringify(resume));
      }
      await rm(join(fixture, '.astro'), { recursive: true, force: true });
      const result = await build(fixture);
      assert.notEqual(result.code, 0, `${target ?? 'missing'} must fail the build`);
      assert.match(result.output, expected);
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
