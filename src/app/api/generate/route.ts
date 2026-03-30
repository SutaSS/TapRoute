// ============================================================
// TapRoute — API: POST /api/generate
// ============================================================
// Menerima form input, generate itinerary via LLM,
// simpan ke database (tabel itineraries), return id trip baru
// Model Prisma: itineraries (sesuai Dbdiagram.MD)

import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary, calculateTotalPrice } from '@/lib/llm';
import prisma from '@/lib/db';
import { TripFormInput, ApiResponse } from '@/types';

// ------------------------------------------------------------
// POST /api/generate
// Body: TripFormInput
// Returns: { data: { id: string } }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body: TripFormInput = await req.json();

    // TODO: Validasi input dengan zod atau manual
    if (!body.destination || !body.duration || !body.budget) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'destination, duration, dan budget wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Generate itinerary via LLM
    const itinerary = await generateItinerary(body);

    // 2. Hitung total_price (integer IDR)
    const total_price = Math.round(calculateTotalPrice(itinerary));

    // 3. Simpan ke database
    // TODO: Ambil user_id dari Supabase session / auth header
    const DEMO_USER_ID = 'demo-user-uuid-001';

    const saved = await prisma.itinerary.create({
      data: {
        user_id: DEMO_USER_ID,
        title: `Trip ke ${body.destination}`,
        location: body.destination,
        duration: body.duration,
        budget: Math.round(body.budget),
        preferences: body.preferences?.join(',') ?? '',
        status: 'draft',
        is_final: false,
        itinerary_data: JSON.stringify(itinerary),
        total_price,
      },
    });

    return NextResponse.json<ApiResponse<{ id: string }>>({
      data: { id: saved.id },
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
