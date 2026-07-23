import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pairs = ['boundary-ko', 'boundary-en', 'sequence-ko', 'sequence-en'].map((name) => ({
  source: `${root}docs/diagrams/ai-harness/${name}.mmd`,
  output: `${root}public/images/portfolio/ai-coding-harness-${name}.svg`,
}));
const mode = process.argv[2];
if (!['stamp', 'verify'].includes(mode)) throw new Error('expected stamp or verify');

for (const { source, output } of pairs) {
  const digest = createHash('sha256').update(await readFile(source)).digest('hex');
  const marker = `<metadata data-source-sha256="${digest}"/>`;
  const svg = await readFile(output, 'utf8');
  if (mode === 'verify') {
    if (!svg.includes(marker)) throw new Error(`stale generated diagram: ${output}`);
    continue;
  }
  const clean = svg.replace(/<metadata data-source-sha256="[a-f0-9]{64}"\/>/, '');
  await writeFile(output, clean.replace(/^(<svg\b[^>]*>)/, `$1${marker}`), 'utf8');
}
