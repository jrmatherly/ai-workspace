import { defineConfig } from 'prisma/config';

// Prisma 7 no longer reads .env; keep `npm run db:push` working from a local .env without adding dotenv.
// process.env, not env() from prisma/config: env() throws at config load when the var is unset, and the
// DB is optional (schema.prisma header), so `prisma generate` must work on machines and images without one.
try { process.loadEnvFile(); } catch { /* no .env: use the process environment */ }

export default defineConfig({
  schema: 'src/server/prisma/schema.prisma',
  datasource: {
    // CLI only (db push, studio). The direct URL, formerly the schema's `directUrl`.
    url: process.env.POSTGRES_URL_NON_POOLING,
  },
});
