/// <reference types="node" />

// tesseract.js loads its worker, wasm core and language data by URL from public/, where
// tools/develop/browser-assets copies them (pretest runs it); unset, it would fetch them from jsDelivr.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TESSERACT_ASSET_OPTIONS } from './ocrUtils';

const root = resolve(import.meta.dirname, '../../..');
const publicDir = resolve(root, 'public');
const versionOf = (pkg: string) => JSON.parse(readFileSync(resolve(root, 'node_modules', pkg, 'package.json'), 'utf8')).version as string;

test('Tesseract worker, LSTM cores and English model are served from public/', () => {
  const { workerPath, corePath, langPath } = TESSERACT_ASSET_OPTIONS;
  const files = [
    workerPath,
    ...['relaxedsimd-lstm', 'simd-lstm', 'lstm'].map(variant => `${corePath}tesseract-core-${variant}.wasm.js`),
    `${langPath}/eng.traineddata.gz`,
  ];
  for (const url of files)
    assert.ok(existsSync(resolve(publicDir, '.' + url)), `missing ${url}: rerun tools/develop/browser-assets`);
  // the copy script's stamp, built from the same three package versions
  const expected = `tesseract.js ${versionOf('tesseract.js')}, core ${versionOf('tesseract.js-core')}, eng ${versionOf('@tesseract.js-data/eng')}`;
  assert.equal(readFileSync(resolve(publicDir, 'tesseract/.version'), 'utf8'), expected, 'served Tesseract files are from other versions: rerun tools/develop/browser-assets');
});
