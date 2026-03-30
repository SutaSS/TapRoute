// ============================================================
// TapRoute — API: POST /api/edit
// ============================================================
// Modifikasi parsial itinerary via LLM
// Hanya bisa dilakukan jika status != 'paid'

import { NextRequest, NextResponse } from 'next/server';
import { editItinerary, calculateTotalPrice } from '@/lib/llm';
import prisma from '@/lib/db';
import { EditPayload, ApiResponse, DayItinerary } from '@/types';

// ------------------------------------------------------------
// POST /api/edit
// Body: EditPayload { itinerary_id, current_itinerary, user_request }
// Returns: { data: { itinerary: DayItinerary[] } }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body: EditPayload = await req.json();

    // TODO: Validasi input
    if (!body.itinerary_id || !body.user_request) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'itinerary_id dan user_request wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Ambil itinerary dari DB
    const existing = await prisma.itinerary.findUnique({
      where: { id: body.itinerary_id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Cek apakah sudah paid → tidak boleh diedit
    if (existing.status === 'paid' || existing.status === 'completed') {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary yang sudah dibayar tidak bisa diedit.' },
        { status: 403 }
      );
    }

    // 3. Parse current itinerary
    const currentItinerary: DayItinerary[] = JSON.parse(existing.itinerary_data);

    // 4. Modifikasi parsial via LLM
    const updatedItinerary = await editItinerary({
      itinerary_id: body.itinerary_id,
      current_itinerary: currentItinerary,
      user_request: body.user_request,
    });

    // 5. Hitung ulang total price
    const total_price = calculateTotalPrice(updatedItinerary);

    // 6. Update di database
    await prisma.itinerary.update({
      where: { id: body.itinerary_id },
      data: {
        itinerary_data: JSON.stringify(updatedItinerary),
        total_price,
      },
    });

    return NextResponse.json<ApiResponse<{ itinerary: DayItinerary[] }>>({
      data: { itinerary: updatedItinerary },
      message: 'Itinerary berhasil diupdate',
    });
  } catch (error) {
    console.error('[API/edit] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal mengedit itinerary. Coba lagi.' },
      { status: 500 }
    );
  }
}
