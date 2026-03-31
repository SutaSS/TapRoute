// ============================================================
// TapRoute — API: POST /api/edit
// ============================================================
// Modifikasi parsial itinerary via LLM:
//   - Ambil data lama dari DB
//   - Kirim ke editItinerary bersama user_request
//   - Simpan hasil revisi kembali ke DB
//   - Tolak jika status sudah 'paid'

import { NextRequest, NextResponse } from 'next/server';
import { editItinerary, calculateTotalPrice } from '@/lib/llm';
import prisma from '@/lib/db';
import { ApiResponse, DayItinerary } from '@/types';
import { Itinerary } from '@prisma/client';

// ------------------------------------------------------------
// POST /api/edit
// Body: { itinerary_id: string, user_request: string }
// Returns: { data: Itinerary }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary_id, user_request } = body;

    // 0. Validasi input
    if (!itinerary_id || !user_request) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'itinerary_id dan user_request wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Ambil data itinerary lama dari database menggunakan prisma
    const existing = await prisma.itinerary.findUnique({
      where: { id: itinerary_id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Pengecekan: Jika status sudah 'paid', edit tidak diperbolehkan
    if (existing.status === 'paid') {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary yang sudah dibayar tidak bisa diedit.' },
        { status: 403 }
      );
    }

    // 3. Ambil itinerary_json lama dari database
    const currentItinerary = existing.itineraryJson as unknown as DayItinerary[];

    // 4. Panggil editItinerary dari @/lib/llm dengan data lama + user_request
    const updatedItinerary = await editItinerary({
      itinerary_id,
      current_itinerary: currentItinerary,
      user_request,
    });

    // 5. Hitung ulang total estimated cost dari hasil revisi
    const totalEstimatedCost = Math.round(calculateTotalPrice(updatedItinerary));

    // 6. Update kolom itinerary_json di tabel itinerary dengan hasil revisi baru
    const updated = await prisma.itinerary.update({
      where: { id: itinerary_id },
      data: {
        itineraryJson: updatedItinerary as any,
        totalEstimatedCost,
        status: 'planned',
      },
    });

    // 7. Kembalikan data itinerary yang sudah diperbarui ke frontend
    return NextResponse.json<ApiResponse<Itinerary>>({
      data: updated,
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
