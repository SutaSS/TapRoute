// ============================================================
// TapRoute — API: POST /api/generate
// ============================================================
// Menerima form input, generate itinerary via LLM,
// simpan ke database (tabel itineraries), return objek itinerary
// Model Prisma: Itinerary (mapped ke tabel 'itineraries')

import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary, calculateTotalPrice, calculateBookingFee } from '@/lib/llm';
import prisma from '@/lib/db';
import { ApiResponse } from '@/types';
import { Itinerary } from '@prisma/client';

import { cookies } from 'next/headers';

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = Math.round(value);
    return normalized > 0 ? normalized : null;
  }

  if (typeof value === 'string') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) return null;
    const parsed = Number(digitsOnly);
    if (!Number.isFinite(parsed)) return null;
    return parsed > 0 ? parsed : null;
  }

  return null;
}

function parseOptionalDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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
    const body = await req.json() as Record<string, unknown>;

    const destination = typeof body.destination === 'string' ? body.destination.trim() : '';
    const duration = parsePositiveInt(body.duration);
    const budget = parsePositiveInt(body.budget);
    const pax = parsePositiveInt(body.pax);
    const startDate = parseOptionalDate(body.startDate);

    const preferences = Array.isArray(body.preferences)
      ? body.preferences.filter((p): p is string => typeof p === 'string').map((p) => p.trim()).filter(Boolean)
      : typeof body.preferences === 'string'
        ? body.preferences.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [];

    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!destination || !duration || !budget || !pax) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Format data belum valid. Pastikan destination, duration, pax, dan budget terisi benar.' },
        { status: 400 }
      );
    }

    if (body.startDate && !startDate) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Format tanggal mulai tidak valid. Gunakan format tanggal yang benar.' },
        { status: 400 }
      );
    }

    // 1. Generate itinerary via LLM
    const itineraryData = await generateItinerary({
      destination,
      duration,
      budget,
      pax,
      startDate: startDate ? startDate.toISOString().slice(0, 10) : undefined,
      preferences,
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
        preferences: preferences.join(','),
        startDate,
        itineraryJson: itineraryData as any,
        totalEstimatedCost,
        status: 'draft',
        isFinal: false,
      },
    });

    // 4. Jika ada obrolan sebelumnya, simpan riwayat chat ke DB
    if (messages.length > 0) {
      await (prisma as any).chatMessage.createMany({
        data: messages
          .map(m => ({
          itineraryId: saved.id,
          sender: m.sender || 'user',
          text: typeof m.text === 'string' ? m.text : typeof m.content === 'string' ? m.content : '',
        }))
          .filter((m) => m.text.trim().length > 0)
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
