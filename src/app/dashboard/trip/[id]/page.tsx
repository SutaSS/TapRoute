'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Bot, MapPin, Navigation, Compass } from 'lucide-react';
import ActivityItem from '@/components/ActivityItem';
import PaymentModal from '@/components/PaymentModal';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<{name: string, price: number} | null>(null);

  const handleBook = (name: string, price: number) => {
    setSelectedActivity({ name, price });
    setIsPaymentOpen(true);
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Banner */}
      <div className="relative w-full h-[250px] md:h-[350px] rounded-[2rem] overflow-hidden shadow-sm mb-12">
        <Image src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200" alt="Ubud, Bali" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex gap-2 mb-3">
              <span className="bg-blueMedium/90 backdrop-blur text-[10px] text-white font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Planned</span>
              <span className="bg-black/50 backdrop-blur text-[10px] text-white font-bold px-3 py-1.5 rounded-full outline outline-1 outline-white/20 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3"/> Oct 12 - Oct 14, 2026
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 font-serif">Ubud, Bali</h1>
            <p className="text-white/80 font-medium">Cultural Heart of Indonesia</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-xl max-w-xs text-right">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Budget</span>
            <div className="text-2xl md:text-3xl font-extrabold text-greenDark mt-1">Rp 2.500.000</div>
            <div className="text-[9px] text-gray-500 mt-1 leading-tight">Est. inclusive of local UMKM taxes</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column - Timeline Content */}
        <div className="flex-1 max-w-2xl">
          
          {/* Day 1 Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-greenDark text-white font-bold text-sm shadow-md shrink-0 z-20">01</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Day 1: Arrival & Exploration</h3>
                <p className="text-xs font-semibold text-gray-500">Wednesday, Oct 12</p>
              </div>
            </div>

            <div className="pl-5 border-l-2 border-dashed border-gray-300 ml-5 relative pb-8 space-y-6">
              <div className="absolute top-0 bottom-0 -left-[2px] w-[2px] bg-greenDark h-1/3"></div> {/* Progress indicator visual */}
              <ActivityItem 
                title="Tegalalang Rice Terrace"
                description="Experience the iconic layered landscape. Your visit directly supports the local farming cooperative."
                price={50000}
                imageUrl="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400"
                isUmkm={true}
                onBook={() => handleBook("Tegalalang Rice Terrace", 50000)}
              />
              <ActivityItem 
                title="Warung Mek Juwel"
                description="Farm-to-table Balinese cuisine sourced from village farmers. Try their famous Nasi Campur."
                price={120000}
                imageUrl="https://images.unsplash.com/photo-1548011242-63b715aefbaf?w=400"
                isUmkm={true}
                buttonText="Reserve Table"
                onBook={() => handleBook("Warung Mek Juwel", 120000)}
                isLast={true}
              />
            </div>
          </div>

          {/* Day 2 Section */}
          <div>
            <div className="flex items-center gap-4 mb-8 relative">
              <div className="absolute top-[-48px] left-[19px] bottom-full w-[2px] border-l-2 border-dashed border-gray-300 -z-10 h-12"></div> {/* Connecting visual */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-beigeLight text-greenDark font-bold text-sm border-2 border-greenDark shadow-sm shrink-0 z-20">02</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Day 2: Spiritual Wellness</h3>
                <p className="text-xs font-semibold text-gray-500">Thursday, Oct 13</p>
              </div>
            </div>
            
            <div className="pl-5 relative pb-8 space-y-6 ml-5">
              <ActivityItem 
                title="Puri Ahimsa Yoga Session"
                description="Morning Vinyasa flow in a traditional bamboo shala led by local masters."
                price={150000}
                imageUrl="https://images.unsplash.com/photo-1506126613408-eca0711cc646?w=400"
                isUmkm={true}
                onBook={() => handleBook("Puri Ahimsa Yoga", 150000)}
                isLast={true}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Map & AI Sidebar */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-6 sticky top-24 self-start">
          
          <div className="bg-[#484242] w-full h-[250px] rounded-[2rem] p-6 shadow-sm overflow-hidden relative flex items-center justify-center text-white/50 border-[6px] border-white">
            <MapPin size={48} className="absolute opacity-20" />
            <span className="tracking-[0.5em] font-bold text-sm absolute bottom-8 opacity-80 z-10 text-white drop-shadow-lg">MAP VIEW</span>
            {/* Map Placeholder Graphic */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-greenDark/5 border border-greenDark/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-greenDark/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full bg-greenDark flex items-center justify-center border-2 border-beigeLight shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-sm text-gray-900">TapRoute Concierge</h4>
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-greenDark tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-greenDark animate-pulse"></span> Online</div>
              </div>
            </div>

            <div className="bg-beigeLight rounded-2xl p-4 text-sm font-medium text-gray-700 leading-relaxed mb-4 relative z-10 border border-greenDark/10 shadow-inner">
              Halo! Saya sudah mengoptimalkan rute ini untuk menghindari macet di Ubud. Ada yang mau diubah dari rute ini?
            </div>

            <div className="relative mt-2 z-10">
              <input type="text" placeholder="Tanya sesuatu..." className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-greenDark/30 transition-all pr-12" />
              <button className="absolute right-1 top-1 w-8 h-8 rounded-full bg-greenDark text-white flex items-center justify-center hover:bg-[#20401b] transition-colors shadow-sm">
                <Navigation size={12} className="ml-[-1px] mt-[1px]" />
              </button>
            </div>
          </div>

          {/* Sustainability Widget */}
          <div className="bg-gradient-to-br from-beigeLight to-white rounded-3xl p-6 shadow-sm border border-greenDark/5">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Sustainability & Community</h4>
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-gray-900 text-sm">UMKM Support</span>
              <span className="font-extrabold text-greenDark">85% Revenue</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-greenDark h-2 rounded-full w-[85%]"></div>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Pilihan Anda berkontribusi langsung pada ekonomi lokal Ubud.</p>
          </div>

        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        placeName={selectedActivity?.name || ''} 
        price={selectedActivity?.price || 0}
        onPay={() => {
          alert('Pembayaran berhasil!');
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}

function CalendarIcon(props: React.ComponentProps<'svg'>) {
  return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
