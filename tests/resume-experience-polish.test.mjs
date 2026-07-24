import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('resume experience headings do not retain the overlapping legacy marker', async () => {
  const css = await readFile(new URL('src/styles/global.css', root), 'utf8');
  assert.match(
    css,
    /\.resume-dossier \.experience-item::before\s*\{[^}]*display:\s*none/s,
  );
});
