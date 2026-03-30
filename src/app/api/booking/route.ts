// ============================================================
// TapRoute — API: POST /api/booking
// ============================================================
// Proses booking satu aktivitas:
//   - Hitung platform_fee (10%) & umkm_revenue (90%)
//   - Simpan ke tabel bookings (sesuai Dbdiagram.MD, termasuk user_id)
//   - Update status itinerary → 'paid'
// Model Prisma: bookings + itineraries (sesuai Dbdiagram.MD)

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
    const itinerary = await prisma.itineraries.findUnique({
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

    // 3. Hitung fee (integer — Math.round untuk menghindari float)
    const price = Math.round(body.price);
    const { platform_fee, umkm_revenue } = calculateBookingFee(price);

    // 4. Simpan booking ke database
    // Dbdiagram.MD: bookings punya user_id
    // TODO: Ambil user_id dari session/auth
    const DEMO_USER_ID = 'demo-user-uuid-001';

    const booking = await prisma.bookings.create({
      data: {
        itinerary_id: body.itinerary_id,
        user_id: DEMO_USER_ID,                 // Sesuai Dbdiagram.MD
        place_name: body.place_name,
        category: body.category,
        price,
        platform_fee,
        umkm_revenue,
        status: 'paid',                        // Dbdiagram: pending | paid
      },
    });

    // 5. Update status itinerary → 'paid'
    await prisma.itineraries.update({
      where: { id: body.itinerary_id },
      data: { status: 'paid' },
    });

    // TODO: Kirim notifikasi / email konfirmasi jika perlu

    return NextResponse.json<ApiResponse<Booking>>({
      data: {
        id: booking.id,
        itinerary_id: booking.itinerary_id,
        user_id: booking.user_id,
        place_name: booking.place_name,
        category: booking.category as 'destination' | 'umkm',
        price: booking.price,
        platform_fee: booking.platform_fee,
        umkm_revenue: booking.umkm_revenue,
        status: booking.status as 'pending' | 'paid',
        created_at: booking.created_at.toISOString(),
      },
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
