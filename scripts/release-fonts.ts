import type { Page } from 'puppeteer';

/** Require the bundled face, not a successful system fallback or an empty check(). */
export async function requireReleaseFonts(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    await document.fonts.ready;
    return document.readyState === 'complete';
  }, { timeout: 15000 });
  await page.evaluate(async () => {
    for (const weight of [400, 600, 700]) {
      const faces = await document.fonts.load(`${weight} 12px "Resume Print"`, '길현준 Backend 0123456789');
      if (!faces.length || faces.some(face => face.status !== 'loaded' || face.family.replace(/["']/g, '') !== 'Resume Print')) {
        throw new Error('Required bundled Resume Print font is unavailable');
      }
    }
    if (!getComputedStyle(document.body).fontFamily.startsWith('"Resume Print"')) {
      throw new Error('Release document does not select the bundled Resume Print font');
    }
    await Promise.all(Array.from(document.images, image => image.decode()));
  });
}
