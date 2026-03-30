// ============================================================
// TapRoute — LLM Integration (Groq / OpenAI compatible)
// ============================================================
// TODO: Install SDK yang sesuai
//   - Groq: npm install groq-sdk
//   - OpenAI: npm install openai
// TODO: Set API key di .env → GROQ_API_KEY atau OPENAI_API_KEY

import { DayItinerary, TripFormInput, EditPayload } from '@/types';
import { buildGeneratePrompt, buildEditPrompt, SYSTEM_PROMPT } from '@/lib/prompts';

// ------------------------------------------------------------
// LLM Client Setup
// ------------------------------------------------------------
// TODO: Uncomment salah satu sesuai provider yang dipakai

// --- Option A: Groq ---
// import Groq from 'groq-sdk';
// const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const MODEL = 'llama3-8b-8192'; // atau mixtral-8x7b-32768

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
  // TODO: Implementasikan sesuai provider

  // --- Contoh Groq ---
  // const completion = await client.chat.completions.create({
  //   model: MODEL,
  //   messages: [
  //     { role: 'system', content: SYSTEM_PROMPT },
  //     { role: 'user', content: userPrompt },
  //   ],
  //   temperature: 0.7,
  //   max_tokens: 4096,
  // });
  // return completion.choices[0].message.content ?? '';

  // --- MOCK: untuk development tanpa API key ---
  console.warn('[LLM] Using MOCK response. Set API key di .env untuk produksi.');
  return JSON.stringify(getMockItinerary());
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
// calculateTotalPrice — hitung total dari semua activities
// ------------------------------------------------------------
export function calculateTotalPrice(itinerary: DayItinerary[]): number {
  return itinerary.reduce((total, day) => {
    const dayTotal = day.activities.reduce((sum, act) => sum + act.estimated_price, 0);
    return total + dayTotal;
  }, 0);
}

// ------------------------------------------------------------
// calculateBookingFee — hitung platform fee & UMKM revenue
// ------------------------------------------------------------
export function calculateBookingFee(price: number): {
  platform_fee: number;
  umkm_revenue: number;
} {
  const platform_fee = Math.round(price * 0.1);   // 10%
  const umkm_revenue = price - platform_fee;       // 90%
  return { platform_fee, umkm_revenue };
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
