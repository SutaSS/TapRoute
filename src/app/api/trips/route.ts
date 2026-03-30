// ============================================================
// TapRoute — API: GET /api/trips
// ============================================================
// Ambil semua trips milik user
// Model Prisma: itineraries (sesuai Dbdiagram.MD)
// TODO: Filter berdasarkan user_id dari session/auth

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ApiResponse, Trip, DayItinerary } from '@/types';

// ------------------------------------------------------------
// GET /api/trips
// Returns: { data: Trip[] }
// ------------------------------------------------------------
export async function GET(_req: NextRequest) {
  try {
    // TODO: Ambil user_id dari Supabase session / auth header
    const DEMO_USER_ID = 'demo-user-uuid-001';

    const rows = await prisma.itinerary.findMany({
      where: { user_id: DEMO_USER_ID },
      orderBy: { created_at: 'desc' },
    });

    // Map dari model Prisma ke Trip type
    // preferences disimpan sebagai comma-separated string di DB
    // itinerary_data sudah Json (JSONB) di DB
    const trips: Trip[] = rows.map((row: typeof rows[0]) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      location: row.location,
      duration: row.duration,
      budget: row.budget,
      preferences: (row.preferences ?? '').split(',').filter(Boolean),
      status: row.status as  Trip['status'],
      is_final: row.is_final,
      itinerary: row.itinerary_data as unknown as DayItinerary[],
      total_estimated_cost: row.total_price,
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
