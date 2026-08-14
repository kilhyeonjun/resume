import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.FAMILY_BUDGET_DEMO_URL || 'http://127.0.0.1:4335';
const outputDir = new URL('../public/images/portfolio/', import.meta.url).pathname;
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'light',
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul',
});

const captures = [
  ['family-budget-product-dashboard.png', '/dashboard', { x: 0, y: 0, width: 1440, height: 760 }],
  ['family-budget-product-today.png', '/', { x: 0, y: 0, width: 1440, height: 720 }],
  ['family-budget-product-recurring.png', '/recurring', { x: 240, y: 70, width: 1160, height: 790 }],
];

for (const [filename, route, clip] of captures) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.locator('nextjs-portal').evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  await page.screenshot({ path: `${outputDir}${filename}`, clip, type: 'png' });
  await page.close();
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
await mobile.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await mobile.locator('nextjs-portal').evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
await mobile.screenshot({ path: `${outputDir}family-budget-product-mobile.png`, type: 'png' });
await mobile.close();
await browser.close();

console.log(captures.map(([name]) => name).concat('family-budget-product-mobile.png').join('\n'));
