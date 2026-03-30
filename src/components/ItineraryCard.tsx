import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface ItineraryCardProps {
  id: string;
  title: string;
  duration: number;
  location: string;
  imageUrl?: string;
  status: 'draft' | 'planned' | 'completed' | 'paid';
  avatars?: string[];
  extraAvatars?: number;
}

export default function ItineraryCard({
  id,
  title,
  duration,
  location,
  imageUrl = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=600&auto=format&fit=crop',
  status,
  avatars = [],
  extraAvatars = 0,
}: ItineraryCardProps) {

  const getStatusChip = () => {
    switch(status) {
      case 'completed': return <div className="bg-greenDark/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex gap-1 items-center"><span className="w-2 h-2 rounded-full bg-white block"/>Completed</div>;
      case 'planned': return <div className="bg-blueMedium/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex gap-1 items-center"><span className="w-2 h-2 rounded-full bg-white block"/>Planned</div>;
      case 'draft': return <div className="bg-white/80 border border-gray-200 backdrop-blur text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full flex gap-1 items-center"><span className="w-2 h-2 rounded-full border border-gray-400 block"/>Draft</div>;
      case 'paid': return <div className="bg-yellow-500/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex gap-1 items-center"><span className="w-2 h-2 rounded-full bg-white block"/>Paid</div>;
      default: return null;
    }
  };

  return (
    <Link href={`/dashboard/trip/${id}`} className="group block bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-4 right-4 z-10">
          {getStatusChip()}
        </div>
      </div>
      
      <div className="p-5 flex flex-col justify-between" style={{ minHeight: '130px' }}>
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">{title}</h3>
          <div className="flex items-center text-xs text-gray-500 gap-3">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{duration} Days</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="truncate max-w-[120px]">{location}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {avatars.length > 0 ? (
              avatars.map((av, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                  <Image src={av} fill className="object-cover" alt="Avatar"/>
                </div>
              ))
            ) : (
                <div className="w-6 h-6 rounded-full bg-beigeLight text-greenDark text-[10px] flex items-center justify-center font-bold">Me</div>
            )}
            {extraAvatars > 0 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-beigeLight text-greenDark text-[10px] flex items-center justify-center font-bold z-10 relative">
                +{extraAvatars}
              </div>
            )}
          </div>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-greenDark transition-colors" />
        </div>
      </div>
    </Link>
  );
}
