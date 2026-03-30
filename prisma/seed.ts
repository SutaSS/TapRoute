// ============================================================
// TapRoute — Prisma Seed Script
// ============================================================
// Jalankan: npx prisma db seed
// Atau: npx ts-node prisma/seed.ts
// 
// TODO: Sesuaikan data seed dengan kebutuhan demo

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------
// Seed Data
// ------------------------------------------------------------
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@taproute.id',
  name: 'Demo Traveler',
  password: 'hashed-password-here', // TODO: hash dengan bcrypt
};

const DEMO_ITINERARY_BALI = {
  id: 'itinerary-bali-001',
  user_id: 'demo-user-001',
  title: 'Trip ke Bali',
  location: 'Bali',
  duration: 2,
  budget: 2000000,
  preferences: JSON.stringify(['beach', 'culinary', 'umkm']),
  status: 'planned',
  is_final: true,
  itinerary_data: JSON.stringify([
    {
      day: 1,
      activities: [
        {
          place_name: 'Pantai Kuta',
          description: 'Pantai ikonik Bali dengan ombak terbaik.',
          estimated_price: 50000,
          category: 'destination',
          booking_available: false,
          umkm_flag: false,
        },
        {
          place_name: 'Warung Mak Beng',
          description: 'Warung seafood lokal terkenal dengan ikan goreng renyah.',
          estimated_price: 75000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
        {
          place_name: 'Pasar Seni Sukawati',
          description: 'Pasar kerajinan tangan dan oleh-oleh khas Bali.',
          estimated_price: 100000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
      ],
    },
    {
      day: 2,
      activities: [
        {
          place_name: 'Tanah Lot',
          description: 'Pura di atas batu karang dengan pemandangan sunset.',
          estimated_price: 60000,
          category: 'destination',
          booking_available: false,
          umkm_flag: false,
        },
        {
          place_name: 'Kopi Bali Bu Ayu',
          description: 'Kedai kopi lokal dengan kopi Bali asli dan jajanan tradisional.',
          estimated_price: 35000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
      ],
    },
  ]),
  total_price: 320000,
};

const DEMO_ITINERARY_DRAFT = {
  id: 'itinerary-yogya-001',
  user_id: 'demo-user-001',
  title: 'Trip ke Yogyakarta',
  location: 'Yogyakarta',
  duration: 3,
  budget: 1500000,
  preferences: JSON.stringify(['culture', 'culinary']),
  status: 'draft',
  is_final: false,
  itinerary_data: JSON.stringify([]),
  total_price: 0,
};

// ------------------------------------------------------------
// Main seed function
// ------------------------------------------------------------
async function main() {
  console.log('🌱 Seeding database...');

  // 1. Upsert demo user
  await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: {},
    create: DEMO_USER,
  });
  console.log('✅ User seeded:', DEMO_USER.email);

  // 2. Upsert demo itinerary (Bali - planned)
  await prisma.itinerary.upsert({
    where: { id: DEMO_ITINERARY_BALI.id },
    update: {},
    create: DEMO_ITINERARY_BALI,
  });
  console.log('✅ Itinerary seeded: Trip ke Bali (planned)');

  // 3. Upsert demo itinerary (Yogyakarta - draft)
  await prisma.itinerary.upsert({
    where: { id: DEMO_ITINERARY_DRAFT.id },
    update: {},
    create: DEMO_ITINERARY_DRAFT,
  });
  console.log('✅ Itinerary seeded: Trip ke Yogyakarta (draft)');

  console.log('🎉 Seeding selesai!');
}

// ------------------------------------------------------------
// Run
// ------------------------------------------------------------
main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
