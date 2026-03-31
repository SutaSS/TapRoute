'use client';

// ============================================================
// TapRoute — Dashboard Create Page (Real AI Chatbot)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { TripFormInput, ApiResponse } from '@/types';

// State Enum untuk pertanyaan AI
type ChatStep = 'CHATTING' | 'CONFIRMATION' | 'GENERATING' | 'DONE';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function DashboardCreateChatPage() {
  const router = useRouter();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Halo! Aku AI Assistant TapRoute. Ke kota mana kamu berencana liburan kali ini, dan berapa harinya?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<ChatStep>('CHATTING');
  const [pendingData, setPendingData] = useState<TripFormInput | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Fungsi generate
  const handleGenerate = async (finalData: TripFormInput, history?: Message[]) => {
    setError('');
    
    try {
      const payload = { ...finalData, messages: history };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<{ id: string }> = await res.json();

      if (!res.ok || !json.data?.id) {
        throw new Error(json.error ?? 'Gagal generate itinerary (apakah kamu sudah login?)');
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: 'Itinerary beres! Mengarahkan ke rincian perjalanan...' }]);
      setStep('DONE');
      const tripId = json.data.id;
      setTimeout(() => {
        window.location.href = `/dashboard/trip/${tripId}`;
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat generate. Mohon ulangi atau login.');
      setStep('CHATTING'); // Boleh chat lagi
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const newSystemMessages = [...messages, { id: Date.now().toString(), sender: 'user', text }] as Message[];
    setMessages(newSystemMessages);
    setInputValue('');
    setError('');
    setIsTyping(true);

    try {
      // 1. Panggil /api/chat yang kita buat untuk LLM real API (Groq)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newSystemMessages.slice(1) }), // history
      });
      
      const data = await res.json();
      setIsTyping(false);

      if (!res.ok) {
        throw new Error(data.error || 'Server error.');
      }

      if (data.reply) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: data.reply }]);
      }

      // 2. Jika AI memberi signal punya structured extraction, pindah ke CONFIRMATION
      if (data.extractedData) {
        setStep('CONFIRMATION');
        // Jangan langsung generate. Tampilkan tombol konfirmasi.
        const dest = data.extractedData.destination || '-';
        const durText = data.extractedData.duration ? `${data.extractedData.duration} hari` : '-';
        const startDateText = data.extractedData.startDate ? data.extractedData.startDate : '-';
        const paxText = data.extractedData.pax ? `${data.extractedData.pax} orang` : '-';
        const budgetText = data.extractedData.budget ? `Rp ${data.extractedData.budget.toLocaleString('id-ID')}` : '-';
        
        const confirmText = `Sip! Aku udah kumpulin informasinya nih:\n\n- Tujuan: **${dest}**\n- Durasi: **${durText}**\n- Tanggal: **${startDateText}**\n- Jumlah: **${paxText}**\n- Budget: **${budgetText}**\n\nApakah semuanya sudah pas, atau ada yang ingin kamu ganti lagi?`;
        
        const finishedMessages = [...newSystemMessages, { id: Date.now().toString(), sender: 'ai', text: confirmText } as Message];
        setMessages(finishedMessages);
        
        // Simpan extraction ke state tersembunyi untuk diproses kalau di-'Setuju'
        // Karena react state async, lebih gampang ditaruh di state baru
        setPendingData(data.extractedData);
      }

    } catch (e: any) {
      setIsTyping(false);
      setError(e.message || 'Gagal tersambung ke layanan AI.');
    }
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-[calc(100dvh-76px)] md:h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="mb-4 shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-greenDark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 tracking-tight">AI Trip Planner</h1>
        <p className="text-sm md:text-base font-medium text-gray-500 mt-2">
          Chat aja dengan asisten kami dan jadwal liburan idamanmu siap seketika.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-4 shrink-0" role="alert">
          {error}
        </div>
      )}

      {/* Chat Area Container */}
      <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col overflow-hidden">
        
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm md:text-base font-medium backdrop-blur-md ${
                msg.sender === 'user' 
                  ? 'bg-greenDark/90 text-white shadow-lg shadow-greenDark/20 rounded-br-sm border border-greenDark/20' 
                  : 'bg-white/60 border border-white/80 text-gray-800 shadow-sm whitespace-pre-wrap'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {(isTyping || step === 'GENERATING') && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/60 backdrop-blur-md border border-white/80 text-gray-800 shadow-sm rounded-3xl px-5 py-3.5 text-sm md:text-base font-medium flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-greenDark/70 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-greenDark animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-greenDark animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Confirmation Area */}
        {step === 'CONFIRMATION' && pendingData && (
          <div className="p-4 bg-green-50 border-t border-green-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0 animate-in slide-in-from-bottom-2">
            <button
              onClick={() => {
                setStep('CHATTING');
                setPendingData(null);
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: 'Tunggu, aku mau ubah sedikit nih.' }]);
              }}
              className="px-6 py-3 font-semibold text-sm text-gray-700 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/60 rounded-full transition-colors order-2 sm:order-1 shadow-sm"
            >
              Tunggu, ada yang salah
            </button>
            <button
              onClick={() => {
                setStep('GENERATING');
                const generationMessages = [...messages, { id: Date.now().toString(), sender: 'user', text: 'Ya, semua sudah benar. Tolong generate sekarang!' } as Message, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Baik! Sedang memproses AI generatif... (Ini memakan waktu sekitar 10 detik)' } as Message];
                setMessages(generationMessages);
                handleGenerate(pendingData, generationMessages);
              }}
              className="px-6 py-3 font-semibold text-sm text-white bg-greenDark/90 backdrop-blur-md hover:bg-greenDark rounded-full shadow-lg border border-greenDark/20 transition-colors order-1 sm:order-2"
            >
              Ya, Generate Sekarang!
            </button>
          </div>
        )}

        {/* Input Area */}
        {step !== 'CONFIRMATION' && (
          <div className="p-4 bg-white/30 backdrop-blur-lg border-t border-white/50 flex gap-3 shrink-0">
            <input
              autoFocus
              type="text"
              className="flex-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-full px-6 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-greenDark/30 disabled:opacity-50 shadow-sm"
              placeholder={step === 'GENERATING' || step === 'DONE' ? 'Processing...' : isTyping ? 'Terra is thinking...' : 'Ketik jawabanmu di sini...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={step === 'GENERATING' || step === 'DONE' || isTyping}
            />
            <button
              title="Send"
              onClick={handleSend}
              disabled={!inputValue.trim() || step === 'GENERATING' || step === 'DONE' || isTyping}
              className="w-12 h-12 flex items-center justify-center bg-greenDark hover:bg-[#20401b] transition-colors rounded-full shadow-md text-white disabled:opacity-50"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
