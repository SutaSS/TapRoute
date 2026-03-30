'use client';

// ============================================================
// TapRoute — Create Page (/create)
// ============================================================
// Flow:
//   1. User isi InputForm
//   2. Klik "Generate Trip"
//   3. Loading state ("AI is crafting your trip...")
//   4. Redirect ke /trip/[id] setelah selesai

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputForm from '@/components/InputForm';
import { TripFormInput, ApiResponse } from '@/types';

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  // ------------------------------------------------------------
  // handleGenerate — kirim form ke /api/generate, redirect ke trip
  // ------------------------------------------------------------
  const handleGenerate = async (formData: TripFormInput) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json: ApiResponse<{ id: string }> = await res.json();

      if (!res.ok || !json.data?.id) {
        throw new Error(json.error ?? 'Gagal generate itinerary');
      }

      // Redirect ke halaman detail trip
      router.push(`/trip/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setIsLoading(false);
    }
    // Note: tidak set isLoading false jika sukses karena langsung redirect
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <main className="create-page">
      {/* Header */}
      <header className="create-header">
        <h1 className="create-title">✨ Create New Trip</h1>
        <p className="create-subtitle">
          Ceritakan rencana perjalananmu, dan AI kami akan meracik itinerary terbaik!
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="error-banner" role="alert">
          ❌ {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="loading-state loading-state--generate" aria-live="polite">
          <div className="ai-loading-animation">
            <div className="ai-pulse" />
            <div className="ai-pulse ai-pulse--delay1" />
            <div className="ai-pulse ai-pulse--delay2" />
          </div>
          <p className="loading-text">🤖 AI is crafting your trip...</p>
          <p className="loading-subtext">
            Kami sedang menyusun itinerary terbaik untukmu termasuk rekomendasi UMKM lokal 🏪
          </p>
        </div>
      ) : (
        /* Input Form */
        <section className="create-form-section">
          <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
        </section>
      )}

      {/* Back to Dashboard */}
      {!isLoading && (
        <div className="create-footer">
          <button
            className="btn-ghost"
            onClick={() => router.push('/dashboard')}
            id="back-to-dashboard-btn"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      )}
    </main>
  );
}
