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

// ------------------------------------------------------------
// POST /api/generate
// Body: { destination, duration, budget, preferences }
// Returns: { data: Itinerary }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // 0. Parse & validasi input dari request body
    const body: TripFormInput = await req.json();

    const { destination, duration, budget, preferences } = body;

    if (!destination || !duration || !budget) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'destination, duration, dan budget wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Generate itinerary via LLM
    const itineraryData = await generateItinerary({
      destination,
      duration,
      budget,
      preferences: preferences ?? [],
    });

    // 2. Hitung total estimated cost (integer IDR)
    const totalEstimatedCost = Math.round(calculateTotalPrice(itineraryData));

    // 3. Simpan ke database via Prisma
    //    TODO: Ambil userId dari Supabase session / auth header
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

    const saved = await prisma.itinerary.create({
      data: {
        userId: DEMO_USER_ID,
        title: `Trip ke ${destination}`,
        location: destination,
        duration: Number(duration),
        budget: Math.round(Number(budget)),
        preferences: Array.isArray(preferences)
          ? preferences.join(',')
          : '',
        itineraryJson: itineraryData as any,
        totalEstimatedCost,
        status: 'draft',
        isFinal: false,
      },
    });

    // 4. Return objek itinerary yang baru disimpan
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
