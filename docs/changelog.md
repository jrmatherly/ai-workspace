# Changelog

AI Workspace started from the big-AGI 2.1.1 codebase on 2026-10-10; earlier history is upstream's and is not carried here. Releases are tracked on GitHub Releases: <https://github.com/jrmatherly/ai-workspace/releases>

## 2026.10.11.1

- Authentication (optional): Pocket ID or any OIDC provider, Google, GitHub and Microsoft Entra ID through Better Auth, with an email allowlist, an admin list, a sign-in page and fail-closed API guards (`docs/deploy-authentication.md`)
- Postgres schema ships as committed Prisma migrations; the app image runs `prisma migrate deploy` for the release Job (`docs/deploy-database.md`)
- Next 16.4 on the Node runtime with one tRPC router at `/api/trpc`, React 19.3, Prisma 7.10, ESLint 10, TypeScript 7, pdf.js 6.4 with self-hosted assets, Tesseract OCR assets self-hosted
- Browser floor raised to Chrome 125, Edge 125, Firefox 128, Safari 18 and iOS 18
- Kubernetes manifest: readiness and liveness probes, resource requests

## 2026.10.11

- Versioning is CalVer `YYYY.M.D[.MICRO]` (unpadded, semver-valid); release tags are `vYYYY.M.D`
- New logo: Core A mark with a teal accent, three marks and four accents behind a registry for a future theme chooser
- Storage, format and operator-facing names use the new name (`AI-Workspace` IndexedDB and backup tag, `aiw-*` store keys, `.aiw.json`, `AI_WORKSPACE_BUILD`)
- Node 26 image; vendor API spec snapshots refreshed; `.env.example` added

## 2.1.1 (2026-10-10)

- Re-pointed all URLs, images, the container image and metadata to this repository
- Product renamed to AI Workspace
- `upstream-review` workflow for adopting upstream changes
- GitHub workflows restored: CI, container images, Dependabot
- PostHog host configurable (`NEXT_PUBLIC_POSTHOG_HOST`)
- ES2023 browser-floor lint promoted to error
