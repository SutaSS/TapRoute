'use client';

import { useEffect, useState } from 'react';
import ItineraryCard from '@/components/ItineraryCard';
import { Compass, Clock, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { Trip, ApiResponse } from '@/types';

// -------------------------------------------------------
// Skeleton
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

type TabType = 'ongoing' | 'history' | 'draft';

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      setError('');
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

  // Filter trips berdasarkan tab
  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'ongoing') return trip.status === 'planned' || trip.status === 'paid';
    if (activeTab === 'history') return trip.status === 'completed';
    if (activeTab === 'draft') return trip.status === 'draft';
    return false;
  });

  const tabLabel: Record<TabType, string> = {
    ongoing: 'ongoing',
    history: 'history',
    draft: 'draft',
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-2rem)]">

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">My Trips</h1>
          <p className="text-sm font-medium text-gray-500">Manage your past, current, and future journeys.</p>
        </div>
        <Link
          href="/dashboard/create"
          className="hidden sm:flex items-center gap-2 bg-greenDark hover:bg-[#20401b] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Create New Trip
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-full sm:w-fit mb-8 shadow-inner overflow-x-auto">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ongoing' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Compass size={16} />
          <span className="hidden sm:inline">Ongoing</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle size={16} />
          <span className="hidden sm:inline">History</span>
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'draft' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Clock size={16} />
          <span className="hidden sm:inline">Drafts</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
          {filteredTrips.map((trip) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center px-4 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-16 h-16 bg-beigeLight text-greenDark rounded-full flex items-center justify-center mb-4">
            <Compass size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {tabLabel[activeTab]} trips found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mb-6">
            {activeTab === 'history'
              ? 'Selesaikan pembayaran trip untuk melihatnya di sini.'
              : "Belum ada perjalanan. Buat yang baru sekarang!"}
          </p>
          <Link
            href="/dashboard/create"
            className="bg-greenDark hover:bg-[#20401b] text-white px-6 py-3 rounded-full font-bold text-sm shadow-sm transition-all shadow-greenDark/20 hover:shadow-greenDark/40"
          >
            Create Itinerary
          </Link>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/dashboard/create"
        className="flex sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-greenDark text-white rounded-full items-center justify-center shadow-2xl z-50 hover:scale-105 transition-transform"
        aria-label="Create new trip"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
