import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
const base = 'http://127.0.0.1:4325';
const out = 'docs/design/drafts/2026-08-13-family-budget-case-study/qa-final';
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 60000, args: ['--no-sandbox'] });
const results = [];
for (const [lang, path] of [['ko', '/portfolio/family-budget-demo/'], ['en', '/en/portfolio/family-budget-demo/']]) {
  for (const [name, width, height] of [['desktop', 1440, 1100], ['mobile', 390, 844]]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    const response = await page.goto(base + path, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      for (const image of [...document.images]) {
        image.scrollIntoView({ block: 'center' });
        if (!image.complete) await new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); });
      }
    });
    const data = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent?.trim(),
      h2: [...document.querySelectorAll('.portfolio-detail > section > h2')].map((node) => node.textContent?.trim()),
      overflow: document.documentElement.scrollWidth > innerWidth,
      broken: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      links: [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href),
      svgTitles: [...document.querySelectorAll('img[src*="family-budget"]')].map((image) => image.alt),
    }));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${out}/${lang}-${name}.png`, fullPage: true });
    results.push({ lang, name, status: response?.status(), ...data });
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
