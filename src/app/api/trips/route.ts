// ============================================================
// TapRoute — API: GET /api/trips
// ============================================================
// Ambil semua trips milik user
// Model Prisma: Itinerary (mapped ke tabel 'itineraries')
// TODO: Filter berdasarkan userId dari session/auth

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ApiResponse, Trip, DayItinerary } from '@/types';

import { cookies } from 'next/headers';

// ------------------------------------------------------------
// GET /api/trips
// Returns: { data: Trip[] }
// ------------------------------------------------------------
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('taproute_session')?.value;

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rows = await prisma.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Map dari model Prisma ke Trip type lengkap dengan dynamic status calculation
    const trips: Trip[] = rows.map((row) => {
      let dynamicStatus = row.status as Trip['status'];

      // Jika sudah dibayar/fix, cek tanggal untuk status 'completed'
      if (dynamicStatus === 'planned' || dynamicStatus === 'paid') {
        if ((row as any).startDate) {
          const start = new Date((row as any).startDate);
          // tripEndDate = startDate + duration
          const end = new Date(start);
          end.setDate(end.getDate() + row.duration);

          if (new Date() > end) {
            dynamicStatus = 'completed'; // History
          }
        }
      }

      return {
        id: row.id,
        user_id: row.userId,
        title: row.title,
        location: row.location,
        duration: row.duration,
        budget: row.budget,
        pax: (row as any).pax ?? 1,
        startDate: (row as any).startDate ? new Date((row as any).startDate).toISOString() : undefined,
        preferences: (row.preferences ?? '').split(',').filter(Boolean),
        status: dynamicStatus,
        is_final: row.isFinal,
        itinerary: row.itineraryJson as unknown as DayItinerary[],
        total_estimated_cost: row.totalEstimatedCost,
        created_at: row.createdAt.toISOString(),
        updated_at: row.updatedAt.toISOString(),
      };
    });

    return NextResponse.json<ApiResponse<Trip[]>>({ data: trips });
  } catch (error) {
    console.error('[API/trips GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: `Gagal: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
