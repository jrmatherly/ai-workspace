# Authentication

Authentication is off by default. With no `AUTH_*` provider set, AI Workspace behaves as before authentication
existed: no sign-in screen, no redirects, Postgres optional.

Set one or more providers and the app requires sign-in: pages redirect to `/signin` (except `/news` and the shared
chat viewer `/link/chat/*`), and every server API call needs a session, except the capabilities probe, the identity
check (`backend.whoami`) and reading shared chat links.
Server-held vendor keys (env) become the shared keys of signed-in members; a member's own key, entered in the UI,
takes precedence for that member.

## Requirements

- Postgres, with both `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` set, and migrations applied
  (`npm run db:migrate`, see [Database](deploy-database.md)).
- `AUTH_SECRET`: 32 or more characters, e.g. `openssl rand -base64 32`.
- `AUTH_URL`: the public https origin users open, e.g. `https://ai.example.com`. Behind a gateway, the gateway host.

A half-set provider, a missing secret, URL or Postgres URL, an open provider without an allowlist, or an allowlist
entry that is neither an address nor an `@domain` fails the first request that loads the configuration (the
readiness probe) with a message naming the variable.

## Providers

Callback URL for each provider: `${AUTH_URL}/api/auth/callback/<id>`.

| Provider | Variables | Callback id | Access |
| --- | --- | --- | --- |
| Pocket ID or any OIDC IdP | `AUTH_OIDC_ISSUER`, `AUTH_OIDC_CLIENT_ID`, `AUTH_OIDC_CLIENT_SECRET`, optional `AUTH_OIDC_NAME` (button label, default "Pocket ID") | `oidc` | closed: the IdP's users |
| Google | `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET` | `google` | open: needs `AUTH_ALLOWED_EMAILS` |
| GitHub | `AUTH_GITHUB_CLIENT_ID`, `AUTH_GITHUB_CLIENT_SECRET` | `github` | open: needs `AUTH_ALLOWED_EMAILS` |
| Microsoft Entra ID | `AUTH_MICROSOFT_CLIENT_ID`, `AUTH_MICROSOFT_CLIENT_SECRET`, `AUTH_MICROSOFT_TENANT_ID` | `microsoft` | closed: one tenant |

- Pocket ID: also register `${AUTH_URL}/signin` as a logout callback URL. Sign-out ends the Pocket ID session too
  (RP-initiated logout) and returns to `/signin`.
- Microsoft: `AUTH_MICROSOFT_TENANT_ID` must be one concrete tenant id; `common`, `organizations` and `consumers`
  are rejected, because multi-tenant Entra emails are not verified.
- Google, GitHub and Microsoft sign out locally only.

Example, Pocket ID only:

```sh
AUTH_SECRET=...
AUTH_URL=https://ai.example.com
AUTH_OIDC_ISSUER=https://id.example.com
AUTH_OIDC_CLIENT_ID=...
AUTH_OIDC_CLIENT_SECRET=...
AUTH_ALLOWED_EMAILS=me@example.com
AUTH_ADMIN_EMAILS=me@example.com
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
```

## Who may sign in

- `AUTH_ALLOWED_EMAILS`: comma list of addresses and `@domains` (`me@example.com,@family.example`). A domain rule
  matches that domain only, not its subdomains. Required with Google or GitHub; recommended with Pocket ID too.
- Without it (closed providers only), the IdP's user list is the allowlist.
- Google and GitHub emails count only when the provider reports them verified. Pocket ID and pinned-tenant
  Microsoft emails are trusted as the IdP holds them.
- Removing an address from `AUTH_ALLOWED_EMAILS` takes effect on that user's next request: they are signed out.
- `AUTH_ADMIN_EMAILS`: comma list of addresses with the admin role (Ollama model pull and delete). Roles are
  derived on every request; there is no role column. Each entry must be an exact address (no `@domain`) that
  `AUTH_ALLOWED_EMAILS` admits; anything else fails at startup.
- Accounts with the same email link to one user when the existing account's email is verified and the new sign-in
  comes from Pocket ID or Microsoft (trusted providers), or from Google or GitHub with a verified email claim. A
  refused link shows "could not be linked" on the sign-in page; use the provider you signed up with.
- Because Pocket ID is trusted, a Pocket ID user who could change their own email to another member's address would
  be linked into that member's account. Turn off self-service email edits in Pocket ID (the "allow users to edit
  their own account details" setting) before letting members in.

## Sessions

- Sessions live in Postgres; the browser holds an httpOnly cookie. A session cache in the cookie means a revoked
  session can stay valid up to 5 minutes in a browser that already holds it.
- Removing a user in Pocket ID does not end their app session. Revoke it by removing the address from
  `AUTH_ALLOWED_EMAILS`, or by deleting their rows: `DELETE FROM session WHERE "userId" = '<id>';`.
- If Pocket ID is unreachable, its button shows an error and the other providers keep working. The server retries
  Pocket ID discovery at most once a minute, so sign-in resumes within a minute of Pocket ID coming back.

## What authentication does not govern

- Direct browser-to-vendor calls (Client-Side Fetch) never touch the server, so members holding their own keys
  use them as before.
- Members can point their own sessions at hosts the server can reach (Ollama, LocalAI, LM Studio, a Browse
  endpoint). Admit only people you trust with that network position.
- The static export (`AI_WORKSPACE_BUILD=static`) has no server, so it has no authentication.
- One browser profile is one person: local chats, keys and settings are not separated per user. A different
  account signing in on the same browser sees a warning first.
- `/api/auth/*` has Better Auth's default rate limit (production only, in memory, per instance); `/api/trpc` has none.

## Gateway authentication (Envoy OIDC)

Remove the gateway's OIDC SecurityPolicy from the app's route when app authentication is on: two logins stack, and
a lapsed gateway session answers API calls with a redirect a streaming request cannot follow. If the policy must
stay for a while, configure `denyRedirect` for `/api/*` so a lapsed gateway session returns 401 instead.

## Cloud platform authentication

Platform features still work in front of the app, alone or together with the above:

1. [CloudFlare Access / Zero Trust](https://www.cloudflare.com/zero-trust/products/access/)
2. [Vercel Authentication](https://vercel.com/docs/security/deployment-protection/methods-to-protect-deployments/vercel-authentication)
3. [Vercel Password Protection](https://vercel.com/docs/security/deployment-protection/methods-to-protect-deployments/password-protection)
