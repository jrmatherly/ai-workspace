**Connecting Your Database for Enhanced Features:**

This guide outlines the database setup for enabling features like Chat Link Sharing in your application.

### Database

**Serverless Postgres:**

- Available on Vercel, Neon, and other platforms. Tested on Postgres 18.
- **Connection String:** Replace placeholders with your Postgres credentials.
  - `postgres://USER:PASS@SOMEHOST.postgres.vercel-storage.com/SOMEDB?pgbouncer=true`

### Environment Variables

Set both. Chat Link Sharing turns on only when both are set (`hasDB` in `src/modules/backend/backend.router.ts`).

| Variable | |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Pooled connection URL, used at runtime through `@prisma/adapter-pg` (`src/server/prisma/prismaDb.ts`) |
| `POSTGRES_URL_NON_POOLING` | Direct (non-pooled) connection URL, used by the Prisma CLI through `prisma.config.ts` (`db push`, `studio`) |

Connection behavior since Prisma 7 (the `pg` driver, not the Rust engine, opens the socket):

- Certificates are verified. `pg` 8.x treats `sslmode=require` as `verify-full` and prints a SECURITY WARNING on every connect with such a URL (the warning says `pg` 9 will adopt libpq semantics). A private CA: trust it with `NODE_EXTRA_CA_CERTS=/path/to/ca.pem`. A truly self-signed server certificate fails with Prisma `P1011` ("Error opening a TLS connection: self-signed certificate"); append `uselibpqcompat=true` to the URL to get libpq's `sslmode` meanings back, which stops verifying for `require`.
- `connect_timeout` in the URL is ignored. The connect timeout is 15 seconds, set in code (`connectionTimeoutMillis`).
- `pgbouncer=true` is accepted and ignored; PgBouncer 1.26.0 or later in transaction mode works (tested with scram-sha-256).

### Initial Setup Steps

1. **Run `npx prisma db push`:** Create or update the database schema (run once after connecting). The CLI reads `POSTGRES_URL_NON_POOLING` from the environment or a local `.env`.
2. After editing `src/server/prisma/schema.prisma`, run `npx prisma generate` (`db push` no longer does).

### Additional Resources

- Prisma documentation: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
