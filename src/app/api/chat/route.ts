import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import Groq from 'groq-sdk';

// Lazy init: jangan buat client di module level agar env var sudah tersedia
const MODEL = 'llama-3.1-8b-instant';

// System prompt untuk AI agar bertindak sebagai chat agent yang mengumpulkan data
const CHAT_SYSTEM_PROMPT = `You are Terra, a friendly and professional AI Travel Assistant / Tour Guide for TapRoute.
Your goal is to gather 6 specific pieces of information from the user to help plan their trip:
1. Destination (Kota tujuan)
2. Duration (Lama wisata dalam hitungan hari)
3. Start Date (Tanggal mulai trip, e.g. "12 Agustus")
4. Budget (Anggaran maksimal dalam Rupiah)
5. Pax (Jumlah orang yang akan berangkat)
6. Preferences (Gaya liburan, misal wisata alam, kuliner, budaya, dsb)

RULES:
- Be conversasional, natural, and helpful. Use Indonesian language (santai tapi sopan, seperti teman).
- As a tour guide, ask how many people are going (pax) and what date they want to start.
- If the user says something entirely unrelated to travel (like "I don't want to travel" or random jokes), respond naturally and try to pivot back to planning a trip, or just chat with them.
- DO NOT ask all questions at once if the user gives a short answer.
- If the user provides multiple pieces of information at once, acknowledge them and ask for the missing ones.
- ONCE you have gathered all 6 pieces of information confidently, you MUST output a STRICT JSON block AT THE VERY END of your message (after your natural conversational sign-off) in this EXACT format:
  {"action": "DONE", "data": {"destination": "...", "duration": 3, "startDate": "2026-08-12", "budget": 2000000, "pax": 2, "preferences": ["...", "..."]}}
- Do not output this JSON until you are 100% sure you have all 6 pieces.
- Ensure duration and pax are integers, and budget is an integer (IDR).
- Convert the Start Date into an ISO string "YYYY-MM-DD" in the JSON data.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Format pesan tidak valid.' },
        { status: 400 }
      );
    }

    // Format pesan untuk Groq (tambahkan system prompt di awal)
    const formattedMessages: any[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: (m.sender === 'ai' || m.role === 'assistant' ? 'assistant' : 'user'),
        content: m.text || m.content,
      }))
    ];

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { reply: 'System error: GROQ_API_KEY is missing. I cannot chat right now.' }
      );
    }

    // Lazy init Groq client
    const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Maaf, aku tidak mengerti maksudmu.';

    // Cek apakah ada JSON output (action: DONE)
    let extractedData = null;
    let cleanReply = reply;
    
    // Gunakan regex untuk mencari objek JSON yang memiliki action: DONE
    const jsonRegex = /{[^{}]*"action"\s*:\s*"DONE"[^{}]*(?:{[^{}]*}[^{}]*)*}/g;
    const match = reply.match(jsonRegex);
    
    if (match) {
      try {
        const parsed = JSON.parse(match[match.length - 1]); // Ambil json terakhir jika ada beberapa
        if (parsed.action === 'DONE' && parsed.data) {
          extractedData = parsed.data;
          // Bersihkan JSON dari string reply agar user tidak melihatnya
          cleanReply = reply.replace(match[match.length - 1], '').trim();
        }
      } catch(e) {
        console.error("Gagal parse JSON dari Groq", e);
      }
    }

    return NextResponse.json({
      reply: cleanReply,
      extractedData,
    });

  } catch (error) {
    console.error('[API/chat] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal menghubungi AI.' },
      { status: 500 }
    );
  }
}
