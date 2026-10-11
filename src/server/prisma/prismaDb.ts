import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client';


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prismaDb =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.POSTGRES_PRISMA_URL,
      // pg ignores `connect_timeout` in the URL and defaults to no timeout; 15s matches docs/deploy-database.md
      connectionTimeoutMillis: 15_000,
    }),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaDb;
