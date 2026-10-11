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

## pdf.js worker

**Location:** `public/workers/pdf.worker.min.mjs` (the prebuilt worker from the `pdfjs-dist` package, served as a static file)

**Original Repository:** [mozilla/pdf.js](https://github.com/mozilla/pdf.js)

**License:** [Apache-2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE), Copyright 2024 Mozilla Foundation. The full license text is in the file header.

The copy must match the installed `pdfjs-dist` version (5.4.624 today); `src/common/util/pdfUtils.test.ts` checks it. After a bump, copy `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/workers/`.

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
