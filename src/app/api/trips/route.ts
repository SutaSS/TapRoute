// ============================================================
// TapRoute — API: GET /api/trips
// ============================================================
// Ambil semua trips milik user
// Model Prisma: Itinerary (mapped ke tabel 'itineraries')
// TODO: Filter berdasarkan userId dari session/auth

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ApiResponse, Trip, DayItinerary } from '@/types';

// ------------------------------------------------------------
// GET /api/trips
// Returns: { data: Trip[] }
// ------------------------------------------------------------
export async function GET(_req: NextRequest) {
  try {
    // TODO: Ambil userId dari Supabase session / auth header
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

    const rows = await prisma.itinerary.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
    });

    // Map dari model Prisma ke Trip type
    const trips: Trip[] = rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      title: row.title,
      location: row.location,
      duration: row.duration,
      budget: row.budget,
      preferences: (row.preferences ?? '').split(',').filter(Boolean),
      status: row.status as Trip['status'],
      is_final: row.isFinal,
      itinerary: row.itineraryJson as unknown as DayItinerary[],
      total_estimated_cost: row.totalEstimatedCost,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    }));

    return NextResponse.json<ApiResponse<Trip[]>>({ data: trips });
  } catch (error) {
    console.error('[API/trips GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal mengambil data trips.' },
      { status: 500 }
    );
  }
}
