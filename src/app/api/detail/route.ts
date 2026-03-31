import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { place_name, location } = await req.json();

    if (!place_name) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'place_name dibutuhkan.' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        detail: `[Mode Mockup] ${place_name} adalah salah satu destinasi yang menarik. Sayangnya, kunci API Groq belum disetel untuk menghasilkan deskripsi lengkap. Tempat ini menawarkan pengalaman wisata yang tak terlupakan!`
      });
    }

    const systemPrompt = `You are a professional Tour Guide for TapRoute traveling in Indonesia.
The user wants to know more about a specific place in their itinerary.
Write a fun, engaging, and rich description (around 2-3 short paragraphs) explaining:
- What this place is
- What people usually do there
- Insider tips (e.g., best time to visit, what to eat, or what to bring)

Use Indonesian language (santai tapi sopan, seperti tour guide lokal).
`;

    const userPrompt = `Ceritakan tentang ${place_name} di ${location || 'Indonesia'}.`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const detail = completion.choices[0]?.message?.content || 'Deskripsi tidak tersedia.';

    return NextResponse.json({ detail });

  } catch (error) {
    console.error('[API/detail] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal mengambil detail dari AI.' },
      { status: 500 }
    );
  }
}
