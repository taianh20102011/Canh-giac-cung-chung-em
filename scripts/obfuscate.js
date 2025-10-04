/**
 * scripts/obfuscate.js
 * Usage: node scripts/obfuscate.js
 * This script recursively obfuscates .js files under the `dist` folder
 * and writes output to `dist-obf`.
 *
 * IMPORTANT:
 * - Make sure you already ran your normal build (e.g. `npm run build`) which outputs to `dist/`.
 * - This script will copy non-js files (html, css, images) as-is.
 */

import fs from 'fs';
import path from 'path';
import { obfuscate } from 'javascript-obfuscator';

const SRC_DIR = path.resolve(process.cwd(), 'dist');
const OUT_DIR = path.resolve(process.cwd(), 'dist-obf');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function obfuscateJsFile(srcPath, outPath) {
  const code = fs.readFileSync(srcPath, 'utf8');

  // Obfuscator options: balanced for security vs performance & CSP compatibility.
  const obfOptions = {
    compact: true,
    controlFlowFlattening: false,        // set true only if you accept larger bundle and CPU cost
    controlFlowFlatteningThreshold: 0.75,
    stringArray: true,
    stringArrayThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    rotateStringArray: true,
    transformObjectKeys: false,
    disableConsoleOutput: true,
    selfDefending: false,                // true can break some environments and increase size
    // Avoid settings that commonly require unsafe-eval in CSP.
    // Keep evalUsage minimal to not require 'unsafe-eval' in CSP.
  };

  const obfuscated = obfuscate(code, obfOptions).getObfuscatedCode();
  fs.writeFileSync(outPath, obfuscated, 'utf8');
  console.log('[obf] ', path.relative(process.cwd(), outPath));
}

function copyFile(srcPath, outPath) {
  ensureDir(path.dirname(outPath));
  fs.copyFileSync(srcPath, outPath);
  console.log('[copy]', path.relative(process.cwd(), outPath));
}

function processEntry(srcRoot, relPath = '') {
  const fullPath = path.join(srcRoot, relPath);
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    const items = fs.readdirSync(fullPath);
    for (const it of items) processEntry(srcRoot, path.join(relPath, it));
  } else {
    const ext = path.extname(fullPath).toLowerCase();
    const outPath = path.join(OUT_DIR, relPath);
    ensureDir(path.dirname(outPath));
    if (ext === '.js') {
      obfuscateJsFile(fullPath, outPath);
    } else {
      copyFile(fullPath, outPath);
    }
  }
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Source build folder not found: ${SRC_DIR}`);
    console.error('Run your build first (e.g. npm run build) so that "dist/" exists.');
    process.exit(2);
  }
  // Clean outDir
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  ensureDir(OUT_DIR);

  console.log('Obfuscating from', SRC_DIR, '->', OUT_DIR);
  processEntry(SRC_DIR);
  console.log('Done. Deploy', OUT_DIR, 'to Vercel or test locally.');
}

main();
