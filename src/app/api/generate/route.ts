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
import { Itinerary, Prisma } from '@prisma/client';

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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

    if (!isUuid(userId)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Session tidak valid. Silakan login ulang.' },
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
    if (!Number.isFinite(basePartnerTotal) || basePartnerTotal < 0) {
      throw new Error('INVALID_ITINERARY_TOTAL');
    }

    const partnerTotal = basePartnerTotal * pax;
    const { user_price } = calculateBookingFee(partnerTotal);
    const totalEstimatedCost = user_price;

    if (!Number.isFinite(totalEstimatedCost) || totalEstimatedCost <= 0) {
      throw new Error('INVALID_TOTAL_ESTIMATED_COST');
    }

    // 3. Simpan ke database via Prisma
    // NOTE: beberapa environment deploy mungkin masih memakai Prisma Client lama
    // yang belum memiliki field `startDate`. Kita fallback otomatis tanpa field tersebut.
    const itineraryCreateData: any = {
      userId,
      title: `Trip ke ${destination}`,
      location: destination,
      duration: Number(duration),
      budget: Math.round(Number(budget)),
      pax: Number(pax),
      preferences: preferences.join(','),
      itineraryJson: itineraryData as any,
      totalEstimatedCost,
      status: 'draft',
      isFinal: false,
    };

    if (startDate) {
      itineraryCreateData.startDate = startDate;
    }

    let saved: Itinerary;
    try {
      saved = await (prisma.itinerary as any).create({ data: itineraryCreateData });
    } catch (createErr) {
      const createMessage = createErr instanceof Error ? createErr.message : String(createErr);
      if (createMessage.includes('Unknown argument `startDate`')) {
        const { startDate: _ignored, ...withoutStartDate } = itineraryCreateData;
        saved = await (prisma.itinerary as any).create({ data: withoutStartDate });
      } else {
        throw createErr;
      }
    }

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

    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('Environment variable not found: DATABASE_URL') || message.includes('Environment variable not found: DIRECT_URL')) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Konfigurasi database di server belum lengkap (DATABASE_URL / DIRECT_URL).' },
        { status: 500 }
      );
    }

    if (message.includes('invalid input syntax for type uuid')) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Session user tidak valid. Silakan logout-login lalu coba lagi.' },
        { status: 401 }
      );
    }

    if (message.startsWith('Gagal menghubungi Groq API')) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Layanan AI sedang bermasalah. Coba lagi beberapa saat.' },
        { status: 502 }
      );
    }

    if (message === 'INVALID_ITINERARY_TOTAL' || message === 'INVALID_TOTAL_ESTIMATED_COST') {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Output AI belum valid untuk dihitung. Coba generate ulang.' },
        { status: 502 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P1001') {
        return NextResponse.json<ApiResponse<null>>(
          { error: 'Database tidak bisa diakses dari server saat ini.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        error: process.env.NODE_ENV === 'production'
          ? 'Gagal generate itinerary. Coba lagi.'
          : `Gagal generate itinerary. Detail: ${message}`,
      },
      { status: 500 }
    );
  }
}
