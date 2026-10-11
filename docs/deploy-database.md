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

- Certificates are verified. `pg` 8.x treats `sslmode=require` as `verify-full` and prints a SECURITY WARNING on every connect with such a URL (the warning says `pg` 9 will adopt libpq semantics). A certificate Node does not trust fails with Prisma `P1011` ("Error opening a TLS connection: self-signed certificate"). Trust it with `NODE_EXTRA_CA_CERTS=/path/to/cert.pem`: the private CA's certificate, or the server's own self-signed certificate (tested on `postgres:18`, whose certificate names `localhost`); the certificate's name must match the host in the URL. Last resort: `uselibpqcompat=true` in the URL restores libpq's `sslmode` meanings, so `require` encrypts without verifying the server. Anyone on the network path can then impersonate the database; use it only on a network you already trust.
- `connect_timeout` in the URL is ignored. The connect timeout is 15 seconds, set in code (`connectionTimeoutMillis`).
- `pgbouncer=true` is accepted and ignored; PgBouncer 1.26.0 or later in transaction mode works (tested with scram-sha-256).

### Initial Setup Steps

1. **Run `npx prisma db push`:** Create or update the database schema (run once after connecting). The CLI reads `POSTGRES_URL_NON_POOLING` from the environment or a local `.env`.
2. After editing `src/server/prisma/schema.prisma`, run `npx prisma generate` (`db push` no longer does).

### Additional Resources

- Prisma documentation: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
