// ============================================================
// TapRoute — API: POST /api/webhooks/midtrans
// ============================================================
// Webhook endpoint untuk menerima notifikasi dari Midtrans.
// Menerima update status pembayaran (settlement, capture, dll)
// Update tabel booking dan itinerary menjadi "paid".

import { NextRequest, NextResponse } from 'next/server';
import snap from '@/lib/midtrans';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Verifikasi notifikasi menggunakan Midtrans client
    const statusResponse = await snap.transaction.notification(body);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // orderId format: TAPROUTE-{itinerary_id.slice(0, 8)}-{timestamp}
    // Ekstrak 8 karakter pertama dari itinerary_id
    const parts = orderId.split('-');
    let itineraryIdPrefix = '';
    
    // Fallback jika format order_id sesuai TAPROUTE-xxxxxxxx-1234567890
    if (parts.length >= 2) {
      if (parts[0] === 'TAPROUTE') {
        itineraryIdPrefix = parts[1];
      } else {
        itineraryIdPrefix = parts[0]; 
      }
    }

    if (!itineraryIdPrefix) {
      console.warn(`[Webhook Midtrans] Format order_id tidak dikenali: ${orderId}`);
      return NextResponse.json({ message: 'OK' }, { status: 200 }); // Tetap return 200 agar midtrans tidak retry
    }

    // 2. Cari booking yang sedang pending berdasarkan itineraryId prefix
    const booking = await prisma.booking.findFirst({
      where: {
        itineraryId: { startsWith: itineraryIdPrefix },
        status: 'pending' // Asumsikan kita hanya process yang statusnya pending
      },
      include: {
        itinerary: true
      }
    });

    if (!booking) {
      console.warn(`[Webhook Midtrans] Booking tidak ditemukan untuk order_id: ${orderId}`);
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 3. Tentukan apakah status pembayarannya sukses
    let isSuccess = false;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        isSuccess = true;
      }
    } else if (transactionStatus === 'settlement') {
      isSuccess = true;
    }

    // 4. Update status di DB bila pembayaran sukses
    if (isSuccess) {
      console.log(`[Webhook Midtrans] Pembayaran sukses untuk Order ID: ${orderId}, Itinerary ID: ${booking.itineraryId}`);
      
      await prisma.$transaction([
        // Update booking status
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'paid' }
        }),
        // Update itinerary status
        prisma.itinerary.update({
          where: { id: booking.itineraryId },
          data: { status: 'paid' }
        })
      ]);
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      console.log(`[Webhook Midtrans] Pembayaran gagal/expired untuk Order ID: ${orderId}`);
      // Opsional: kita bisa set status booking ke "failed" atau "canceled"
      // Tapi karena requirement hanya minta update ketika "settlement" atau "capture",
      // Kita biarkan saja logic cancel di sini untuk pengembangan kedepannya.
    }

    // 5. Selalu return 200 OK ke webhook Midtrans
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook Midtrans] Error 처리:', error);
    // Return 200 dengan error message untuk mengindari retries yang tidak perlu jika errornya di internal server logic,
    // Atau 500 kalau memang mengharapkan Midtrans untuk retry (tergantung kebutuhan).
    // Biasanya lebih aman 200 kalau body berhasil diparsing, tapi 500 jika parsing gagal.
    return NextResponse.json(
      { error: 'Internal server error processing webhook' }, 
      { status: 500 }
    );
  }
}
