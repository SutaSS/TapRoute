'use client';

// ============================================================
// TapRoute — Create Page (/create)
// ============================================================
// Flow:
//   1. User isi InputForm
//   2. Klik "Generate Trip"
//   3. Loading state ("AI is crafting your trip...")
//   4. Redirect ke /trip/[id] setelah selesai

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InputForm from '@/components/InputForm';
import { TripFormInput, ApiResponse } from '@/types';

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function CreatePage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect public /create to the Dashboard chat interface
    router.push('/dashboard/create');
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center bg-gray-950 px-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-greenDark/30 to-gray-900/50" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-6 sm:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-pulse text-center">
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-lg mb-2">
          <img src="/images/logo-2.png" alt="TapRoute Logo" width={80} height={80} className="rounded-2xl object-cover" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2 font-serif drop-shadow-sm">Redirecting to AI Concierge...</h2>
          <p className="text-sm text-white/70 font-medium">Mohon tunggu sebentar, kami sedang menyiapkan asisten pintar untukmu.</p>
        </div>
      </div>
    </main>
  );
}
