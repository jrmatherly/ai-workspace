#!/usr/bin/env node
// @ts-check
/**
 * Copies the browser-fetched runtime files of pdf.js and Tesseract from node_modules into public/, so the app
 * serves them itself instead of a CDN. Runs from prebuild, predev and pretest; the outputs are gitignored and
 * stamped with the package versions, so they always match package-lock.json. pdfUtils.ts and ocrUtils.ts set
 * the URLs.
 *
 * pdf.js: the worker, and the on-demand assets (CMaps for non-embedded CJK fonts, the standard 14 fonts, the
 * wasm image decoders and ICC profiles). Tesseract: the worker, the three LSTM wasm cores tesseract.js picks
 * from by SIMD support, and the English model.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const nm = resolve(root, 'node_modules');
/** @param {string} pkg */
const versionOf = (pkg) => JSON.parse(readFileSync(resolve(nm, pkg, 'package.json'), 'utf8')).version;

const groups = [
  {
    name: 'pdfjs',
    version: `pdfjs-dist ${versionOf('pdfjs-dist')}`,
    stamp: 'public/pdfjs/.version',
    clear: ['public/pdfjs', 'public/workers/pdf.worker.min.mjs'],
    copies: [
      ['pdfjs-dist/build/pdf.worker.min.mjs', 'public/workers/pdf.worker.min.mjs'],
      ['pdfjs-dist/cmaps', 'public/pdfjs/cmaps'],
      ['pdfjs-dist/standard_fonts', 'public/pdfjs/standard_fonts'],
      ['pdfjs-dist/wasm', 'public/pdfjs/wasm'],
      ['pdfjs-dist/iccs', 'public/pdfjs/iccs'],
    ],
  },
  {
    name: 'tesseract',
    version: `tesseract.js ${versionOf('tesseract.js')}, core ${versionOf('tesseract.js-core')}, eng ${versionOf('@tesseract.js-data/eng')}`,
    stamp: 'public/tesseract/.version',
    clear: ['public/tesseract'],
    copies: [
      ['tesseract.js/dist/worker.min.js', 'public/tesseract/worker.min.js'],
      ['tesseract.js/dist/worker.min.js.map', 'public/tesseract/worker.min.js.map'],
      ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'public/tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js'],
      ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'public/tesseract/core/tesseract-core-simd-lstm.wasm.js'],
      ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'public/tesseract/core/tesseract-core-lstm.wasm.js'],
      ['@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'public/tesseract/lang/eng.traineddata.gz'],
    ],
  },
];

for (const group of groups) {
  const stamp = resolve(root, group.stamp);
  const current = existsSync(stamp) && readFileSync(stamp, 'utf8') === group.version && group.copies.every(([, to]) => existsSync(resolve(root, to)));
  if (current) {
    console.log(`browser-assets: public/ already carries ${group.version}`);
    continue;
  }
  for (const dir of group.clear) rmSync(resolve(root, dir), { recursive: true, force: true });
  for (const [from, to] of group.copies) {
    const dest = resolve(root, to);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(resolve(nm, from), dest, { recursive: true });
  }
  writeFileSync(stamp, group.version);
  console.log(`browser-assets: copied ${group.version} into public/`);
}
