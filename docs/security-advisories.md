# npm audit acceptance list

`npm audit` on this repo is not expected to be empty. The entries below are read, understood and accepted; anything not listed here is new and needs a decision. Re-check after every dependency change.

## Baseline command

```bash
npm audit --json | node -e 'const a=JSON.parse(require("fs").readFileSync(0));console.log(Object.keys(a.vulnerabilities).sort().join("\n"));console.log(a.metadata.vulnerabilities.total)'
```

Expected output as of 2026-10-11:

```text
@next/eslint-plugin-next
argparse
braces
eslint-config-next
fast-glob
globby
mammoth
markdownlint-cli2
micromatch
sprintf-js
10
```

## Accepted entries

| Advisory | Severity | Flagged packages | Why accepted | Clears when |
| --- | --- | --- | --- | --- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) braces, stack exhaustion on nested patterns | high | braces, micromatch, fast-glob, globby, @next/eslint-plugin-next, eslint-config-next, markdownlint-cli2 | braces 3.0.3 is the latest release, so no fixed version exists. npm's "fix" downgrades markdownlint-cli2 to 0.21.0. Dev-only glob tooling (lint config, markdown lint), never in the served bundle, never fed untrusted patterns | a braces release above 3.0.3 |
| [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) sprintf-js, unbounded precision | moderate | sprintf-js, argparse, mammoth | sprintf-js 1.1.3 is the latest release. `argparse` is required only by `node_modules/mammoth/bin/mammoth` (the CLI); `convertToHtml`, the only import (`src/common/attachment-drafts/file-converters/DocxToMarkdown.ts:1`), never reaches it. npm's "fix" downgrades mammoth to 0.3.29 | a sprintf-js release above 1.1.3 |

## Fixed by override

| Advisory | Fix |
| --- | --- |
| [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) katex `<0.18.2` | `overrides.katex` `^0.19.0` (commit 886844912); rehype-katex and micromark-extension-math still declare `^0.16` |
| [GHSA-r4xh-jqrq-34v2](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) smol-toml `<=1.8.0` | `overrides.smol-toml` `^1.9.0`; markdownlint-cli2 0.23.3 pins `1.8.0` |
| [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) deepmerge-ts `<8.0.0`, mysql2 `<=3.23.0` (two GHSAs), both under the Prisma 7 CLI | `overrides.deepmerge-ts` `^8`, `overrides.mysql2` `^3.23.1`; `prisma generate`, `db push` and the share round trip pass with them |

## Peer-range warnings

`npm ls eslint` reports `invalid` peers for eslint-plugin-import 2.32.0, eslint-plugin-jsx-a11y 6.10.2 and eslint-plugin-react 7.37.5 (each declares at most `eslint ^9`; eslint-config-next 16 pulls them). `npm install` prints three `ERESOLVE overriding peer dependency` warnings and exits 0; `npm run lint` runs clean on the rules Next enables. Accepted until those plugins publish ESLint 10 peers. Never install with `--legacy-peer-deps`.

## Node floor

`engines.node` is `^26.0.0 || ^24.0.0 || ^22.13.0`. The floor is set by puppeteer-core 25 (`>=22.12`, ESM-only) and rounded to the ESLint 10 line (`^22.13.0`) ahead of that upgrade; Prisma 7 (`^22.12`) landed; pdfjs-dist 6 (`>=22.13.0`) when it lands. Docker builds on `node:26-alpine`, CI reads `.nvmrc` (26).
