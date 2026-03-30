// ============================================================
// TapRoute — API: GET /api/trips
// ============================================================
// Ambil semua trips milik user
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
    // TODO: Ambil userId dari session/auth
    const DEMO_USER_ID = 'demo-user-001';

    const rows = await prisma.itinerary.findMany({
      where: { user_id: DEMO_USER_ID },
      orderBy: { created_at: 'desc' },
    });

    // Parse JSON fields
    const trips: Trip[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      location: row.location,
      duration: row.duration,
      budget: row.budget,
      preferences: JSON.parse(row.preferences) as string[],
      status: row.status as Trip['status'],
      is_final: row.is_final,
      itinerary: JSON.parse(row.itinerary_data) as DayItinerary[],
      total_price: row.total_price,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
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
