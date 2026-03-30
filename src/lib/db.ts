// ============================================================
// TapRoute — Prisma Client Singleton
// ============================================================
// TODO: Pastikan DATABASE_URL sudah diset di .env
// Contoh untuk SQLite: DATABASE_URL="file:./dev.db"

import { PrismaClient } from '@prisma/client';

// ------------------------------------------------------------
// Singleton pattern — hindari multiple connections di dev
// ------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// ------------------------------------------------------------
// Helper: disconnect (pakai di script / test)
// ------------------------------------------------------------
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
