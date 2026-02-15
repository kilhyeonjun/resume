import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const EVIDENCE_DIR = '/PRIVATE/PATH';
const VIEWPORT = { width: 794, height: 1123 };

const pages = [
  { name: 'print', url: 'https://kilhyeonjun.github.io/resume/resume-print/' },
  { name: 'ats', url: 'https://kilhyeonjun.github.io/resume/resume-ats/' }
];

async function capturePageMetrics(page, pageName) {
  const metrics = {
    pageName,
    url: page.url(),
    fullPageHeight: null,
    noPrintElements: 0,
    backLinkElements: 0,
    navElements: 0,
    footerElements: 0,
    htmlLang: null,
    consoleErrors: [],
    consoleWarnings: []
  };

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      metrics.consoleErrors.push(msg.text());
    } else if (type === 'warning') {
      metrics.consoleWarnings.push(msg.text());
    }
  });

  // Get metrics from page
  const pageMetrics = await page.evaluate(() => {
    return {
      fullPageHeight: document.documentElement.scrollHeight,
      noPrintElements: document.querySelectorAll('.no-print').length,
      backLinkElements: document.querySelectorAll('.back-link').length,
      navElements: document.querySelectorAll('nav').length,
      footerElements: document.querySelectorAll('footer').length,
      htmlLang: document.documentElement.getAttribute('lang')
    };
  });

  Object.assign(metrics, pageMetrics);
  return metrics;
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  try {
    for (const pageConfig of pages) {
      console.log(`\n=== Capturing ${pageConfig.name.toUpperCase()} ===`);
      
      // Normal viewport capture
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      
      await page.goto(pageConfig.url, { waitUntil: 'networkidle2' });
      
      // Wait for fonts to load
      await page.evaluate(() => {
        return new Promise(resolve => {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(resolve);
          } else {
            setTimeout(resolve, 1000);
          }
        });
      });
      
      const metrics = await capturePageMetrics(page, pageConfig.name);
      results.push(metrics);
      
      // Screenshot normal
      const screenshotPath = path.join(EVIDENCE_DIR, `${pageConfig.name}-fullpage.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`✓ Screenshot saved: ${screenshotPath}`);
      console.log(`  Full page height: ${metrics.fullPageHeight}px`);
      console.log(`  no-print elements: ${metrics.noPrintElements}`);
      console.log(`  back-link elements: ${metrics.backLinkElements}`);
      console.log(`  nav elements: ${metrics.navElements}`);
      console.log(`  footer elements: ${metrics.footerElements}`);
      console.log(`  html lang: ${metrics.htmlLang}`);
      console.log(`  console errors: ${metrics.consoleErrors.length}`);
      if (metrics.consoleErrors.length > 0) {
        console.log(`    ${metrics.consoleErrors.join('\n    ')}`);
      }
      
      await page.close();
      
      // Print media emulation capture
      const mediaPage = await browser.newPage();
      await mediaPage.setViewport(VIEWPORT);
      
      await mediaPage.goto(pageConfig.url, { waitUntil: 'networkidle2' });
      await mediaPage.evaluate(() => {
        return new Promise(resolve => {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(resolve);
          } else {
            setTimeout(resolve, 1000);
          }
        });
      });
      
      await mediaPage.emulateMediaType('print');
      
      const mediaScreenshotPath = path.join(EVIDENCE_DIR, `${pageConfig.name}-media-emulation.png`);
      await mediaPage.screenshot({ path: mediaScreenshotPath, fullPage: true });
      console.log(`✓ Print media screenshot saved: ${mediaScreenshotPath}`);
      
      await mediaPage.close();
    }
    
    // Save results summary
    const summaryPath = path.join(EVIDENCE_DIR, 'metrics.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\n✓ Metrics saved to: ${summaryPath}`);
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
