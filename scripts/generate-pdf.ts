/**
 * PDF Generation Script for Resume
 * 
 * Usage:
 *   npm run pdf                    # All versions (KO+EN, HR+ATS)
 *   npm run pdf -- --hr            # HR versions only
 *   npm run pdf -- --ats           # ATS versions only
 *   npm run pdf -- --ko            # Korean only
 *   npm run pdf -- --en            # English only
 *   npm run pdf -- --ko --hr       # Korean HR only
 * 
 * Prerequisites:
 *   - Astro dev server running (npm run dev)
 *   - Or specify custom base URL with --base-url
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PDFConfig {
  name: string;
  path: string;
  filename: string;
  format?: 'A4' | 'Letter';
  printBackground: boolean;
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

interface PDFConfigSet {
  ko: PDFConfig[];
  en: PDFConfig[];
}

const PDF_CONFIGS: PDFConfigSet = {
  ko: [
    {
      name: 'HR Version (Korean)',
      path: '/resume-print',
      filename: 'resume-hr-ko.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    },
    {
      name: 'ATS Version (Korean)',
      path: '/resume-ats',
      filename: 'resume-ats-ko.pdf',
      format: 'A4',
      printBackground: false,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    },
  ],
  en: [
    {
      name: 'HR Version (English)',
      path: '/en/resume-print',
      filename: 'resume-hr-en.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    },
    {
      name: 'ATS Version (English)',
      path: '/en/resume-ats',
      filename: 'resume-ats-en.pdf',
      format: 'A4',
      printBackground: false,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    },
  ],
};

async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForFunction(() => document.readyState === 'complete');
  // Additional wait for fonts and styles
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function generatePDF(
  browser: Browser,
  baseUrl: string,
  config: PDFConfig,
  outputDir: string
): Promise<void> {
  const page = await browser.newPage();
  
  try {
    const url = `${baseUrl}${config.path}`;
    console.log(`  📄 Generating ${config.name}...`);
    console.log(`     URL: ${url}`);

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for full page load
    await waitForPageLoad(page);

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = resolve(outputDir, config.filename);

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: config.format || 'A4',
      printBackground: config.printBackground,
      margin: config.margin,
      preferCSSPageSize: true,
    });

    console.log(`     ✅ Saved to: ${outputPath}`);
  } catch (error) {
    console.error(`     ❌ Error generating ${config.name}:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const generateHR = args.includes('--hr') || (!args.includes('--ats'));
  const generateATS = args.includes('--ats') || (!args.includes('--hr'));
  const generateKo = args.includes('--ko') || (!args.includes('--en'));
  const generateEn = args.includes('--en') || (!args.includes('--ko'));
  
  const baseUrlIndex = args.indexOf('--base-url');
  const baseUrl = baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'http://localhost:4321/resume';
  
  const outputDirIndex = args.indexOf('--output');
  const outputDir = outputDirIndex !== -1 
    ? resolve(args[outputDirIndex + 1])
    : resolve(__dirname, '..', 'dist', 'pdf');

  console.log('\n🚀 Resume PDF Generator\n');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Languages: ${generateKo ? 'KO' : ''} ${generateEn ? 'EN' : ''}`);
  console.log(`   Types: ${generateHR ? 'HR' : ''} ${generateATS ? 'ATS' : ''}\n`);

  let browser: Browser | null = null;

  try {
    console.log('📦 Launching browser...\n');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    const configs: PDFConfig[] = [];
    
    if (generateKo) {
      configs.push(...PDF_CONFIGS.ko.filter((c) => {
        if (c.path.includes('print') && !generateHR) return false;
        if (c.path.includes('ats') && !generateATS) return false;
        return true;
      }));
    }
    
    if (generateEn) {
      configs.push(...PDF_CONFIGS.en.filter((c) => {
        if (c.path.includes('print') && !generateHR) return false;
        if (c.path.includes('ats') && !generateATS) return false;
        return true;
      }));
    }

    for (const config of configs) {
      await generatePDF(browser, baseUrl, config, outputDir);
    }

    console.log('\n✨ PDF generation complete!\n');
  } catch (error) {
    console.error('\n❌ PDF generation failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
