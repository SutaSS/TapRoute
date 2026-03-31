// ============================================================
// TapRoute — API: POST /api/edit
// ============================================================
// Modifikasi parsial itinerary via LLM:
//   - Ambil data lama dari DB
//   - Kirim ke editItinerary bersama user_request
//   - Simpan hasil revisi kembali ke DB
//   - Tolak jika status sudah 'paid'

import { NextRequest, NextResponse } from 'next/server';
import { editItinerary, calculateTotalPrice, calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import { ApiResponse, DayItinerary } from '@/types';
import { Itinerary } from '@prisma/client';

import { cookies } from 'next/headers';

// ------------------------------------------------------------
// POST /api/edit
// Body: { itinerary_id: string, user_request: string }
// Returns: { data: Itinerary }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('taproute_session')?.value;

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    if (existing.userId !== userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

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

    const recalculatedDuration =
      Array.isArray(updatedItinerary) && updatedItinerary.length > 0
        ? updatedItinerary.length
        : existing.duration;

    // 5. Hitung ulang total sesuai coreSystem.MD (user_price = partner + fee)
    const basePartnerTotal = Math.round(calculateTotalPrice(updatedItinerary));
    const paxCount = (existing as any).pax ?? 1;
    const partnerTotal = basePartnerTotal * paxCount;
    const { user_price } = calculateBookingFee(partnerTotal);
    const totalEstimatedCost = user_price;

    // 6. Update kolom itinerary_json di tabel itinerary dengan hasil revisi baru
    const updated = await prisma.itinerary.update({
      where: { id: itinerary_id },
      data: {
        itineraryJson: updatedItinerary as any,
        duration: recalculatedDuration,
        totalEstimatedCost,
        status: 'draft', // Sesuai request: jangan ubah ke planned
      },
    });

    // 7. Simpan chat edit ke database
    await (prisma as any).chatMessage.create({
      data: {
        itineraryId: itinerary_id,
        sender: 'user',
        text: user_request
      }
    });

    await (prisma as any).chatMessage.create({
      data: {
        itineraryId: itinerary_id,
        sender: 'assistant',
        text: 'Baik! Saya telah memperbarui itinerary Anda sesuai dengan permintaan. Silakan cek perubahan di atas.'
      }
    });

    // 8. Kembalikan data itinerary yang sudah diperbarui ke frontend
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
