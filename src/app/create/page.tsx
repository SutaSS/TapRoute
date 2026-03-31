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
    <main className="create-page flex items-center justify-center min-h-screen bg-beigeLight">
      <div className="text-center p-8 animate-pulse">
        <h2 className="text-xl font-bold text-greenDark mb-2">Redirecting to AI Concierge...</h2>
        <p className="text-sm text-gray-500">Mohon tunggu sebentar, kami sedang menyiapkan asisten pintar untukmu.</p>
      </div>
    </main>
  );
}
