import { defineConfig } from 'prisma/config';

// Prisma 7 no longer reads .env; keep the prisma CLI scripts working from a local .env without adding dotenv.
// process.env, not env() from prisma/config: env() throws at config load when the var is unset, and the
// DB is optional (schema.prisma header), so `prisma generate` must work on machines and images without one.
try { process.loadEnvFile(); } catch { /* no .env: use the process environment */ }

export default defineConfig({
  schema: 'src/server/prisma/schema.prisma',
  // 0_init baselines tables already created by db push: mark it applied with migrate resolve on those databases
  migrations: { path: 'src/server/prisma/migrations' },
  datasource: {
    // CLI only (migrate deploy/resolve/dev, studio). The direct URL: no PgBouncer, so the migrate advisory lock cannot leak.
    url: process.env.POSTGRES_URL_NON_POOLING,
  },
});
