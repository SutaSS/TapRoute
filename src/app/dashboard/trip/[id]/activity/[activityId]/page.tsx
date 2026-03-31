'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Ticket, CheckCircle, Info } from 'lucide-react';
import { Trip, DayItinerary, Activity } from '@/types';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const tripId = params.id as string;
  const activityId = params.activityId as string; // format: "day-index"eMisal "1-0"
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiDetail, setAiDetail] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  useEffect(() => {
    async function loadTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.data) {
          setTrip(data.data as Trip);
          
          // Parse activity ID (misal "1-0" berarti day 1, index 0)
          const [dayString, idxString] = activityId.split('-');
          const dayNum = parseInt(dayString, 10);
          const actIdx = parseInt(idxString, 10);
          
          const iti: DayItinerary[] = typeof data.data.itinerary === 'string' 
            ? JSON.parse(data.data.itinerary) 
            : data.data.itinerary;
          
          const foundDay = iti.find(d => d.day === dayNum);
          if (foundDay && foundDay.activities[actIdx]) {
            setActivity(foundDay.activities[actIdx]);
          }
        }
      } catch (e) {
        console.error("Gagal load trip", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrip();
  }, [tripId, activityId]);

  // Load AI description setelah activity didefinisikan
  useEffect(() => {
    if (!activity || !trip) return;
    
    async function fetchAiDetail() {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ place_name: activity?.place_name, location: trip?.location })
        });
        const data = await res.json();
        if (data.detail) {
          setAiDetail(data.detail);
        } else {
          setAiDetail('Gagal memuat detail.');
        }
      } catch (err) {
        setAiDetail('Terjadi kesalahan saat memanggil asisten.');
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiDetail();
  }, [activity, trip]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Menyiapkan data wisata...</div>;
  }

  if (!trip || !activity) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Aktivitas tidak ditemukan.</p>
        <button className="text-greenDark underline text-sm" onClick={() => router.back()}>Kembali</button>
      </div>
    );
  }

  const isPaid = trip.status === 'paid' || trip.status === 'completed';

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-greenDark transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Kembali ke Itinerary
      </button>

      {/* Hero Image */}
      <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-6 relative shadow-lg">
        <img 
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(activity.place_name + ' HD cinematic travel view')}`} 
          alt={activity.place_name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(activity.place_name)}/800/600` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <div className="flex gap-2 items-center text-white/90 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin size={14} /> {trip.location}
            {activity.umkm_flag && <span className="bg-greenDark px-2 py-0.5 rounded-full ml-2">UMKM Partner</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{activity.place_name}</h1>
        </div>
      </div>

      {/* Ticket Bukti Bayar */}
      {isPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full text-greenDark">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-greenDark font-bold flex items-center gap-1">
                <CheckCircle size={14} /> TIKET TELAH LUNAS
              </p>
              <p className="text-sm text-green-800">Tunjukkan laman ini kepada loket/petugas sebagai bukti akses TapRoute Anda.</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 border border-green-100 rounded-xl text-center shadow-inner shrink-0 min-w-[120px]">
             <span className="block text-[10px] text-green-600 font-bold uppercase tracking-widest">Booking ID</span>
             <span className="block font-mono text-gray-800 font-bold">{trip.id.split('-').shift()?.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm font-medium border border-orange-200 mb-8 flex items-center gap-3">
          <Info size={18} className="shrink-0" />
          Kamu belum melakukan pembayaran untuk Trip ini. Tiket digital akan muncul di sini setelah status menjadi Paid.
        </div>
      )}

      {/* Main Content (AI Detail) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">Review & Tips dari Asisten Terra</h2>
        
        {isAiLoading ? (
           <div className="space-y-3">
             <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
             <div className="h-4 bg-gray-100 rounded animate-pulse w-[90%]"></div>
             <div className="h-4 bg-gray-100 rounded animate-pulse w-[95%]"></div>
           </div>
        ) : (
           <div className="prose prose-sm md:prose-base prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
             {aiDetail}
           </div>
        )}
      </div>

    </div>
  );
}
