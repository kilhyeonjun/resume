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
  const baseUrl = baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'http://localhost:4321/resume';
  const outputPath = resolve(__dirname, '..', 'public', 'og-image.png');

  console.log('\n🖼️  OG Image Generator\n');
  console.log(`   URL: ${baseUrl}/og-image`);
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

    await page.goto(`${baseUrl}/og-image`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts and rendering
    await page.waitForFunction(
      () => document.readyState === 'complete' && document.fonts.ready.then(() => true),
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 500));

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
