# Authentication

Off unless an `AUTH_*` provider is fully set (`src/server/auth/auth.config.ts`, `authConfig === null`). Operator
guide: `docs/deploy-authentication.md`. Design record: `docs/superpowers/specs/2026-10-11-auth-design/design.md`.

## Caller model

`AuthCaller` (`src/server/auth/auth.server.ts`) is one of:

- `off`: no provider configured; guards pass everything.
- `anonymous`: no valid session.
- `not_allowed`: valid session, address since removed from `AUTH_ALLOWED_EMAILS`.
- `user`: `AuthUser { id, email, name, image, role }`. `id` is Better Auth's `User.id`, the key future per-user
  tables reference. `role` is derived per request from `AUTH_ADMIN_EMAILS`.

`createTRPCFetchContext` puts a memoised `caller()` and `resHeaders` on the context. Guards await it; anonymous
procedures never do (except `whoami`). Infrastructure failures become a detail-free `INTERNAL_SERVER_ERROR`.

## Procedure aliases

| Alias | Auth on | Auth off |
| --- | --- | --- |
| `publicProcedure`, `authedProcedure`, `premiumProcedure`, `authGatedProcedure` | member, else `UNAUTHORIZED` | pass, `ctx.user = null` |
| `tenantAdminProcedure` | admin, else `FORBIDDEN` (`UNAUTHORIZED` without a session) | pass |
| `anonymousProcedure` | pass | pass |

`ANONYMOUS_PROCEDURES`: `backend.listCapabilities` (probe and boot gate), `backend.whoami`, `trade.storageGet`
(share recipients). `src/server/trpc/trpc.access.test.ts` walks every mounted procedure with forged callers.

## Server key resolution

1. The guard rejects callers without a session before any resolver runs.
2. The client-sent `access.<key>` (the member's own key) wins.
3. Otherwise the env key (the shared key), host-bound by `llmsServerKeyForHost`.

## Provider trust

| Provider | Access | Email trust |
| --- | --- | --- |
| `oidc` (Pocket ID) | closed | IdP |
| `microsoft` (one tenant) | closed | IdP |
| `google`, `github` | open, allowlist required | verified claim only |

`isEmailAllowed` gates sign-in (`validateUserInfo`); `isEmailListed` re-checks on every request. OAuth access and refresh
tokens are encrypted at rest (`encryptOAuthTokens`); the ID token is stored as is because RP-initiated logout sends it as
`id_token_hint`. Trusted providers (Pocket ID, pinned-tenant Microsoft) link into a same-email user without a verified
claim, so the Pocket ID deployment disables self-service email edits (`docs/deploy-authentication.md`).

## Client

- `useAuthUser()` (`src/common/auth/auth.client.ts`): `off | loading | error | anonymous | not_allowed | user`.
- `getAuthProviders()` (`src/common/app.serverconf.ts`): from `BackendCapabilities.authProviders`; empty = off.
- `proxy.ts`: optimistic cookie check on page routes and `/dev/*`; public pages from `src/common/app.routes.auth.ts`.
- `ProviderAuthGate`: blocks the app until identity is known, redirects anonymous visitors, runs the account-switch
  prompt and PostHog identify.
- The tRPC `unauthorizedRedirectLink` sends a mid-session 401 to `/signin?next=`.

## Planned continuation

Per-user Postgres data hangs off `User.id` inside `publicProcedure` resolvers; `LinkStorage` gains a nullable
`userId`; client stores move by swapping their `persist` storage adapter; roles move to a `User.role` column with
`AUTH_ADMIN_EMAILS` as the bootstrap.
