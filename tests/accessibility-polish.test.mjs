import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import test from 'node:test';
import puppeteer from 'puppeteer';

const root = new URL('../', import.meta.url);
const dist = join(new URL(root).pathname, 'dist');

async function serveDist() {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = normalize(pathname).replace(/^\/+/, '');
    let file = join(dist, relative);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': file.endsWith('.css') ? 'text/css' : 'text/html' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

function luminance([r, g, b]) {
  const values = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrast(foreground, background = [255, 255, 255]) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function elementContrast(page, selector) {
  const sample = await page.$eval(selector, (element) => {
    const rgba = (color) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const over = (foreground, background) => {
      const foregroundAlpha = foreground[3] / 255;
      const backgroundAlpha = background[3] / 255;
      const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
      if (alpha === 0) return [0, 0, 0, 0];
      return [
        ...foreground.slice(0, 3).map((value, index) => Math.round(
          (value * foregroundAlpha + background[index] * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
        )),
        Math.round(alpha * 255),
      ];
    };
    let background = [0, 0, 0, 0];
    for (let node = element; node; node = node.parentElement) {
      background = over(background, rgba(getComputedStyle(node).backgroundColor));
    }
    background = over(background, [255, 255, 255, 255]);
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      text: element.textContent.trim(),
      foreground: rgba(style.color),
      background,
      visible: style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0,
    };
  });
  const composite = sample.foreground.slice(0, 3).map((value, index) => {
    const alpha = sample.foreground[3] / 255;
    return Math.round(value * alpha + sample.background[index] * (1 - alpha));
  });
  return { text: sample.text, visible: sample.visible, ratio: contrast(composite, sample.background.slice(0, 3)) };
}

test('dark theme browser print keeps detail text readable on white paper', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const [path, selectors] of [
      ['/', ['.board-heading', '.outcome-board strong', 'p[class*="dark:bg-gray-800"]']],
      ['/portfolio/', ['.portfolio-case-featured h2', '.portfolio-case:not(.portfolio-case-featured) h2', '.portfolio-case:not(.portfolio-case-featured) p', '.portfolio-case:not(.portfolio-case-featured) .tech-badge']],
      ['/portfolio/daesin-logistics-bot/', ['h1', '.project-role', '.outcome-register-impact', '.project-proof-links a', '#problems h3', '#problems p', '#problems figcaption', '#limits article']],
      ['/portfolio/ai-coding-harness/', ['.project-proof-links a']],
      ['/experience/gameduo/', ['h1', '#outcomes h3', '#projects h3', '#projects p']],
      ['/404.html', ['a.bg-primary-600']],
    ]) {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'dark'));
      await page.emulateMediaType('print');
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      for (const selector of selectors) {
        const sample = await elementContrast(page, selector);
        assert.ok(sample.text, `${path} ${selector} must have text`);
        assert.ok(sample.visible, `${path} ${selector} must be visible in print`);
        assert.ok(sample.ratio >= 4.5, `${path} ${selector} contrast is ${sample.ratio.toFixed(2)}:1`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('dark print keeps every visible direct-text sample at WCAG AA', { timeout: 120000 }, async () => {
  const sitemap = await readFile(join(dist, 'sitemap-0.xml'), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => !/(?:-print|resume-ats|og-image)/.test(path));
  paths.push('/404.html');
  assert.equal(paths.length, 31, 'dark-print route scan must cover every public screen route');
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  let sampleCount = 0;
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'dark'));
    await page.emulateMediaType('print');
    for (const path of paths) {
      const response = await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), 200, `${path} must return HTTP 200`);
      assert.ok(await page.title(), `${path} must expose a document title`);
      const result = await page.$eval('body', (body) => {
        const rgba = (color) => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d');
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data];
        };
        const over = (foreground, background) => {
          const foregroundAlpha = foreground[3] / 255;
          const backgroundAlpha = background[3] / 255;
          const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
          if (alpha === 0) return [0, 0, 0, 0];
          return [
            ...foreground.slice(0, 3).map((value, index) => Math.round(
              (value * foregroundAlpha + background[index] * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
            )),
            Math.round(alpha * 255),
          ];
        };
        const luminance = (color) => {
          const values = color.map((value) => {
            const channel = value / 255;
            return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
        };
        const ratio = (foreground, background) => {
          const a = luminance(foreground);
          const b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        const samples = [...body.querySelectorAll('*')].flatMap((element) => {
          const text = [...element.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent.trim())
            .filter(Boolean)
            .join(' ');
          if (!text) return [];
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 || box.width <= 0 || box.height <= 0) return [];
          let background = [0, 0, 0, 0];
          for (let node = element; node; node = node.parentElement) {
            background = over(background, rgba(getComputedStyle(node).backgroundColor));
          }
          background = over(background, [255, 255, 255, 255]);
          const rawForeground = rgba(style.color);
          const foreground = rawForeground.slice(0, 3).map((value, index) => Math.round(
            value * (rawForeground[3] / 255) + background[index] * (1 - rawForeground[3] / 255),
          ));
          const contrastRatio = ratio(foreground, background.slice(0, 3));
          const large = Number.parseFloat(style.fontSize) >= 24
            || (Number.parseFloat(style.fontSize) >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
          return [{
            text: text.slice(0, 80),
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
            ratio: contrastRatio,
            threshold: large ? 3 : 4.5,
          }];
        });
        return {
          count: samples.length,
          failures: samples.filter((sample) => sample.ratio < sample.threshold).slice(0, 20),
        };
      });
      assert.ok(result.count > 0, `${path} must contribute visible text samples`);
      sampleCount += result.count;
      assert.deepEqual(result.failures, [], `${path} visible print contrast failures: ${JSON.stringify(result.failures)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  assert.ok(sampleCount > 1000, `expected a broad non-vacuous scan, got ${sampleCount} samples`);
});

test('print collapses redundant fallback covers instead of overlapping card content', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.goto(`${origin}/portfolio/`, { waitUntil: 'networkidle0' });
    const fallbackCovers = await page.$$eval('.portfolio-case > .portfolio-cover', (elements) => elements.map((element) => getComputedStyle(element).display));
    assert.ok(fallbackCovers.length > 0);
    assert.ok(fallbackCovers.every((display) => display === 'none'));
  } finally {
    await browser.close();
    server.close();
  }
});

test('screen semantic text meets WCAG AA on local light and dark surfaces', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const [path, theme, selectors] of [
      ['/portfolio/', 'light', ['.portfolio-case-featured .touch-target[href*="/portfolio/"]', '.portfolio-case-featured .text-gray-500', '.portfolio-case:not(.portfolio-case-featured) .rounded-md.bg-gray-100']],
      ['/portfolio/', 'dark', ['.portfolio-cover span']],
      ['/portfolio-print/', 'light', ['.listed-project-type']],
      ['/portfolio/daesin-logistics-bot/', 'dark', ['.project-role', '.outcome-register-impact']],
      ['/portfolio/ai-coding-harness/', 'dark', ['.project-role', '.outcome-register-impact']],
    ]) {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument((value) => localStorage.setItem('theme', value), theme);
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      for (const selector of selectors) {
        const sample = await elementContrast(page, selector);
        assert.ok(sample.text, `${path} ${selector} must have text`);
        assert.ok(sample.ratio >= 4.5, `${path} ${selector} contrast is ${sample.ratio.toFixed(2)}:1`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('resume achievement emphasis exposes non-empty text in KO and EN', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const path of ['/', '/en/']) {
      const page = await browser.newPage();
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      const values = await page.$$eval('.experience-item strong, .experience-item em', (elements) => {
        const textNodes = (node) => [...node.childNodes].flatMap((child) => child.nodeType === Node.TEXT_NODE ? [child.textContent.trim()] : textNodes(child));
        return elements.flatMap(textNodes).filter((value) => value.length > 1);
      });
      assert.ok(values.length > 0, `${path} must expose achievement emphasis`);
      const accessibilityText = JSON.stringify(await page.accessibility.snapshot({ interestingOnly: false }));
      for (const value of values) {
        assert.ok(accessibilityText.includes(value), `${path} accessibility tree omits: ${value}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('portfolio detail index follows every visually rendered H2 section in KO and EN', { timeout: 60000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const slugs = (await readdir(join(dist, 'portfolio'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    for (const path of slugs.flatMap((slug) => [`/portfolio/${slug}/`, `/en/portfolio/${slug}/`])) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      const result = await page.$eval('.portfolio-detail', (article) => ({
        sections: [...article.querySelectorAll(':scope > section')]
          .filter((section) => section.querySelector(':scope > h2'))
          .map((section) => section.id),
        links: [...article.querySelectorAll('.evidence-index a')].map((link) => link.getAttribute('href').slice(1)),
      }));
      assert.ok(result.sections.every(Boolean), `${path} has H2 sections without ids`);
      assert.deepEqual([...result.links].sort(), [...result.sections].sort(), `${path} index must cover rendered H2 sections`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('custom 404 keeps site navigation and recovery links', async () => {
  const html = await readFile(join(dist, '404.html'), 'utf8');
  const source = await readFile(new URL('../src/pages/404.astro', import.meta.url), 'utf8');
  assert.match(html, /KILPENGUIN \/ RESUME/);
  assert.match(html, /페이지를 찾을 수 없습니다/);
  assert.match(html, /Page not found/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/portfolio"/);
  assert.equal((html.match(/<main(?:\s|>)/g) ?? []).length, 1);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /rel="canonical"|rel="alternate"/);
  assert.match(source, /getHomePath/);
  assert.match(source, /getLocalePrefix/);
  assert.doesNotMatch(source, /href="\/(?:portfolio)?"/);
});

test('featured portfolio card stays contained at the tablet breakpoint', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const path of ['/portfolio/', '/en/portfolio/']) {
      const page = await browser.newPage();
      await page.setViewport({ width: 768, height: 900 });
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      const boxes = await page.$eval('.portfolio-case-featured', (card) => {
        const bounds = (element) => {
          const box = element.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        };
        return {
          card: bounds(card),
          cover: bounds(card.querySelector('.portfolio-cover')),
          content: bounds(card.lastElementChild),
        };
      });
      assert.ok(boxes.cover.right <= boxes.card.right + 1, `${path} cover must stay inside featured card`);
      assert.ok(boxes.content.right <= boxes.card.right + 1, `${path} content must stay inside featured card`);
      assert.ok(boxes.content.top >= boxes.cover.bottom - 1, `${path} tablet layout must stack cover before content`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('tablet portfolio navigation keeps visible SVG geometry inside the viewport', { timeout: 60000 }, async () => {
  const slugs = (await readdir(join(dist, 'portfolio'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const paths = slugs.flatMap((slug) => [`/portfolio/${slug}/`, `/en/portfolio/${slug}/`]);
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 768, height: 900 });
    for (const path of paths) {
      const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle0' });
      assert.equal(response?.status(), 200, `${path} must return HTTP 200`);
      const outside = await page.$$eval('svg path', (elements) => elements.flatMap((element) => {
        const box = element.getBoundingClientRect();
        if (box.width <= 0 || box.height <= 0) return [];
        return box.left < -1 || box.right > innerWidth + 1
          ? [{ left: box.left, right: box.right, viewport: innerWidth, path: element.getAttribute('d') }]
          : [];
      }));
      assert.deepEqual(outside, [], `${path} has clipped SVG geometry: ${JSON.stringify(outside)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test('portfolio PDF action has a 44px standalone target', { timeout: 30000 }, async () => {
  const { server, origin } = await serveDist();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/portfolio/`, { waitUntil: 'networkidle0' });
    const box = await page.$eval('.portfolio-hero a[href="/portfolio-print"]', (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { width: rect.width, height: rect.height, border: style.borderStyle, weight: Number(style.fontWeight) };
    });
    assert.ok(box.width >= 44 && box.height >= 44, `PDF target is ${box.width.toFixed(0)}×${box.height.toFixed(0)}`);
    assert.equal(box.border, 'solid');
    assert.ok(box.weight >= 600);
  } finally {
    await browser.close();
    server.close();
  }
});
