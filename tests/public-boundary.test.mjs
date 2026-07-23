import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

async function textFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return textFiles(path);
    return /\.(?:astro|css|html|js|json|md|mjs|svg|ts|txt)$/.test(entry.name) ? [path] : [];
  }))).flat();
}

test('private operating namespaces are never tracked', () => {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root })
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  for (const prefix of ['.jd-custom/', '.claude/', '.rag/', 'docs/plans/', 'docs/superpowers/']) {
    assert.equal(tracked.some((file) => file.startsWith(prefix)), false, prefix);
  }
});

test('deployable sources exclude private recruiting evidence', async () => {
  const files = [
    ...await textFiles(join(root, 'src')),
    ...await textFiles(join(root, 'public')),
  ];
  const forbidden = [
    /[REDACTED]|[REDACTED]|[REDACTED]|[REDACTED]|[REDACTED]|hanwha\s*life/i,
    /(?:low|high)[ -]?fit|[REDACTED]|AI Backend\s*82|JD\s*(?:score|적합도)/i,
    /[REDACTED]/i,
    /(?:^|[^A-Za-z0-9])(?:kh|gp|gd)(?:[^A-Za-z0-9]|$)/i,
    /548\s*(?:files|파일)|3,347\s*(?:chunks|청크)|109\s*(?:chunks|청크)/i,
    /15\/15\s+default-on|[REDACTED]|RAG\s+default-on/i,
    /873\s*files|6,212\s*chunks|6,809\s*nodes|6,720\s*edges|56,072\s*chunks|1,849\s*nodes|8,037\s*edges|120\s*chunks/i,
    /[REDACTED]|[REDACTED]/i,
  ];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const pattern of forbidden) assert.doesNotMatch(text, pattern, file);
  }
});
