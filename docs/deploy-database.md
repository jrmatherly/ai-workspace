# Database

Postgres backs Chat Link Sharing, and authentication when any `AUTH_*` provider is set
([Authentication](deploy-authentication.md)). Without either, the app runs with no database.

## Hosting

- Serverless or self-hosted Postgres; tested on Postgres 18.
- Connection string: `postgres://USER:PASS@HOST/DB?pgbouncer=true` (pooled) and a direct URL for migrations.

## Environment Variables

Set both. Chat Link Sharing turns on only when both are set (`hasDB` in `src/modules/backend/backend.router.ts`).
Authentication refuses to start without both.

| Variable | |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Pooled connection URL, used at runtime through `@prisma/adapter-pg` (`src/server/prisma/prismaDb.ts`) |
| `POSTGRES_URL_NON_POOLING` | Direct (non-pooled) connection URL, used by the Prisma CLI through `prisma.config.ts` (`migrate deploy`, `migrate resolve`, `studio`) |

Connection behavior since Prisma 7 (the `pg` driver, not the Rust engine, opens the socket):

- Certificates are verified. `pg` 8.x treats `sslmode=require` as `verify-full` and prints a SECURITY WARNING on every connect with such a URL (the warning says `pg` 9 will adopt libpq semantics). A certificate Node does not trust fails with Prisma `P1011` ("Error opening a TLS connection: self-signed certificate"). Trust it with `NODE_EXTRA_CA_CERTS=/path/to/cert.pem`: the private CA's certificate, or the server's own self-signed certificate (tested on `postgres:18`, whose certificate names `localhost`); the certificate's name must match the host in the URL. Last resort: `uselibpqcompat=true` in the URL restores libpq's `sslmode` meanings, so `require` encrypts without verifying the server. Anyone on the network path can then impersonate the database; use it only on a network you already trust.
- `connect_timeout` in the URL is ignored. The connect timeout is 15 seconds, set in code (`connectionTimeoutMillis`).
- `pgbouncer=true` is accepted and ignored; PgBouncer 1.26.0 or later in transaction mode works (tested with scram-sha-256).

## Schema changes

The schema is versioned by committed migrations in `src/server/prisma/migrations/`. `0_init` is the baseline of the
`db push` era (the `LinkStorage` table).

- **Fresh database:** run `npm run db:migrate` (`prisma migrate deploy`). It applies `0_init` and every later migration.
- **Database created with `npx prisma db push`:** run `npx prisma migrate resolve --applied 0_init` once, then
  `npm run db:migrate`.
- **Every release:** run `npm run db:migrate` once, on `POSTGRES_URL_NON_POOLING`, before the new version serves traffic.
  - Kubernetes: one Job before the rollout, or an init container with replicas 1, running the app image with the
    command `/app/node_modules/.bin/prisma migrate deploy` (see [Kubernetes](deploy-k8s.md)). Never in every
    replica at start: a second concurrent run times out on the advisory lock (`P1002`) and must be re-run.
  - Vercel: in the build command before `next build`; `POSTGRES_URL_NON_POOLING` must be available at build time.
  - Docker: `docker run --rm -e POSTGRES_URL_NON_POOLING=... <app image> /app/node_modules/.bin/prisma migrate deploy`.
    The app image carries the Prisma CLI, the schema and the migrations; it runs read-only as uid 1001 and needs
    no other variable.
- The database role needs DDL rights (`CREATE TABLE`, `CREATE TYPE`, write on `_prisma_migrations`); production
  never needs `CREATEDB`.
- **Development:** after editing `src/server/prisma/schema.prisma`, run `npx prisma migrate dev --name <change>`
  against a local database (needs `CREATEDB` for the shadow database) and commit the new directory.
  `npm run db:push` remains for throwaway prototyping only.

## Additional Resources

- Prisma documentation: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
