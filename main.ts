import { buildDossier } from './vendor/makefun-threejs.ts';
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Dustline main build script
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

console.log(`Building dossier into ${outputDir}...`);

mkdirSync(outputDir, { recursive: true });

// Copy game/ and screenshots/
cpSync('game', join(outputDir, 'game'), { recursive: true, force: true });
if (existsSync('screenshots')) {
  cpSync('screenshots', join(outputDir, 'screenshots'), { recursive: true, force: true });
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

// Build dossier
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
console.log('Successfully wrote dossier.json');

