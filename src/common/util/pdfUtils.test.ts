/// <reference types="node" />

// The PDF worker is a copy of pdfjs-dist's build under public/workers/, loaded at runtime by URL. pdf.js refuses
// to run when the API and worker versions differ, and no type-check or build sees that: only this does.
// After bumping pdfjs-dist: cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/workers/

import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('public PDF worker matches the installed pdfjs-dist version', () => {
  const installed = JSON.parse(readFileSync('node_modules/pdfjs-dist/package.json', 'utf8')).version as string;
  const worker = readFileSync('public/workers/pdf.worker.min.mjs', 'utf8');
  // minified form of the worker's version check: `{docId:o,apiVersion:c}=e,l="5.4.54";if(c!==l)throw`
  const match = worker.match(/apiVersion:\w+\}=\w+,\w+="(\d+\.\d+\.\d+)";if\(/);
  assert.ok(match, 'worker file carries no API-version check');
  assert.equal(match[1], installed, 'worker version differs from the installed pdfjs-dist: recopy the worker');
});
