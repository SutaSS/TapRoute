import { ApiResponse } from '@/types';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

// Lazy init: jangan buat client di module level agar env var sudah tersedia
const MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Format pesan tidak valid.' },
        { status: 400 }
      );
    }

    // --- TAMBAHKAN LOGIKA TANGGAL DI SINI (Dinamis setiap ada request) ---
    const today = new Date();
    const dateString = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

const CHAT_SYSTEM_PROMPT = `You are Terra, a friendly and professional AI Travel Assistant / Tour Guide for TapRoute.
IMPORTANT: Today is ${dateString}. Use this as your reference for relative dates like "tomorrow" or "two days from now".

Your goal is to gather 6 specific pieces of information from the user to help plan their trip:
1. Destination (Kota tujuan)
2. Duration (Lama wisata dalam hitungan hari)
3. Start Date (Tanggal mulai trip)
4. Budget (Anggaran maksimal dalam Rupiah)
5. Pax (Jumlah orang yang akan berangkat)
6. Preferences (Gaya liburan, misal wisata alam, kuliner, budaya, dsb)

RULES:
- Be conversasional, natural, and helpful. Use Indonesian language (santai tapi sopan, seperti teman).
- As a tour guide, ask how many people are going (pax) and what date they want to start.
- If the user says something entirely unrelated to travel, respond naturally and try to pivot back.
- DO NOT ask all questions at once if the user gives a short answer.
- IMPORTANT: Do not tell the user to use specific formats like "YYYY-MM-DD" or "Rp 1.000.000". Just ask for the information naturally.
- ONCE you have gathered all 6 pieces of information confidently, you MUST output a STRICT JSON block AT THE VERY END of your message in this EXACT format:
  {"action": "DONE", "data": {"destination": "...", "duration": 3, "startDate": "YYYY-MM-DD", "budget": 2000000, "pax": 2, "preferences": ["...", "..."]}}
- Convert the Start Date into an ISO string "YYYY-MM-DD" based on today's reference (${dateString}) only in the JSON output.
`;

    // Format pesan untuk Groq (Menggunakan logika map dari kode lama kamu yang sudah jalan)
    const formattedMessages: any[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: (m.sender === 'ai' || m.role === 'assistant' ? 'assistant' : 'user'),
        content: m.text || m.content,
      }))
    ];

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { reply: 'System error: GROQ_API_KEY is missing.' }
      );
    }

    const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Maaf, aku tidak mengerti maksudmu.';

    // Logika pembersihan JSON (Tetap menggunakan kode lama kamu yang sudah stabil)
    let extractedData = null;
    let cleanReply = reply;
    
    const jsonRegex = /{[^{}]*"action"\s*:\s*"DONE"[^{}]*(?:{[^{}]*}[^{}]*)*}/g;
    const match = reply.match(jsonRegex);
    
    if (match) {
      try {
        const parsed = JSON.parse(match[match.length - 1]);
        if (parsed.action === 'DONE' && parsed.data) {
          extractedData = parsed.data;
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