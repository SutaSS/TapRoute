// ============================================================
// TapRoute — Prisma Seed Script
// ============================================================
// Sesuai Dbdiagram.MD:
//   - users.id  → uuid (dari Supabase auth)
//   - itineraries: preferences String[], itinerary_json JSONB,
//                  total_estimated_cost Int, budget Int
//   - bookings: user_id uuid, price/platform_fee/umkm_revenue Int,
//               status: pending | paid
//
// Jalankan: npx prisma db seed
// Atau via tsx: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------
// Demo UUIDs (gunakan format uuid yang valid)
// ------------------------------------------------------------
const DEMO_USER_UUID    = '00000000-0000-0000-0000-000000000001';
const BALI_ITINERARY_ID = '00000000-0000-0000-0000-000000000101';
const YOGYA_ITINERARY_ID= '00000000-0000-0000-0000-000000000102';

// ------------------------------------------------------------
// Demo itinerary_json (sesuai DayItinerary[] type)
// ------------------------------------------------------------
const baliItineraryJson = [
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
];

// ------------------------------------------------------------
// Main seed function
// ------------------------------------------------------------
async function main() {
  console.log('🌱 Seeding database...');

  // 1. Upsert demo user
  // Note: di production, user dibuat oleh Supabase auth
  await prisma.users.upsert({
    where: { id: DEMO_USER_UUID },
    update: {},
    create: { id: DEMO_USER_UUID },
  });
  console.log('✅ User seeded:', DEMO_USER_UUID);

  // 2. Upsert itinerary Bali (planned, is_final: true)
  await prisma.itineraries.upsert({
    where: { id: BALI_ITINERARY_ID },
    update: {},
    create: {
      id: BALI_ITINERARY_ID,
      user_id: DEMO_USER_UUID,
      title: 'Trip ke Bali',
      location: 'Bali',
      duration: 2,
      budget: 2000000,
      preferences: ['beach', 'culinary', 'umkm'],  // String[]
      status: 'planned',
      is_final: true,
      itinerary_json: baliItineraryJson,             // JSONB
      total_estimated_cost: 320000,
    },
  });
  console.log('✅ Itinerary seeded: Trip ke Bali (planned)');

  // 3. Upsert itinerary Yogyakarta (draft)
  await prisma.itineraries.upsert({
    where: { id: YOGYA_ITINERARY_ID },
    update: {},
    create: {
      id: YOGYA_ITINERARY_ID,
      user_id: DEMO_USER_UUID,
      title: 'Trip ke Yogyakarta',
      location: 'Yogyakarta',
      duration: 3,
      budget: 1500000,
      preferences: ['culture', 'culinary'],
      status: 'draft',
      is_final: false,
      itinerary_json: [],
      total_estimated_cost: 0,
    },
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
