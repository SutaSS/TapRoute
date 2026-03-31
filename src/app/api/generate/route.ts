// ============================================================
// TapRoute — API: POST /api/generate
// ============================================================
// Menerima form input, generate itinerary via LLM,
// simpan ke database (tabel itineraries), return objek itinerary
// Model Prisma: Itinerary (mapped ke tabel 'itineraries')

import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary, calculateTotalPrice, calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import { TripFormInput, ApiResponse } from '@/types';
import { Itinerary } from '@prisma/client';

import { cookies } from 'next/headers';

// ------------------------------------------------------------
// POST /api/generate
// Body: { destination, duration, budget, preferences }
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

    // 0. Parse & validasi input dari request body
    const body: TripFormInput & { messages?: any[] } = await req.json();

    const { destination, duration, budget, pax, startDate, preferences, messages } = body;

    if (!destination || !duration || !budget || !pax) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'destination, duration, pax, dan budget wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Generate itinerary via LLM
    const itineraryData = await generateItinerary({
      destination,
      duration,
      budget,
      pax,
      startDate,
      preferences: preferences ?? [],
    });

    // 2. Hitung total sesuai coreSystem.MD:
    //    partner_total = sum(estimated_price) * pax
    //    user_price    = partner_total + platform_fee (10%)
    //    → totalEstimatedCost = user_price (yang dibayar user, FINAL)
    const basePartnerTotal = Math.round(calculateTotalPrice(itineraryData));
    const partnerTotal = basePartnerTotal * pax;
    const { user_price } = calculateBookingFee(partnerTotal);
    const totalEstimatedCost = user_price;

    // 3. Simpan ke database via Prisma
    const saved = await (prisma.itinerary as any).create({
      data: {
        userId,
        title: `Trip ke ${destination}`,
        location: destination,
        duration: Number(duration),
        budget: Math.round(Number(budget)),
        pax: Number(pax),
        preferences: Array.isArray(preferences)
          ? preferences.join(',')
          : '',
        startDate: startDate ? new Date(startDate) : null,
        itineraryJson: itineraryData as any,
        totalEstimatedCost,
        status: 'draft',
        isFinal: false,
      },
    });

    // 4. Jika ada obrolan sebelumnya, simpan riwayat chat ke DB
    if (messages && Array.isArray(messages) && messages.length > 0) {
      await (prisma as any).chatMessage.createMany({
        data: messages.map(m => ({
          itineraryId: saved.id,
          sender: m.sender || 'user',
          text: m.text || m.content || '',
        }))
      });
    }

    // 5. Return objek itinerary yang baru disimpan
    return NextResponse.json<ApiResponse<Itinerary>>({
      data: saved,
      message: 'Itinerary berhasil dibuat',
    });
  } catch (error) {
    console.error('[API/generate] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal generate itinerary. Coba lagi.' },
      { status: 500 }
    );
  }
}
