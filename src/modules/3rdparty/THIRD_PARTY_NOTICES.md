# Third-Party Notices

This project includes third-party software components that are subject to separate license terms. The components and their licenses are listed below.

---

## t3-env

**Locations:**

- `src/modules/3rdparty/t3-env/index.ts`
- `src/modules/3rdparty/t3-env/env-core.ts`
- `src/modules/3rdparty/t3-env/standard.ts`

**Original Repository:** [t3-oss/t3-env](https://github.com/t3-oss/t3-env/tree/main)

**License:** [MIT](https://github.com/t3-oss/t3-env/blob/main/LICENSE), Copyright (c) 2026 Julius Marminge

### Description

The folder contains source code from the @t3-oss/t3-env package, a library for managing environment variables.
The original code includes:

- Presets for various environments (which we didn't use)
- Support for standard schema parsers (we only use Zod)

### Purpose

- Fewer runtime dependencies

### Source Files

- [index.ts](https://github.com/t3-oss/t3-env/blob/main/packages/nextjs/src/index.ts) (commit b13d46b)
- [env-core.ts](https://github.com/t3-oss/t3-env/blob/main/packages/core/src/index.ts) (commit b13d46b)
- [standard.ts](https://github.com/t3-oss/t3-env/blob/main/packages/core/src/standard.ts) (commit eb37304)

**Note:** Each component keeps its original license and copyright; the full texts are at the linked locations.
Users are advised to review the license terms of the original repository.

---

## pdf.js worker and assets

**Location:** `public/workers/pdf.worker.min.mjs` and `public/pdfjs/{cmaps,standard_fonts,wasm,iccs}`, copied from the installed `pdfjs-dist` by `tools/develop/browser-assets/copy-browser-assets.mjs` (prebuild, predev, pretest) and gitignored. The browser fetches them by URL; `src/common/util/pdfUtils.ts` sets the URLs and `src/common/util/pdfUtils.test.ts` checks the worker version and that CMaps and the wasm decoders serve.

**Original Repository:** [mozilla/pdf.js](https://github.com/mozilla/pdf.js)

**License:** [Apache-2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE), Copyright Mozilla Foundation, for the worker and the pdf.js glue. The asset directories carry their own license files, copied with them:

- `cmaps/`: Adobe CMap resources, BSD-style, Copyright 1990-2009 Adobe Systems Incorporated (`cmaps/LICENSE`)
- `standard_fonts/`: Foxit Type 1 fonts, BSD-3-Clause, Copyright 2014 PDFium Authors (`LICENSE_FOXIT`); Liberation fonts, GPL-2.0 with the font-embedding exception, Copyright 2007-2011 Red Hat (`LICENSE_LIBERATION`)
- `wasm/`: OpenJPEG, BSD-2-Clause (`LICENSE_OPENJPEG`) with pdf.js's wrapper under BSD-2-Clause (`LICENSE_PDFJS_OPENJPEG`); the PDFium JBIG2 decoder, BSD-3-Clause, Copyright 2014 The PDFium Authors (`LICENSE_JBIG2`) with pdf.js's wrapper under Apache-2.0 (`LICENSE_PDFJS_JBIG2`); qcms, MIT, Copyright Mozilla Corporation and Marti Maria (`LICENSE_QCMS`) with pdf.js's wrapper under MIT (`LICENSE_PDFJS_QCMS`); `quickjs-eval.*` is pdf.js's QuickJS build for PDF scripting, shipped without a license file in pdfjs-dist (QuickJS itself is MIT)
- `iccs/`: the CGATS001 compatibility ICC profile, CC0 1.0 (`iccs/LICENSE`)

## Tesseract OCR runtime

**Location:** `public/tesseract/{worker.min.js,core/,lang/}`, copied from the installed `tesseract.js`, `tesseract.js-core` and `@tesseract.js-data/eng` by `tools/develop/browser-assets/copy-browser-assets.mjs` (prebuild, predev, pretest) and gitignored. `src/common/util/ocrUtils.ts` sets the URLs; unset, tesseract.js would fetch the same files from the jsDelivr CDN. `src/common/util/ocrUtils.test.ts` checks they are present.

**Original Repositories:** [naptha/tesseract.js](https://github.com/naptha/tesseract.js), [naptha/tesseract.js-core](https://github.com/naptha/tesseract.js-core), [naptha/tessdata](https://github.com/naptha/tessdata)

**License:** Apache-2.0 for `tesseract.js` and `tesseract.js-core` (their `LICENSE` files); `@tesseract.js-data/eng` declares MIT in its package manifest and ships the `eng.traineddata` model (tessdata_best, Apache-2.0 upstream) without a license file.

Test fixtures in `src/common/util/pdfUtils.test-fixtures/`: `jpx_smaskindata.pdf` is from the pdf.js test corpus (`test/pdfs/`, Apache-2.0); `cjk-nonembedded.pdf` was written for this repo.

---

## prismjs line-numbers plugin

**Location:** `src/modules/blocks/code/RenderCode.css` (styles adapted from `prismjs/plugins/line-numbers/prism-line-numbers.css`)

**Original Repository:** [PrismJS/prism](https://github.com/PrismJS/prism)

**License:** [MIT](https://github.com/PrismJS/prism/blob/master/LICENSE), Copyright (c) 2012 Lea Verou

---

## Prism default theme

**Location:** `src/common/styles/CodePrism.css` (the Prism default theme, `themes/prism.css`)

**Original Repository:** [PrismJS/prism](https://github.com/PrismJS/prism)

**License:** [MIT](https://github.com/PrismJS/prism/blob/master/LICENSE), Copyright (c) 2012 Lea Verou

---

## github-markdown-css

**Location:** `src/common/styles/GithubMarkdown.css` (forked to switch light/dark by `[data-joy-color-scheme]` instead of a media query)

**Original Repository:** [sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css)

**License:** [MIT](https://github.com/sindresorhus/github-markdown-css/blob/main/license), Copyright (c) Sindre Sorhus

---

## nprogress

**Location:** `src/common/styles/NProgress.css` (customized copy of the nprogress stylesheet; `nprogress` is also an npm dependency)

**Original Repository:** [rstacruz/nprogress](https://github.com/rstacruz/nprogress)

**License:** [MIT](https://github.com/rstacruz/nprogress/blob/master/License.md), Copyright (c) 2013-2014 Rico Sta. Cruz
