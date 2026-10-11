#!/usr/bin/env node
// @ts-check
/**
 * Copies the pdf.js runtime files the browser fetches by URL from the installed pdfjs-dist into public/:
 * the worker, and the on-demand assets (CMaps for non-embedded CJK fonts, the standard 14 fonts, the
 * wasm image decoders and ICC profiles). Runs from prebuild, predev and pretest; the outputs are gitignored
 * so they always match package-lock.json. pdfUtils.ts sets the worker and asset URLs.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const pkg = resolve(root, 'node_modules/pdfjs-dist');
const version = JSON.parse(readFileSync(resolve(pkg, 'package.json'), 'utf8')).version;

const copies = [
  ['build/pdf.worker.min.mjs', 'public/workers/pdf.worker.min.mjs'],
  ['cmaps', 'public/pdfjs/cmaps'],
  ['standard_fonts', 'public/pdfjs/standard_fonts'],
  ['wasm', 'public/pdfjs/wasm'],
  ['iccs', 'public/pdfjs/iccs'],
];
const stamp = resolve(root, 'public/pdfjs/.version');

if (existsSync(stamp) && readFileSync(stamp, 'utf8') === version && copies.every(([, to]) => existsSync(resolve(root, to)))) {
  console.log(`pdfjs-assets: public/ already carries pdfjs-dist ${version}`);
  process.exit(0);
}

rmSync(resolve(root, 'public/pdfjs'), { recursive: true, force: true });
for (const [from, to] of copies) {
  const dest = resolve(root, to);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(resolve(pkg, from), dest, { recursive: true });
}
writeFileSync(stamp, version);
console.log(`pdfjs-assets: copied pdfjs-dist ${version} worker and assets into public/`);
