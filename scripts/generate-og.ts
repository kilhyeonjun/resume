/**
 * OG Image Generation Script
 *
 * Generates public/og-image.png from resume data via Puppeteer screenshot.
 * Reuses the same Puppeteer infrastructure as generate-pdf.ts.
 *
 * Usage:
 *   npm run og              # Generate OG image
 *
 * Prerequisites:
 *   - Astro dev server running (npm run dev)
 */

import puppeteer from 'puppeteer';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const baseUrlIndex = args.indexOf('--base-url');
  const baseUrl = (baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'http://127.0.0.1:4321').replace(/\/+$/, '');
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? resolve(args[outputIndex + 1]) : resolve(__dirname, '..', 'public', 'og-image.png');
  const ogUrl = `${baseUrl}/og-image`;

  console.log('\n🖼️  OG Image Generator\n');
  console.log(`   URL: ${ogUrl}`);
  console.log(`   Output: ${outputPath}\n`);

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2,
    });

    const response = await page.goto(ogUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    if (!response?.ok()) {
      throw new Error(`Refusing to generate OG image from HTTP ${response?.status() ?? 'unknown'}: ${ogUrl}`);
    }
    const validPage = await page.$('.container h1.name');
    if (!validPage) {
      throw new Error(`Refusing to generate OG image from an unexpected page: ${ogUrl}`);
    }

    // Wait for fonts and rendering
    await page.waitForFunction(
      () => document.readyState === 'complete' && document.fonts.ready.then(() => true),
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());

    await page.screenshot({
      path: outputPath,
      type: 'png',
    });

    console.log('   ✅ OG image generated successfully!\n');
  } catch (error) {
    console.error('\n❌ OG image generation failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
