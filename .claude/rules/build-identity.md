---
paths:
  - "next.config.ts"
  - "Dockerfile"
  - ".dockerignore"
  - ".github/workflows/**"
---

# Build identity

`next.config.ts` requires a build hash at config-load time, from `NEXT_PUBLIC_BUILD_HASH`, `GITHUB_SHA`, `VERCEL_GIT_COMMIT_SHA`, `git rev-parse`, or a raw read of `.git/HEAD`, `refs` and `packed-refs`. Without one it throws "missing build identity".

- A checkout without `.git` (tarball, shallow export) must set `NEXT_PUBLIC_BUILD_HASH`.
- `.dockerignore` deliberately admits `.git/HEAD`, `.git/refs` and `.git/packed-refs`; keep them when editing it.
- The same file validates `src/server/env.server.ts` at load, so a bad env var fails `next dev` and `next build` before compilation.
