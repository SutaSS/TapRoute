'use client';

// ============================================================
// TapRoute — Dashboard Create Page (/dashboard/create)
// ============================================================
// Flow:
//   1. User isi InputForm (destination, duration, budget, preferences)
//   2. Klik "Generate Trip"
//   3. Loading state (skeleton)
//   4. Fetch POST /api/generate
//   5. Redirect ke /dashboard/trip/[id]

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputForm from '@/components/InputForm';
import { TripFormInput, ApiResponse } from '@/types';
import { ArrowLeft } from 'lucide-react';

// -------------------------------------------------------
// Skeleton loading untuk generate state
// -------------------------------------------------------
function GeneratingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full animate-pulse space-y-6 mt-8">
      <div className="h-5 bg-gray-200 rounded-xl w-1/2" />
      <div className="space-y-4">
        {[1, 2, 3].map((d) => (
          <div key={d} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="h-4 bg-gray-200 rounded-xl w-1/3" />
            <div className="space-y-2">
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-gray-400">
        AI is crafting your itinerary, please wait...
      </p>
    </div>
  );
}

export default function DashboardCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

      // Redirect ke halaman detail trip di dalam dashboard
      router.push(`/dashboard/trip/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-greenDark transition-colors mb-4"
          id="back-btn"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Trip</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Tell us your plans, and our AI will craft the best itinerary for you.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Loading Skeleton saat AI generate */}
      {isLoading ? (
        <GeneratingSkeleton />
      ) : (
        <div className="max-w-2xl mx-auto">
          <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
