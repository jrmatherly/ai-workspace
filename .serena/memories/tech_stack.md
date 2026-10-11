# Tech stack and build

- Node: `.nvmrc` = 26; `engines` ^22||^24||^26; Dockerfile uses node:24-alpine. npm (package-lock), `allowScripts` allowlist in package.json.
- TypeScript ^6 strict, target es2022, `moduleResolution: Bundler`, `jsxImportSource @emotion/react`, `checkJs`. Path aliases `~/common/*`, `~/modules/*`, `~/server/*`, `~/extensions/*` -> `src/`.
- Two tsc projects: root (excludes tests and `tools/`) and `tools/tsconfig.json` (tools + `src/**/*.test.ts`; `.mjs` only type-checked with a leading `// @ts-check`).
- ESLint 9 flat config `eslint.config.mjs`, run as `eslint .` (not `next lint`). Ignores `.claude`, `public`, `tools/video`. `compat/compat` reads `browserslist` (Chrome 110 floor). ES2023 `toSorted/toReversed/toSpliced/with` and `Intl.Segmenter` are `no-restricted-syntax` **warnings** (CLAUDE.md calls it a hard ban). Typed-lint block on `src/**/*.ts(x)` (~15s).
- Prettier config exists (`singleQuote`, printWidth 160) but no script; not enforced.
- Tests: node:test via `tsx`, only `src/modules/llms/server/listModels.test.ts`; live vendor lanes skip without `<VENDOR>_API_KEY` env vars. `.env.api-keys` (CLAUDE.md) is absent.
- Generated-but-committed: `src/modules/llms/server/gen/llms.defs.versions.ts` (by `tools/develop/gen-llms-defs/generate-llms-defs.mjs`, runs in `predev`/`prebuild`; `--check` exits 2 if stale). Never hand-edit. Generated-and-ignored: `public/.well-known/appspecific/com.chrome.devtools.json`, `public/sw.js*`.
- `next.config.ts`: throws "missing build identity" without a git SHA or `NEXT_PUBLIC_BUILD_HASH`; `BIG_AGI_BUILD=standalone|static`; `NO_LINT_BUILD`; validates `src/server/env.server.ts` (t3-env + zod) at config load; PostHog rewrites under `/a/ph`.
- `middleware_BASIC_AUTH.ts` is inert until renamed to `middleware.ts`.
- Deploy surfaces: Vercel, Docker (multi-stage, non-root), k8s manifests in `docs/k8s`, Cloudflare doc is unlisted/unsupported. `docker-compose.yaml` pulls `ghcr.io/jrmatherly/ai-workspace:latest`, not a local build.
