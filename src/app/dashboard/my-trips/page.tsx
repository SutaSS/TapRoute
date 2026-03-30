'use client';

import { useState } from 'react';
import ItineraryCard from '@/components/ItineraryCard';
import { Compass, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history' | 'draft'>('ongoing');

  const dummyTrips = {
    ongoing: [
      { id: '2', title: 'Komodo Expedition', location: 'Labuan Bajo', duration: 5, status: 'planned' as const, avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2'], imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop' },
      { id: '4', title: 'Raja Ampat Diving', location: 'Papua', duration: 8, status: 'planned' as const, extraAvatars: 3, imageUrl: 'https://images.unsplash.com/photo-1621644781440-2c700940cc24?q=80&w=800&auto=format&fit=crop' },
    ],
    history: [
      { id: '1', title: 'Exploring Ubud', location: 'Bali, Indonesia', duration: 4, status: 'completed' as const, extraAvatars: 2, imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop' },
    ],
    draft: [
      { id: '3', title: 'Tokyo City Pulse', location: 'Tokyo, Japan', duration: 7, status: 'draft' as const, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop' },
      { id: '5', title: 'Singapore Weekend', location: 'Singapore', duration: 3, status: 'draft' as const, imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop' },
    ]
  };

  const trips = dummyTrips[activeTab];

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-2rem)]">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">My Trips</h1>
          <p className="text-sm font-medium text-gray-500">Manage your past, current, and future journeys.</p>
        </div>
        <Link href="/dashboard/create" className="hidden sm:flex items-center gap-2 bg-greenDark hover:bg-[#20401b] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5">
          + Create New Trip
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit mb-8 shadow-inner">
        <button 
          onClick={() => setActiveTab('ongoing')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ongoing' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Compass size={16} /> <span className="hidden sm:inline">Ongoing</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle size={16} /> <span className="hidden sm:inline">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('draft')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'draft' ? 'bg-white text-greenDark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Clock size={16} /> <span className="hidden sm:inline">Drafts</span>
        </button>
      </div>

      {/* Grid Content */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
          {trips.map((trip) => (
            <ItineraryCard key={trip.id} {...trip} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center px-4 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-16 h-16 bg-beigeLight text-greenDark rounded-full flex items-center justify-center mb-4">
            <Compass size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} trips found</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mb-6">You don&apos;t have any {activeTab} adventures yet. Let our AI Concierge curate one for you!</p>
          <Link href="/dashboard/create" className="bg-greenDark hover:bg-[#20401b] text-white px-6 py-3 rounded-full font-bold text-sm shadow-sm transition-all shadow-greenDark/20 hover:shadow-greenDark/40">
            Create Itinerary
          </Link>
        </div>
      )}

      {/* Mobile Create FAB */}
      <Link href="/dashboard/create" className="flex sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-greenDark text-white rounded-full items-center justify-center shadow-2xl z-50 hover:scale-105 transition-transform">
        <Compass size={24} />
      </Link>
    </div>
  );
}
