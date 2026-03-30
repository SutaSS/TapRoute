// ============================================================
// TapRoute — API: POST /api/booking
// ============================================================
// Proses booking satu aktivitas:
//   - Hitung platform_fee (10%) & umkm_revenue (90%)
//   - Simpan ke tabel Booking
//   - Update status itinerary → 'paid'

import { NextRequest, NextResponse } from 'next/server';
import { calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import { ApiResponse, Booking } from '@/types';

// ------------------------------------------------------------
// Request body
// ------------------------------------------------------------
interface BookingRequestBody {
  itinerary_id: string;
  place_name: string;
  category: 'destination' | 'umkm';
  price: number;
}

// ------------------------------------------------------------
// POST /api/booking
// Body: BookingRequestBody
// Returns: { data: Booking }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body: BookingRequestBody = await req.json();

    // TODO: Validasi input lebih lengkap
    if (!body.itinerary_id || !body.place_name || body.price == null) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'itinerary_id, place_name, dan price wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Cek itinerary ada dan statusnya
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: body.itinerary_id },
    });

    if (!itinerary) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Hanya bisa booking jika is_final = true dan belum paid
    if (!itinerary.is_final) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary harus di-finalize terlebih dahulu (klik Done).' },
        { status: 403 }
      );
    }

    if (itinerary.status === 'paid') {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary sudah dibayar.' },
        { status: 409 }
      );
    }

    // 3. Hitung fee
    const { platform_fee, umkm_revenue } = calculateBookingFee(body.price);

    // 4. Simpan booking ke database
    const booking = await prisma.booking.create({
      data: {
        itinerary_id: body.itinerary_id,
        place_name: body.place_name,
        category: body.category,
        price: body.price,
        platform_fee,
        umkm_revenue,
        status: 'confirmed',
      },
    });

    // 5. Update status itinerary → 'paid'
    await prisma.itinerary.update({
      where: { id: body.itinerary_id },
      data: { status: 'paid' },
    });

    // TODO: Kirim notifikasi / email konfirmasi jika perlu

    return NextResponse.json<ApiResponse<Booking>>({
      data: booking as unknown as Booking,
      message: 'Booking berhasil dikonfirmasi!',
    });
  } catch (error) {
    console.error('[API/booking] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal memproses booking. Coba lagi.' },
      { status: 500 }
    );
  }
}
