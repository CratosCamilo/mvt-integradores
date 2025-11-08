// scripts/copy-assets.cjs
const fs = require('fs');
const path = require('path');

const fromTo = [
  { src: path.join('src', 'template'), dest: path.join('build', 'template') },
  { src: path.join('src', 'public'),   dest: path.join('build', 'public')   },
];

for (const { src, dest } of fromTo) {
  const absSrc = path.join(process.cwd(), src);
  const absDest = path.join(process.cwd(), dest);

  if (!fs.existsSync(absSrc)) {
    console.log(`[copy-assets] Skipping (no existe): ${src}`);
    continue;
  }

  // Asegura la carpeta destino
  fs.mkdirSync(absDest, { recursive: true });

  // Node 16+ tiene fs.cpSync
  fs.cpSync(absSrc, absDest, { recursive: true });
  console.log(`[copy-assets] Copiado: ${src} -> ${dest}`);
}
