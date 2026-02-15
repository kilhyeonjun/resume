import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const pages = [
    {
      url: 'https://kilhyeonjun.github.io/resume/',
      filename: 'korean-resume.png',
      name: 'Korean Resume'
    },
    {
      url: 'https://kilhyeonjun.github.io/resume/en',
      filename: 'english-resume.png',
      name: 'English Resume'
    },
    {
      url: 'https://kilhyeonjun.github.io/resume/experience/gameduo',
      filename: 'experience-detail.png',
      name: 'Experience Detail (GameDuo)'
    }
  ];
  
  const outputDir = path.join(__dirname, '.sisyphus/evidence');
  
  for (const pageConfig of pages) {
    try {
      console.log(`Capturing: ${pageConfig.name}`);
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1440, height: 900 });
      
      // Navigate to page
      await page.goto(pageConfig.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait a bit for any animations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get full page height
      const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      
      // Take full-page screenshot
      await page.screenshot({
        path: path.join(outputDir, pageConfig.filename),
        fullPage: true
      });
      
      console.log(`✓ Saved: ${pageConfig.filename} (full height: ${fullHeight}px)`);
      await page.close();
    } catch (error) {
      console.error(`✗ Failed to capture ${pageConfig.name}: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\nAll screenshots completed!');
}

takeScreenshots().catch(console.error);
