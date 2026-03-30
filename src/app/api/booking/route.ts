// ============================================================
// TapRoute — API: POST /api/booking
// ============================================================
// Proses booking seluruh itinerary:
//   - Ambil data itinerary dari DB berdasarkan itinerary_id
//   - Hitung total_price, platform_fee, dan umkm_revenue
//   - Simpan record booking ke tabel bookings
//   - Update status itinerary → 'paid' & is_final → true

import { NextRequest, NextResponse } from 'next/server';
import { calculateTotalPrice, calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import { ApiResponse, DayItinerary } from '@/types';
import { Booking } from '@prisma/client';

// ------------------------------------------------------------
// POST /api/booking
// Body: { itinerary_id: string }
// Returns: { data: Booking }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary_id } = body;

    // 0. Validasi input
    if (!itinerary_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'itinerary_id wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Ambil data itinerary dari database menggunakan prisma
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itinerary_id },
    });

    if (!itinerary) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Cek apakah sudah dibayar
    if (itinerary.status === 'paid') {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Itinerary sudah dibayar.' },
        { status: 409 }
      );
    }

    // 2. Ambil itinerary JSON dan parse sebagai DayItinerary[]
    const itineraryData = itinerary.itineraryJson as unknown as DayItinerary[];

    // 3. Hitung total_price dari semua aktivitas menggunakan calculateTotalPrice
    const totalPrice = Math.round(calculateTotalPrice(itineraryData));

    // 4. Hitung platform_fee (10%) menggunakan calculateBookingFee
    const { platform_fee } = calculateBookingFee(totalPrice);

    // 5. Hitung umkm_revenue = total harga dari item yang umkm_flag: true
    const umkmRevenue = Math.round(
      itineraryData.reduce((total, day) => {
        return total + day.activities
          .filter((act) => act.umkm_flag === true)
          .reduce((sum, act) => sum + act.estimated_price, 0);
      }, 0)
    );

    // 6. Simpan booking ke database & update status itinerary dalam satu transaksi
    const userId = itinerary.userId;

    const [booking] = await prisma.$transaction([
      // Buat record booking baru
      prisma.booking.create({
        data: {
          itineraryId: itinerary_id,
          userId,
          placeName: itinerary.location,
          category: 'destination',
          price: totalPrice,
          platformFee: platform_fee,
          umkmRevenue,
          status: 'paid',
        },
      }),

      // Update status itinerary → 'paid' dan is_final → true
      prisma.itinerary.update({
        where: { id: itinerary_id },
        data: {
          status: 'paid',
          isFinal: true,
        },
      }),
    ]);

    // 7. Return objek booking yang baru disimpan
    return NextResponse.json<ApiResponse<Booking>>({
      data: booking,
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
