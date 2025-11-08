// scripts/clean.cjs
const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'build');

try {
  fs.rmSync(target, { recursive: true, force: true });
  console.log('[clean] Carpeta "build" eliminada (si existía).');
} catch (err) {
  console.error('[clean] Error eliminando "build":', err.message);
  process.exitCode = 1;
}
