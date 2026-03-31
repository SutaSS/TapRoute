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
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile'; // atau mixtral-8x7b-32768

// --- Option B: OpenAI ---
// import OpenAI from 'openai';
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const MODEL = 'gpt-3.5-turbo';

// ------------------------------------------------------------
// parseItinerary — parse JSON response dari LLM
// ------------------------------------------------------------
function parseItinerary(raw: string): DayItinerary[] {
  // TODO: Tambahkan error handling yang lebih robust
  try {
    // Hapus markdown code block jika ada
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('LLM response is not an array');
    }

    return parsed as DayItinerary[];
  } catch (err) {
    console.error('[LLM] Failed to parse itinerary:', err);
    throw new Error('Failed to parse itinerary from LLM response');
  }
}

// ------------------------------------------------------------
// callLLM — raw API call
// ------------------------------------------------------------
async function callLLM(userPrompt: string): Promise<string> {
  // Fallback ke mock jika GROQ_API_KEY belum diset
  if (!process.env.GROQ_API_KEY) {
    console.warn('[LLM] GROQ_API_KEY belum diset. Menggunakan MOCK response.');
    return JSON.stringify(getMockItinerary());
  }

  // Panggil Groq API
  const completion = await client.chat.completions.create({
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
}

// ------------------------------------------------------------
// generateItinerary — generate itinerary baru dari form input
// ------------------------------------------------------------
export async function generateItinerary(input: TripFormInput): Promise<DayItinerary[]> {
  const prompt = buildGeneratePrompt(input);
  const raw = await callLLM(prompt);
  return parseItinerary(raw);
}

// ------------------------------------------------------------
// editItinerary — modifikasi parsial itinerary
// ------------------------------------------------------------
export async function editItinerary(payload: EditPayload): Promise<DayItinerary[]> {
  const prompt = buildEditPrompt(payload.current_itinerary, payload.user_request);
  const raw = await callLLM(prompt);
  return parseItinerary(raw);
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
