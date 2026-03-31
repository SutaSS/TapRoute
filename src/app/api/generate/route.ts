// ============================================================
// TapRoute — API: POST /api/generate
// ============================================================
// Menerima form input, generate itinerary via LLM,
// simpan ke database (tabel itineraries), return objek itinerary
// Model Prisma: Itinerary (mapped ke tabel 'itineraries')

import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary, calculateTotalPrice } from '@/lib/llm';
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

    const { destination, duration, budget, pax, preferences, messages } = body;

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
      preferences: preferences ?? [],
    });

    // 2. Hitung total estimated cost (integer IDR) dikali dengan jumlah orang (pax)
    const baseTotal = Math.round(calculateTotalPrice(itineraryData));
    const totalEstimatedCost = baseTotal * pax;

    // 3. Simpan ke database via Prisma
    const saved = await prisma.itinerary.create({
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
        itineraryJson: itineraryData as any,
        totalEstimatedCost,
        status: 'draft',
        isFinal: false,
      },
    });

    // 4. Jika ada obrolan sebelumnya, simpan riwayat chat ke DB
    if (messages && Array.isArray(messages) && messages.length > 0) {
      await prisma.chatMessage.createMany({
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
