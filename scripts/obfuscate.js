/**
 * scripts/obfuscate.js  (CommonJS)
 *
 * Usage:
 *   1. npm install --save-dev javascript-obfuscator
 *   2. Run your normal build so that `dist/` exists (e.g. `npm run build`)
 *   3. node scripts/obfuscate.js
 *
 * Result:
 *   - Creates (or replaces) folder `dist-obf/` with obfuscated JS files
 *   - Copies non-JS assets (HTML, CSS, images) as-is
 *
 * Notes:
 *   - This script tries to avoid options that require 'unsafe-eval' in CSP.
 *   - Do NOT store secrets (API keys) in client-side files.
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC_DIR = path.resolve(process.cwd(), 'dist');
const OUT_DIR = path.resolve(process.cwd(), 'dist-obf');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function obfuscateJsFile(srcPath, outPath) {
  const code = fs.readFileSync(srcPath, 'utf8');

  const obfOptions = {
    compact: true,
    controlFlowFlattening: false,        // false = safer for perf; set true if you accept bigger bundle & CPU cost
    controlFlowFlatteningThreshold: 0.75,
    stringArray: true,
    stringArrayThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    rotateStringArray: true,
    transformObjectKeys: false,
    disableConsoleOutput: true,
    selfDefending: false,                // true increases size / fragility; set true only if needed
    // Avoid options that inject eval/new Function heavily to stay CSP friendly
  };

  const obfuscated = JavaScriptObfuscator.obfuscate(code, obfOptions).getObfuscatedCode();
  ensureDir(path.dirname(outPath));
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

  // Remove old output if exists
  if (fs.existsSync(OUT_DIR)) {
    try {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    } catch (err) {
      console.warn('Could not remove old dist-obf (try manual cleanup):', err.message);
    }
  }

  ensureDir(OUT_DIR);

  console.log('Obfuscating from', SRC_DIR, '->', OUT_DIR);
  try {
    processEntry(SRC_DIR);
    console.log('Done. Deploy', OUT_DIR, 'to Vercel or test locally.');
  } catch (err) {
    console.error('Error during obfuscation:', err);
    process.exit(1);
  }
}

main();
