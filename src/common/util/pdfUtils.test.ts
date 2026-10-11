/// <reference types="node" />

// pdf.js fetches its worker and on-demand assets by URL from public/, where tools/develop/pdfjs-assets copies
// them from the installed pdfjs-dist (pretest runs it). pdf.js refuses to run when the API and worker versions
// differ, and silently degrades when the asset URLs are wrong: no type-check or build sees either, only this.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { PDFJS_ASSET_OPTIONS } from './pdfUtils';

const root = resolve(import.meta.dirname, '../../..');
const fixtures = resolve(root, 'src/common/util/pdfUtils.test-fixtures');

// the URL paths pdfUtils hands the browser, as filesystem paths pdf.js's Node build reads the same way
const assetPaths = Object.fromEntries(Object.entries(PDFJS_ASSET_OPTIONS).map(([k, url]) => [k, resolve(root, 'public', '.' + url) + '/']));

/** Runs fn with console.warn captured; pdf.js reports asset failures as warnings, not rejections. */
async function withWarnings<T>(warnings: string[], fn: () => Promise<T>): Promise<T> {
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(' '));
  try {
    return await fn();
  } finally {
    console.warn = origWarn;
  }
}

async function openFixture(name: string) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(readFileSync(resolve(fixtures, name)));
  return await pdfjs.getDocument({ data, verbosity: 1, ...assetPaths }).promise;
}

test('public PDF worker matches the installed pdfjs-dist version', () => {
  const installed = JSON.parse(readFileSync(resolve(root, 'node_modules/pdfjs-dist/package.json'), 'utf8')).version as string;
  const worker = readFileSync(resolve(root, 'public/workers/pdf.worker.min.mjs'), 'utf8');
  // minified form of the worker's version check: `{docId:i,apiVersion:o}=e,l="6.4.299";if(o!==l)throw`
  const match = worker.match(/apiVersion:\w+\}=\w+,\w+="(\d+\.\d+\.\d+)";if\(/);
  assert.ok(match, 'worker file carries no API-version check');
  assert.equal(match[1], installed, 'worker version differs from the installed pdfjs-dist: rerun tools/develop/pdfjs-assets');
});

test('non-embedded CJK font extracts text through the served CMaps', async () => {
  const warnings: string[] = [];
  const text = await withWarnings(warnings, async () => {
    const page = await (await openFixture('cjk-nonembedded.pdf')).getPage(1);
    return (await page.getTextContent()).items.map(item => 'str' in item ? item.str : '').join('');
  });
  assert.equal(text, '中文测试', `warnings: ${warnings.join(' | ')}`);
});

test('JPX image decodes through the served OpenJPEG wasm', async () => {
  const warnings: string[] = [];
  await withWarnings(warnings, async () => {
    const page = await (await openFixture('jpx_smaskindata.pdf')).getPage(1);
    await page.getOperatorList();
  });
  assert.deepEqual(warnings.filter(w => /Unable to decode image|wasmUrl/.test(w)), []);
});
