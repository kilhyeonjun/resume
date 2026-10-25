import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [directory, ...extra] = process.argv.slice(2);
if (!directory || extra.length) throw new Error('Supply one npm timing directory.');

// npm prints every timer key when --timing is set, even at the default log level.
// Keep its normal stdout, warnings and errors; expose timings only via the bounded
// summary step. Raw debug/timing receipts stay in the runner's temporary directory.
const child = spawn('npm', ['ci', '--timing', '--color=false', '--heading=npm', '--logs-dir', directory], {
  stdio: ['inherit', 'inherit', 'pipe'],
});
const lines = createInterface({ input: child.stderr });
lines.on('line', line => {
  if (!line.startsWith('npm timing ')) process.stderr.write(`${line}\n`);
});
child.once('error', error => {
  console.error(`Could not start npm ci: ${error.code ?? 'unknown error'}`);
  process.exitCode = 1;
});
child.once('close', (code, signal) => {
  if (signal) console.error(`npm ci terminated by ${signal}`);
  process.exitCode = code === null || code < 0 ? 1 : code;
});
