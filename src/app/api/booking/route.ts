// ============================================================
// TapRoute — API: POST /api/booking
// ============================================================
// Proses booking dengan integrasi Midtrans Snap:
//   - Hitung total_price, platform_fee, umkm_revenue
//   - Buat transaksi Midtrans → dapat snap_token & redirect_url
//   - Simpan booking dengan status 'pending'
//   - Frontend pakai snap_token untuk popup pembayaran

import { NextRequest, NextResponse } from 'next/server';
import { calculateTotalPrice, calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import snap from '@/lib/midtrans';
import { randomUUID } from 'crypto';
import { ApiResponse, DayItinerary } from '@/types';
import { Booking } from '@prisma/client';

// ------------------------------------------------------------
// Response type untuk booking dengan Midtrans data
// ------------------------------------------------------------
interface BookingResponse {
  booking: Booking;
  snap_token: string;
  snap_redirect_url: string;
}

// ------------------------------------------------------------
// POST /api/booking
// Body: { itinerary_id: string }
// Returns: { data: BookingResponse }
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

    // 6. Buat order_id unik menggunakan UUID agar bisa langsung jadi Booking ID
    const orderId = randomUUID();

    // 7. Buat parameter transaksi Midtrans
    const midtransParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      item_details: [
        {
          id: itinerary_id,
          name: itinerary.title,
          price: totalPrice,
          quantity: 1,
          category: 'Travel Itinerary',
        },
      ],
      customer_details: {
        first_name: 'TapRoute User',
        email: 'user@taproute.local',
        // TODO: Ambil dari Supabase auth / user profile
      },
    };

    // 8. Panggil Midtrans Snap untuk mendapatkan token & redirect_url
    const midtransResponse = await snap.createTransaction(midtransParams);
    const snapToken: string = midtransResponse.token;
    const snapRedirectUrl: string = midtransResponse.redirect_url;

    // 9. Simpan booking ke database dengan status 'pending' + snap data
    const userId = itinerary.userId;

    const booking = await prisma.booking.create({
      data: {
        id: orderId,
        itineraryId: itinerary_id,
        userId,
        placeName: itinerary.location,
        category: 'destination',
        price: totalPrice,
        platformFee: platform_fee,
        umkmRevenue,
        status: 'pending',
        snapToken,
        snapRedirectUrl,
      },
    });

    // 10. Update itinerary: is_final → true (status tetap, nanti diupdate setelah payment callback)
    await prisma.itinerary.update({
      where: { id: itinerary_id },
      data: { isFinal: true },
    });

    // 11. Return booking + snap_token + snap_redirect_url ke frontend
    return NextResponse.json<ApiResponse<BookingResponse>>({
      data: {
        booking,
        snap_token: snapToken,
        snap_redirect_url: snapRedirectUrl,
      },
      message: 'Booking berhasil dibuat. Silakan lanjutkan pembayaran.',
    });
  } catch (error) {
    console.error('[API/booking] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal memproses booking. Coba lagi.' },
      { status: 500 }
    );
  }
}
