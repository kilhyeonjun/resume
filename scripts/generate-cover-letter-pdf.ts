/**
 * Cover Letter PDF Generator
 * Converts markdown cover letter to PDF using Puppeteer
 * Usage: tsx scripts/generate-cover-letter-pdf.ts <path-to-markdown>
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';

const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: tsx scripts/generate-cover-letter-pdf.ts <path-to-markdown>');
  process.exit(1);
}

const fullMdPath = resolve(mdPath);
const outputDir = dirname(fullMdPath);
const outputPath = resolve(outputDir, 'pdf', 'cover-letter-ko.pdf');

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Emphasis
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code inline
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // List items
    .replace(/^\- (.*?)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>');

  // Wrap everything in paragraphs where needed
  html = '<p>' + html + '</p>';

  return html;
}

async function generatePdf() {
  try {
    // Read markdown
    const md = readFileSync(fullMdPath, 'utf-8');
    const html = markdownToHtml(md);

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover Letter</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
      font-size: 11pt;
    }
    @page {
      size: A4;
      margin: 0.75in;
    }
    h1 {
      font-size: 18pt;
      font-weight: 600;
      margin: 0 0 0.25in 0;
      padding-bottom: 0.1in;
      border-bottom: 2px solid #333;
    }
    h2 {
      font-size: 13pt;
      font-weight: 600;
      margin: 0.3in 0 0.15in 0;
      color: #1a1a1a;
    }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      margin: 0.2in 0 0.1in 0;
      color: #444;
    }
    p {
      margin: 0 0 0.15in 0;
      text-align: justify;
    }
    li {
      margin-left: 0.25in;
      margin-bottom: 0.1in;
    }
    strong {
      font-weight: 600;
    }
    em {
      font-style: italic;
    }
    code {
      font-family: 'Courier New', monospace;
      background-color: #f0f0f0;
      padding: 0.05in 0.1in;
      border-radius: 2px;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 0.2in 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `;

    // Write HTML to temp file
    const tempHtmlPath = `/tmp/cover-letter-temp-${Date.now()}.html`;
    writeFileSync(tempHtmlPath, htmlContent);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
        right: '0.75in',
      },
      printBackground: true,
    });

    await browser.close();

    console.log(`✓ Cover letter PDF generated: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

generatePdf();
