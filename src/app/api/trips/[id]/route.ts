// ============================================================
// TapRoute — API: GET + PATCH /api/trips/[id]
// ============================================================
// GET  → ambil detail trip by id
// PATCH → update status atau is_final (mis: setelah "Done")
// Model Prisma: itineraries (sesuai Dbdiagram.MD)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ApiResponse, Trip, DayItinerary } from '@/types';

export const dynamic = 'force-dynamic';

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
    const row = await (prisma.itinerary as any).findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!row) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Trip tidak ditemukan.' },
        { status: 404 }
      );
    }

    let dynamicStatus = row.status as Trip['status'];

    if (dynamicStatus === 'planned' || dynamicStatus === 'paid') {
      if ((row as any).startDate) {
        const start = new Date((row as any).startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + row.duration);

        if (new Date() > end) {
          dynamicStatus = 'completed'; // History
        }
      }
    }

    const trip: Trip & { messages?: any[] } = {
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
      messages: (row as any).messages,
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

    // Map dari snake_case body ke camelCase Prisma fields
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.is_final !== undefined) {
      updateData.isFinal = body.is_final;
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

// ------------------------------------------------------------
// DELETE /api/trips/[id]
// Membatalkan booking / menghapus trip
// ------------------------------------------------------------
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await prisma.itinerary.delete({
      where: { id: params.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Booking berhasil dibatalkan',
    });
  } catch (error) {
    console.error('[API/trips/[id] DELETE] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal membatalkan booking. Coba lagi.' },
      { status: 500 }
    );
  }
}
