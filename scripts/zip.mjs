import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const releaseDir = join(root, 'release');
const target = join(releaseDir, 'gpt-exporter.zip');

if (!existsSync(dist)) {
  console.error('dist/ not found, run `npm run build` first');
  process.exit(1);
}
mkdirSync(releaseDir, { recursive: true });

if (process.platform === 'win32') {
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path '${dist}\\*' -DestinationPath '${target}' -Force`,
    ],
    { stdio: 'inherit' },
  );
} else {
  execFileSync('zip', ['-qr', target, '.'], { cwd: dist, stdio: 'inherit' });
}
console.log(`release ready: ${target}`);
