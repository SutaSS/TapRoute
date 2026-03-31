'use client';

import { useEffect, useState } from 'react';
import ItineraryCard from '@/components/ItineraryCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Trip, ApiResponse } from '@/types';

// -------------------------------------------------------
// Skeleton untuk loading state
// -------------------------------------------------------
function TripCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
        <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
        <div className="h-3 bg-gray-100 rounded-xl w-1/3" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('/api/trips', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        const json: ApiResponse<Trip[]> = await res.json();
        if (!res.ok || !json.data) throw new Error(json.error ?? 'Gagal memuat trips');
        setTrips(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat trips');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Ambil 3 trip terbaru untuk preview di dashboard
  const recentTrips = trips.slice(0, 6);

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-greenDark/[0.06] border border-greenDark/10 rounded-3xl">

      {/* Banner Area */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] rounded-[2rem] overflow-hidden shadow-sm mb-10">
        <Image src="/images/banner.png" alt="Travel Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-greenDark/95 via-greenDark/75 to-black/15 mix-blend-multiply" />

        <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight font-serif drop-shadow-md">
            Halo, Traveler!
          </h1>
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium max-w-md mb-6 sm:mb-8 leading-relaxed">
            Ready for your next adventure? Let our AI curate the perfect itinerary based on your unique travel style.
          </p>

          <Link href="/dashboard/create" className="inline-flex w-fit items-center gap-2 bg-greenDark/80 hover:bg-greenDark backdrop-blur-md text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-black/10 border border-white/20 transition-all hover:-translate-y-0.5">
            <Sparkles size={18} />
            <span className="text-sm">Plan New Trip with AI</span>
          </Link>
        </div>
      </div>

      {/* Title block */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-serif">My Trips</h2>
        <Link href="/dashboard/my-trips" className="text-blueMedium hover:underline text-xs font-bold flex items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : recentTrips.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-64 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] backdrop-blur-xl rounded-3xl bg-white/40 text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/60 shadow-sm border border-white/50 text-greenDark rounded-full flex items-center justify-center mb-4">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Belum ada perjalanan</h3>
            <p className="text-sm font-medium text-gray-600 max-w-sm mb-6">
              Mulai petualangan pertamamu! Biarkan AI kami merancang itinerary terbaik untukmu.
            </p>
            <Link href="/dashboard/create" className="bg-greenDark/90 backdrop-blur-md border border-white/20 hover:bg-greenDark text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all">
              Buat Trip Pertama
            </Link>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTrips.map((trip) => (
            <ItineraryCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              location={trip.location}
              duration={trip.duration}
              status={trip.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
