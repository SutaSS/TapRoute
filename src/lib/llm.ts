// ============================================================
// TapRoute — LLM Integration (Groq / OpenAI compatible)
// ============================================================
// TODO: Install SDK yang sesuai
//   - Groq: npm install groq-sdk
//   - OpenAI: npm install openai
// TODO: Set API key di .env → GROQ_API_KEY atau OPENAI_API_KEY

import { buildEditPrompt, buildGeneratePrompt, SYSTEM_PROMPT } from '@/lib/prompts';
import { DayItinerary, EditPayload, TripFormInput } from '@/types';

// ------------------------------------------------------------
// LLM Client Setup
// ------------------------------------------------------------
// TODO: Uncomment salah satu sesuai provider yang dipakai

// --- Option A: Groq ---
import Groq from 'groq-sdk';
// Lazy init: client diinisialisasi di dalam callLLM() agar env var sudah tersedia
const MODEL = 'llama-3.1-8b-instant';

// --- Option B: OpenAI ---
// import OpenAI from 'openai';
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const MODEL = 'gpt-3.5-turbo';

function parseNonNegativeInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) return 0;
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }

  return 0;
}

function normalizeItinerary(parsed: unknown): DayItinerary[] {
  if (!Array.isArray(parsed)) {
    throw new Error('LLM response is not an array');
  }

  const normalized = parsed
    .map((rawDay, idx) => {
      if (!rawDay || typeof rawDay !== 'object') return null;

      const dayObj = rawDay as Record<string, unknown>;
      const dayNumberRaw = parseNonNegativeInt(dayObj.day);
      const dayNumber = dayNumberRaw > 0 ? dayNumberRaw : idx + 1;

      const rawActivities = Array.isArray(dayObj.activities) ? dayObj.activities : [];
      const activities = rawActivities
        .map((rawAct) => {
          if (!rawAct || typeof rawAct !== 'object') return null;

          const act = rawAct as Record<string, unknown>;
          const placeName = typeof act.place_name === 'string' ? act.place_name.trim() : '';
          const description = typeof act.description === 'string' ? act.description.trim() : '';
          const estimatedPrice = parseNonNegativeInt(act.estimated_price);

          const category: 'destination' | 'umkm' =
            act.category === 'umkm' || act.umkm_flag === true ? 'umkm' : 'destination';
          const umkmFlag = category === 'umkm';
          const bookingAvailable = umkmFlag ? true : false;

          if (!placeName) return null;

          return {
            place_name: placeName,
            description: description || 'Aktivitas wisata lokal.',
            estimated_price: estimatedPrice,
            category,
            booking_available: bookingAvailable,
            umkm_flag: umkmFlag,
          };
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      if (activities.length === 0) return null;

      return {
        day: dayNumber,
        activities,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  if (normalized.length === 0) {
    throw new Error('LLM itinerary is empty after normalization');
  }

  return normalized;
}

// ------------------------------------------------------------
// parseItinerary — parse JSON response dari LLM
// ------------------------------------------------------------
function parseItinerary(raw: string): DayItinerary[] {
  try {
    // Cari JSON array di dalam response (termasuk jika LLM membungkus dengan teks atau markdown)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('LLM response does not contain a JSON array');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return normalizeItinerary(parsed);
  } catch (err) {
    console.error('[LLM] Failed to parse itinerary. Raw output:', raw.substring(0, 200), err);
    throw new Error('Gagal memproses data dari LLM (tidak sesuai format JSON)');
  }
}

// ------------------------------------------------------------
// callLLM — raw API call
// ------------------------------------------------------------
async function callLLM(userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  // Fallback ke mock jika GROQ_API_KEY belum diset
  if (!apiKey) {
    console.warn('[LLM] GROQ_API_KEY belum diset. Menggunakan MOCK response.');
    return JSON.stringify(getMockItinerary());
  }

  // Lazy init client dengan apiKey yang sudah pasti ada
  const groqClient = new Groq({ apiKey });

  try {
    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned empty response');
    }

    return content;
  } catch (err: any) {
    console.error('[LLM] Groq API error:', err?.status, err?.message);
    throw new Error(`Gagal menghubungi Groq API: ${err?.message ?? 'Unknown error'}`);
  }
}

// ------------------------------------------------------------
// generateItinerary — generate itinerary baru dari form input
// ------------------------------------------------------------
export async function generateItinerary(input: TripFormInput): Promise<DayItinerary[]> {
  const prompt = buildGeneratePrompt(input);
  try {
    const raw = await callLLM(prompt);
    return parseItinerary(raw);
  } catch (err) {
    console.warn('[LLM] Generate gagal, fallback ke mock itinerary.', err);
    return getMockItinerary();
  }
}

// ------------------------------------------------------------
// editItinerary — modifikasi parsial itinerary
// ------------------------------------------------------------
export async function editItinerary(payload: EditPayload): Promise<DayItinerary[]> {
  const prompt = buildEditPrompt(payload.current_itinerary, payload.user_request);
  try {
    const raw = await callLLM(prompt);
    return parseItinerary(raw);
  } catch (err) {
    console.warn('[LLM] Edit gagal, fallback ke itinerary lama.', err);
    return payload.current_itinerary;
  }
}

// ------------------------------------------------------------
// calculateTotalPrice — hitung total partner_price dari semua activities
// Ini adalah total harga dari partner (belum termasuk platform fee)
// ------------------------------------------------------------
export function calculatePartnerTotal(itinerary: DayItinerary[]): number {
  return itinerary.reduce((total, day) => {
    const dayTotal = day.activities.reduce((sum, act) => sum + act.estimated_price, 0);
    return total + dayTotal;
  }, 0);
}

// Alias — backward-compatible
export const calculateTotalPrice = calculatePartnerTotal;

// ------------------------------------------------------------
// calculateBookingFee — sesuai coreSystem.MD:
//   partner_price  = harga dari partner/UMKM
//   platform_fee   = 10% dari partner_price (ditambahkan di atas)
//   user_price     = partner_price + platform_fee
//
// Contoh: partner_price=100000, platform_fee=10000, user_price=110000
// ------------------------------------------------------------
export function calculateBookingFee(partnerPrice: number): {
  partner_price: number;
  platform_fee: number;
  user_price: number;
} {
  const platform_fee = Math.round(partnerPrice * 0.1);   // 10% komisi TapRoute
  const user_price = partnerPrice + platform_fee;          // harga yang user bayar
  return { partner_price: partnerPrice, platform_fee, user_price };
}

// ------------------------------------------------------------
// getMockItinerary — data dummy untuk development
// ------------------------------------------------------------
function getMockItinerary(): DayItinerary[] {
  return [
    {
      day: 1,
      activities: [
        {
          place_name: 'Pantai Kuta',
          description: 'Pantai ikonik Bali dengan ombak terbaik untuk bersantai.',
          estimated_price: 50000,
          category: 'destination',
          booking_available: false,
          umkm_flag: false,
        },
        {
          place_name: 'Warung Mak Beng',
          description: 'Warung seafood lokal yang terkenal dengan ikan goreng renyah.',
          estimated_price: 75000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
        {
          place_name: 'Pasar Seni Sukawati',
          description: 'Pasar kerajinan tangan dan oleh-oleh khas Bali.',
          estimated_price: 100000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
      ],
    },
    {
      day: 2,
      activities: [
        {
          place_name: 'Tanah Lot',
          description: 'Pura di atas batu karang dengan pemandangan matahari terbenam.',
          estimated_price: 60000,
          category: 'destination',
          booking_available: false,
          umkm_flag: false,
        },
        {
          place_name: 'Kopi Bali Bu Ayu',
          description: 'Kedai kopi lokal dengan kopi Bali asli dan jajanan tradisional.',
          estimated_price: 35000,
          category: 'umkm',
          booking_available: true,
          umkm_flag: true,
        },
      ],
    },
  ];
}
