# npm audit acceptance list

`npm audit` on this repo is not expected to be empty. The entries below are read, understood and accepted; anything not listed here is new and needs a decision. Re-check after every dependency change.

## Baseline command

```bash
npm audit --json | node -e 'const a=JSON.parse(require("fs").readFileSync(0));console.log(Object.keys(a.vulnerabilities).sort().join("\n"));console.log(a.metadata.vulnerabilities.total)'
```

Expected output as of 2026-10-11:

```text
@next/eslint-plugin-next
braces
eslint-config-next
fast-glob
globby
markdownlint-cli2
micromatch
7
```

## Accepted entries

| Advisory | Severity | Flagged packages | Why accepted | Clears when |
| --- | --- | --- | --- | --- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) braces, stack exhaustion on nested patterns | high | braces, micromatch, fast-glob, globby, @next/eslint-plugin-next, eslint-config-next, markdownlint-cli2 | braces 3.0.3 is the latest release, so no fixed version exists. npm's "fix" downgrades markdownlint-cli2 to 0.21.0. Dev-only glob tooling (lint config, markdown lint), never in the served bundle, never fed untrusted patterns | a braces release above 3.0.3 |

## Fixed by override

| Advisory | Fix |
| --- | --- |
| [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) katex `<0.18.2` | `overrides.katex` `^0.19.0` (commit 886844912); rehype-katex and micromark-extension-math still declare `^0.16` |
| [GHSA-r4xh-jqrq-34v2](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) smol-toml `<=1.8.0` | `overrides.smol-toml` `^1.9.0`; markdownlint-cli2 0.23.3 pins `1.8.0` |
| [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) deepmerge-ts `<8.0.0`, mysql2 `<=3.23.0` (two GHSAs), both under the Prisma 7 CLI | `overrides.deepmerge-ts` `^8`, `overrides.mysql2` `^3.23.1`; `prisma generate`, `db push` and the share round trip pass with them |
| [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) sprintf-js, unbounded precision, under mammoth's `argparse ~1.0.3` | `overrides.mammoth.argparse` `^2.0.1`, scoped so markdown-it keeps argparse 3; argparse is required only by `node_modules/mammoth/bin/mammoth` (the CLI), and `require("mammoth")` loads with it |

## Peer-range warnings

eslint-plugin-import 2.32.0, eslint-plugin-jsx-a11y 6.10.2 and eslint-plugin-react 7.37.5 declare at most `eslint ^9`; eslint-config-next 16.4.0 still pulls them (ESLint 10 support: jsx-a11y PR 1081 open, react issue 4027 open, import issue 3278 open as of 2026-10-11). `package.json` `overrides` rewrites each plugin's `eslint` peer edge to `$eslint`, the root version, so `npm install` prints no `ERESOLVE` warning and `npm ls eslint` reports no `invalid` peer. The 24 rules Next enables from those plugins lint clean on ESLint 10. Remove the three overrides once the plugins publish `^10` peers. Never install with `--legacy-peer-deps`.

## Build warnings

`npm install` prints `install-scripts` warnings only when a package with a postinstall script is not in `package.json` `allowScripts`. Bump the pinned version there after upgrades.

## Node floor

`engines.node` is `^26.0.0 || ^24.0.0 || ^22.13.0`. The floor is set by puppeteer-core 25 (`>=22.12`, ESM-only) and rounded to the ESLint 10 line (`^22.13.0`) ahead of that upgrade; Prisma 7 (`^22.12`) landed; pdfjs-dist 6 (`>=22.13.0`) when it lands. Docker builds on `node:26-alpine`, CI reads `.nvmrc` (26).

## npm outdated residue

`npm outdated` on 2026-10-11, after the Next 16.4.0 bump. The `min-release-age` hold is removed from `~/.npmrc` as of 2026-10-11, so `Latest` is the registry `latest` tag:

| Package | Current | Latest | Why it stays |
| --- | --- | --- | --- |
| @mui/icons-material | 7.3.11 | 9.5.0 | 9.x re-exports `createSvgIcon` from `@mui/material/SvgIcon`, which the webpack alias maps to `@mui/joy/SvgIcon`, a file without it. Blocked until the alias can supply it |
| pdfjs-dist | 5.4.624 | 6.4.299 | 5.4.624 is the last build before 5.5 raised the Chrome minimum to 118 (pdf.js PR 20645); 6.0 requires `AbortSignal.any()`, `:dir()`, `light-dark()` and CSS nesting natively (Chrome 125, Safari 18). Gated on raising the browser floor from Chrome 110 / Safari 16.4. Note the modern build we import already calls `AbortSignal.any()` and `Promise.withResolvers()` at 5.4.x, so the stated floors are pdf.js's legacy-build numbers, not a measured floor for ours |
| prisma | 7.10.0 | 8.0.0-rc.22 | `latest` points at an 8.0 release candidate. `@prisma/client` and `@prisma/adapter-pg` stay on 7.10.0 with it; Dependabot ignores majors |

Not listed by `npm outdated` but deliberately held: `typescript` as the `@typescript/typescript6` alias (6.0.2 is its only release; `tsc` is 7.0.2 from `@typescript/native`).
