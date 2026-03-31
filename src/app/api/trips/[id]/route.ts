// ============================================================
// TapRoute — API: GET + PATCH /api/trips/[id]
// ============================================================
// GET  → ambil detail trip by id
// PATCH → update status atau is_final (mis: setelah "Done")
// Model Prisma: itineraries (sesuai Dbdiagram.MD)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ApiResponse, Trip, DayItinerary } from '@/types';

// ------------------------------------------------------------
// Route Params
// ------------------------------------------------------------
interface RouteParams {
  params: { id: string };
}

// ------------------------------------------------------------
// GET /api/trips/[id]
// ------------------------------------------------------------
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const row = await prisma.itinerary.findUnique({
      where: { id: params.id },
    });

    if (!row) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Trip tidak ditemukan.' },
        { status: 404 }
      );
    }

    const trip: Trip = {
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
    };

    return NextResponse.json<ApiResponse<Trip>>({ data: trip });
  } catch (error) {
    console.error('[API/trips/[id] GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal mengambil trip.' },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------
// PATCH /api/trips/[id]
// Body: { status?, is_final? }
// Digunakan saat user klik "Done" → is_final: true, status: 'planned'
// Status flow: draft → planned → paid → completed
// ------------------------------------------------------------
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const body: Partial<{ status: string; is_final: boolean }> = await req.json();

    // Hanya izinkan field tertentu yang diupdate
    const allowedFields: (keyof typeof body)[] = ['status', 'is_final'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Tidak ada field yang diupdate.' },
        { status: 400 }
      );
    }

    // TODO: Tambahkan validasi status transition yang valid
    // draft → planned → paid → completed (tidak boleh mundur)
    const validStatuses = ['draft', 'planned', 'paid', 'completed'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.itinerary.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json<ApiResponse<{ id: string; status: string; is_final: boolean }>>({
      data: {
        id: updated.id,
        status: updated.status,
        is_final: updated.isFinal,
      },
      message: 'Trip berhasil diupdate.',
    });
  } catch (error) {
    console.error('[API/trips/[id] PATCH] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal mengupdate trip.' },
      { status: 500 }
    );
  }
}
