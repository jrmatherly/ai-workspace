# Changelog

AI Workspace started from the big-AGI 2.1.1 codebase on 2026-10-10; earlier history is upstream's and is not carried here. Releases are tracked on GitHub Releases: <https://github.com/jrmatherly/ai-workspace/releases>

## 2026.10.12.2

- Auto-diagrams and generative UIs hold the model to the rating bar the prompt states (4 for diagrams, 3 for UIs); a call rated below it is no suggestion, the same as no call
- LocalAI: the model listing reads the context window from the server's model config route, splits it across the parallel slots (65536 with parallel:4 is a 16384 window) and declares half of it as the output limit, so a chat gets an 8192-token budget without touching the model options

## 2026.10.12.1

- Auto-diagrams and generative UIs: a Code model that declines in prose, as qwen3-4b does for the UI prompt, now yields no suggestion instead of a red "Missing function invocation" line; a reply cut off by the token cap still shows as a failure

## 2026.10.12

- LocalAI behind llama-server: auto-diagrams and generative UIs no longer fail with "Missing function invocation"; forced tool calls go out as `tool_choice: auto` with a system hint, since llama-server ignores `required`, and a call preceded by prose is accepted

## 2026.10.11.2

- Client Logs capture AI failures, failed server calls and sign-in or sign-out failures
- LocalAI behind llama-server: the per-slot context becomes the model's window, and tool calling follows the loaded chat template, so auto-diagrams and generative UIs skip models that cannot call tools
- LocalAI voice synthesis honours the server-side `LOCALAI_API_HOST` and key
- Beam explainer illustrations redrawn in the logo system
- Browsing docs: browserless v2 with a token; the `/browse` command was retired earlier
- Release images also get the bare version tag (`2026.10.11.2`)

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
