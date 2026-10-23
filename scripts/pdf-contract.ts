import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const normalize = (text: string) => text.normalize('NFKC').replace(/[\s\u200b\u00ad]+/gu, '');

/** Parse the complete PDF before publication; PDF.js transfers its input buffer. */
export async function validatePDF(bytes: Uint8Array, expectedText: string[], maxPages?: number): Promise<number> {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
    disableFontFace: true,
  });
  try {
    const pdf = await loadingTask.promise;
    if (maxPages && pdf.numPages > maxPages) {
      throw new Error(`PDF exceeds ${maxPages}-page limit (${pdf.numPages} pages); refusing to truncate content`);
    }
    let text = '';
    for (let number = 1; number <= pdf.numPages; number++) {
      const content = await (await pdf.getPage(number)).getTextContent();
      text += content.items.map(item => 'str' in item ? item.str : '').join('');
    }
    const actual = normalize(text);
    const required = new Map<string, number>();
    for (const value of expectedText) {
      const unit = normalize(value);
      if (unit) required.set(unit, (required.get(unit) ?? 0) + 1);
    }
    for (const [unit, count] of required) {
      let found = 0;
      let offset = 0;
      while (found < count) {
        const index = actual.indexOf(unit, offset);
        if (index < 0) break;
        found++;
        offset = index + unit.length;
      }
      if (found < count) throw new Error(`Missing PDF text (${found}/${count}): ${unit.slice(0, 160)}`);
    }
    return pdf.numPages;
  } finally {
    await loadingTask.destroy();
  }
}
