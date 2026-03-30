// ============================================================
// TapRoute — Prisma Client Singleton
// ============================================================
// Prisma 7: datasource URL dikonfigurasi di prisma.config.ts
// (bukan di schema.prisma lagi)
//
// DATABASE_URL wajib diset di .env
// Format Supabase: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

import { PrismaClient } from '@prisma/client';

// ------------------------------------------------------------
// Singleton pattern — hindari multiple connections di Next.js dev
// (Hot reload menyebabkan multiple instances tanpa ini)
// ------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// ------------------------------------------------------------
// Helper: disconnect (pakai di script / test / seed)
// ------------------------------------------------------------
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
