// ============================================================
// TapRoute — LLM Prompt Templates
// ============================================================
// TODO: Sesuaikan prompt dengan model yang digunakan (Groq / OpenAI / Gemini)

import { TripFormInput, DayItinerary } from '@/types';

// ------------------------------------------------------------
// Prompt: Generate Itinerary
// ------------------------------------------------------------
/**
 * Menghasilkan prompt untuk generate itinerary baru.
 * Output LLM HARUS berupa JSON array DayItinerary[].
 */
export function buildGeneratePrompt(input: TripFormInput): string {
  const { destination, duration, budget, preferences } = input;
  const prefsText = preferences.length > 0 ? preferences.join(', ') : 'general tourism';

  return `
You are a professional travel planner specializing in Indonesian local tourism and UMKM (small business) promotion.

Generate a structured travel itinerary in VALID JSON format ONLY. No markdown, no explanation.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Budget: IDR ${budget.toLocaleString('id-ID')} total
- Preferences: ${prefsText}

Required JSON structure:
[
  {
    "day": 1,
    "activities": [
      {
        "place_name": "string",
        "description": "string (max 100 chars)",
        "estimated_price": number (in IDR),
        "category": "destination" | "umkm",
        "booking_available": boolean,
        "umkm_flag": boolean
      }
    ]
  }
]

Rules:
1. Generate exactly ${duration} day(s)
2. Each day MUST have at least 2-4 activities
3. Day 1 MUST include 1 Hotel / Accommodation recommendation for check-in
4. At least 30% of activities must be UMKM (set umkm_flag: true, category: "umkm")
5. Use realistic Indonesian pricing
6. booking_available: true only for UMKM entries
6. Sum of estimated_price across all activities should not exceed IDR ${budget.toLocaleString('id-ID')}
7. Output ONLY valid JSON array, nothing else
`.trim();
}

// ------------------------------------------------------------
// Prompt: Edit Itinerary (Partial Modification)
// ------------------------------------------------------------
/**
 * Menghasilkan prompt untuk modifikasi parsial itinerary.
 * LLM HANYA memodifikasi bagian yang diminta, sisanya tetap.
 */
export function buildEditPrompt(
  currentItinerary: DayItinerary[],
  userRequest: string
): string {
  return `
You are a travel planner assistant. Modify the following itinerary based on the user's request.

IMPORTANT RULES:
1. Only modify what the user requested
2. Do NOT regenerate the entire itinerary
3. Keep all other days and activities unchanged
4. Return the COMPLETE itinerary as valid JSON array
5. Output ONLY valid JSON, no explanation

User Request: "${userRequest}"

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

Return the modified itinerary in the SAME JSON structure as above.
`.trim();
}

// ------------------------------------------------------------
// Prompt: System Message (untuk chat-based API)
// ------------------------------------------------------------
export const SYSTEM_PROMPT = `
You are TapRoute AI — a smart travel planner that specializes in Indonesian destinations and local UMKM promotion.
Always respond with valid JSON only when generating or editing itineraries.
`.trim();
