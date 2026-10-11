**Connecting Your Database for Enhanced Features:**

This guide outlines the database setup for enabling features like Chat Link Sharing in your application.

### Database

**Serverless Postgres:**

- Available on Vercel, Neon, and other platforms.
- **Connection String:** Replace placeholders with your Postgres credentials.
  - `postgres://USER:PASS@SOMEHOST.postgres.vercel-storage.com/SOMEDB?pgbouncer=true&connect_timeout=15`

### Environment Variables

Set both. Chat Link Sharing turns on only when both are set (`hasDB` in `src/modules/backend/backend.router.ts`).

| Variable | |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `POSTGRES_PRISMA_URL` | `postgres://USER:PASS@SOMEHOST.postgres.vercel-storage.com/SOMEDB?pgbouncer=true&connect_timeout=15` |
| `POSTGRES_URL_NON_POOLING` | Direct (non-pooled) connection URL, used by Prisma as `directUrl` |

### Initial Setup Steps

1. **Run `npx prisma db push`:** Create or update the database schema (run once after connecting).

### Additional Resources

- Prisma documentation: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
