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

    const rows = await prisma.itineraries.findMany({
      where: { user_id: DEMO_USER_ID },
      orderBy: { created_at: 'desc' },
    });

    // Map dari model Prisma ke Trip type
    // preferences sudah String[] di DB (PostgreSQL text[])
    // itinerary_json sudah Json (JSONB) di DB
    const trips: Trip[] = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      location: row.location,
      duration: row.duration,
      budget: row.budget,
      preferences: row.preferences,                            // sudah string[]
      status: row.status as Trip['status'],
      is_final: row.is_final,
      itinerary: row.itinerary_json as unknown as DayItinerary[],
      total_estimated_cost: row.total_estimated_cost,
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
