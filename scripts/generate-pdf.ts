/** Generate complete, font-pinned resume PDFs; reject overflow instead of cropping. */
import puppeteer, { type Browser } from 'puppeteer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { ResumeData } from '../src/content.config';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { requireReleaseFonts } from './release-fonts';
import { validatePDF } from './pdf-contract';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PDFConfig {
  name: string;
  path: string;
  filename: string;
  printBackground: boolean;
  maxPages?: number;
}

const PDF_CONFIGS: Record<'ko' | 'en', PDFConfig[]> = {
  ko: [
    { name: 'HR Version (Korean)', path: '/resume-print', filename: 'resume-hr-ko.pdf', printBackground: true, maxPages: 2 },
    { name: 'ATS Version (Korean)', path: '/resume-ats', filename: 'resume-ats-ko.pdf', printBackground: false, maxPages: 3 },
    { name: 'Career Description (Korean)', path: '/experience-print', filename: 'career-detail-ko.pdf', printBackground: true },
    { name: 'Portfolio (Korean)', path: '/portfolio-print', filename: 'portfolio-ko.pdf', printBackground: true },
  ],
  en: [
    { name: 'HR Version (English)', path: '/en/resume-print', filename: 'resume-hr-en.pdf', printBackground: true, maxPages: 2 },
    { name: 'ATS Version (English)', path: '/en/resume-ats', filename: 'resume-ats-en.pdf', printBackground: false, maxPages: 3 },
    { name: 'Career Description (English)', path: '/en/experience-print', filename: 'career-detail-en.pdf', printBackground: true },
    { name: 'Portfolio (English)', path: '/en/portfolio-print', filename: 'portfolio-en.pdf', printBackground: true },
  ],
};

async function generatePDF(browser: Browser, baseUrl: string, config: PDFConfig, outputDir: string): Promise<void> {
  const page = await browser.newPage();
  try {
    const url = `${baseUrl}${config.path}`;
    console.log(`Generating ${config.name}: ${url}`);
    await page.setViewport({ width: 1200, height: 1697, deviceScaleFactor: 2 });
    await page.emulateMediaType('print');

    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
        await delay(1000 * 2 ** (attempt - 1));
      }
    }
    if (!response?.ok()) {
      throw new Error(`Refusing to generate PDF from HTTP ${response?.status() ?? 'no response'}: ${url}`);
    }
    const contract = await page.evaluate(() => ({
      h1: document.querySelector('main h1')?.textContent?.trim(),
      download: Boolean(document.querySelector('a[download][href*="/pdf/"]')),
    }));
    if (!contract.h1 || !contract.download) {
      throw new Error(`Refusing to generate PDF from a non-Resume page: ${url}`);
    }
    await requireReleaseFonts(page);
    const expectedText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT);
      const units: string[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        // Explicit surface exclusions only: accidental display:none must still fail completeness.
        if (node.parentElement?.closest('script, style, svg, .no-print, .back-link')) continue;
        const text = node.textContent?.trim();
        if (text) units.push(text);
      }
      return units;
    });
    if (config.filename.startsWith('career-detail-')) {
      const lang = config.filename.endsWith('-ko.pdf') ? 'ko' : 'en';
      const { main } = JSON.parse(await readFile(resolve(__dirname, `../src/content/resume/${lang}.json`), 'utf8')) as { main: ResumeData };
      const normalize = (text: string) => text.normalize('NFKC').replace(/[\s\u200b\u00ad]+/gu, '');
      const rendered = normalize(expectedText.join(''));
      for (const experience of main.experience) {
        for (const position of experience.positions ?? []) {
          const required = [position.title, ...position.highlights.flatMap(highlight => [highlight.problem, highlight.solution, highlight.result])];
          for (const text of required) {
            if (!rendered.includes(normalize(text))) {
              throw new Error(`Missing career source content for ${experience.company}: ${text}`);
            }
          }
        }
      }
    }
    const bytes = await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: config.printBackground });
    const pages = await validatePDF(bytes, expectedText, config.maxPages);
    await mkdir(outputDir, { recursive: true });
    await writeFile(resolve(outputDir, config.filename), bytes);
    console.log(`Saved ${config.filename}: ${pages} pages, complete text verified`);
  } finally {
    await page.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const generateHR = args.includes('--hr') || !args.includes('--ats');
  const generateATS = args.includes('--ats') || !args.includes('--hr');
  const generateKo = args.includes('--ko') || !args.includes('--en');
  const generateEn = args.includes('--en') || !args.includes('--ko');
  const baseUrlIndex = args.indexOf('--base-url');
  const baseUrl = (baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'http://127.0.0.1:4321').replace(/\/+$/, '');
  new URL(baseUrl);
  const outputDirIndex = args.indexOf('--output');
  const outputDir = outputDirIndex !== -1 ? resolve(args[outputDirIndex + 1]) : resolve(__dirname, '..', 'dist', 'pdf');
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
    });
    const configs = [ ...(generateKo ? PDF_CONFIGS.ko : []), ...(generateEn ? PDF_CONFIGS.en : []) ];
    for (const config of configs) {
      if (config.path.includes('print') && !generateHR) continue;
      if (config.path.includes('ats') && !generateATS) continue;
      await generatePDF(browser, baseUrl, config, outputDir);
    }
  } finally {
    if (browser) await browser.close();
  }
}

main().catch(error => {
  console.error('PDF generation failed:', error);
  process.exitCode = 1;
});
