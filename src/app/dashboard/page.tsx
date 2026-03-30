import ItineraryCard from '@/components/ItineraryCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const dummyTrips = [
    { id: '1', title: 'Exploring Ubud', location: 'Bali, Indonesia', duration: 4, status: 'completed' as const, extraAvatars: 2, imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop' },
    { id: '2', title: 'Komodo Expedition', location: 'Labuan Bajo', duration: 5, status: 'planned' as const, avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2'], imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop' },
    { id: '3', title: 'Tokyo City Pulse', location: 'Tokyo, Japan', duration: 7, status: 'draft' as const, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Banner Area */}
      <div className="relative w-full h-[280px] md:h-[320px] rounded-[2rem] overflow-hidden shadow-sm mb-10">
        <Image src="/images/banner.png" alt="Travel Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-greenDark/90 via-greenDark/60 to-transparent mix-blend-multiply" />
        
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Halo, Traveler! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-white/90 text-sm md:text-base font-medium max-w-md mb-8 leading-relaxed">
            Ready for your next adventure? Let our AI curate the perfect itinerary based on your unique travel style.
          </p>
          
          <Link href="/dashboard/create" className="inline-flex w-fit items-center gap-2 bg-greenDark/80 hover:bg-greenDark backdrop-blur-md text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-black/10 border border-white/20 transition-all hover:-translate-y-0.5">
            <Sparkles size={18} />
            <span className="text-sm">Plan New Trip with AI</span>
          </Link>
        </div>
      </div>

      {/* Title block with view all */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Trips</h2>
        <Link href="/dashboard/my-trips" className="text-blueMedium hover:underline text-xs font-bold flex items-center gap-1">
          View All Journeys <ArrowRight size={14} />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyTrips.map(trip => (
          <ItineraryCard key={trip.id} {...trip} />
        ))}
      </div>
      
    </div>
  );
}
