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
    console.log('[Webhook Midtrans] Raw Payload Masuk:', JSON.stringify(body, null, 2));

    // 1. Verifikasi notifikasi menggunakan Midtrans client
    const statusResponse = await snap.transaction.notification(body);
    console.log('[Webhook Midtrans] Verified Status Response:', JSON.stringify(statusResponse, null, 2));

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    if (!orderId) {
      console.warn('[Webhook Midtrans] Tidak ada order_id di payload.');
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 2. Cari booking berdasarkan id (order_id)
    const booking = await prisma.booking.findUnique({
      where: { id: orderId }
    });

    if (!booking) {
      console.warn(`[Webhook Midtrans] Booking tidak ditemukan untuk order_id: ${orderId}`);
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // Tampilkan log userId untuk memastikan tidak error jika null/missing di logika lain
    console.log(`[Webhook Midtrans] Booking ditemukan. User ID: ${booking.userId || 'null'}`);

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
    if (isSuccess && booking.status !== 'paid') {
      console.log(`[Webhook Midtrans] Mengupdate status menjadi PAID untuk Order ID: ${orderId}`);
      
      await prisma.$transaction([
        // Update booking status menggunakan id (orderId)
        prisma.booking.update({
          where: { id: orderId },
          data: { status: 'paid' }
        }),
        // Update itinerary status
        prisma.itinerary.update({
          where: { id: booking.itineraryId },
          data: { status: 'paid' }
        })
      ]);
      console.log(`[Webhook Midtrans] Berhasil update status PAID.`);
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      console.log(`[Webhook Midtrans] Pembayaran gagal/expired untuk Order ID: ${orderId}`);
    } else {
      console.log(`[Webhook Midtrans] Status saat ini: ${transactionStatus}. Belum ada aksi update.`);
    }

    // 5. Selalu return 200 OK ke webhook Midtrans
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook Midtrans] Error Processing Webhook:', error.message || error);
    // Menggunakan status 200 agar Midtrans berhenti mengirim webhook ulang,
    // biarpun terjadi error pada sisi server kita.
    return NextResponse.json(
      { error: 'Internal server error processing webhook', details: error.message }, 
      { status: 200 }
    );
  }
}
