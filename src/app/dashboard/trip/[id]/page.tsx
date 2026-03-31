'use client';

// ============================================================
// TapRoute — Trip Detail Page (/dashboard/trip/[id])
// ============================================================
// Full flow:
//   1. Load trip dari GET /api/trips/[id]
//   2. Tampilkan itinerary per hari (ActivityItem)
//   3. Jika belum done: Edit via POST /api/edit
//   4. Done: PATCH /api/trips/[id] { is_final: true, status: planned }
//   5. Book: POST /api/booking → snap_token → window.snap.pay()
//   6. Jika paid: read-only

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Activity, DayItinerary, ApiResponse, BookingFeeSummary } from '@/types';
import ActivityItem from '@/components/ActivityItem';
import PaymentModal from '@/components/PaymentModal';
import { ArrowLeft, CheckCircle, Edit3, Send, X, Ticket } from 'lucide-react';

// -------------------------------------------------------
// Declare window.snap untuk Midtrans
// -------------------------------------------------------
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

// -------------------------------------------------------
// Helper
// -------------------------------------------------------
function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

// -------------------------------------------------------
// Skeleton loading
// -------------------------------------------------------
function TripDetailSkeleton() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-5 bg-gray-200 rounded-xl w-32" />
      </div>
      <div className="h-8 bg-gray-200 rounded-xl w-2/3 mb-2" />
      <div className="h-4 bg-gray-100 rounded-xl w-1/3 mb-8" />
      <div className="flex gap-3 mb-10">
        <div className="h-8 bg-gray-200 rounded-full w-24" />
        <div className="h-8 bg-gray-100 rounded-full w-32" />
      </div>
      {[1, 2].map((d) => (
        <div key={d} className="mb-10">
          <div className="h-6 bg-gray-200 rounded-xl w-24 mb-4" />
          <div className="space-y-3">
            <div className="bg-white rounded-2xl h-28 border border-gray-100" />
            <div className="bg-white rounded-2xl h-28 border border-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------
export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  // State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [status, setStatus] = useState<Trip['status']>('draft');
  const [isFinal, setIsFinal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [isBookLoading, setIsBookLoading] = useState(false);

  // PaymentModal (konfirmasi sebelum buka Midtrans)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // -------------------------------------------------------
  // Fetch trip data
  // -------------------------------------------------------
  const fetchTrip = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
         cache: 'no-store',
         headers: { 'Cache-Control': 'no-cache, no-store' }
      });
      const json: ApiResponse<Trip> = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Trip tidak ditemukan');
      setTrip(json.data);
      setItinerary(json.data.itinerary ?? []);
      setStatus(json.data.status);
      setIsFinal(json.data.is_final);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat trip');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  // -------------------------------------------------------
  // Edit via LLM (Chat)
  // -------------------------------------------------------
  const handleEdit = async () => {
    if (!editRequest.trim()) return;
    setIsEditLoading(true);
    setError('');
    try {
      // Panggil API edit
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary_id: tripId, user_request: editRequest }),
      });
      const json: ApiResponse<{itineraryJson: DayItinerary[]; totalEstimatedCost: number}> = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Gagal edit itinerary');
      
      // Refresh seluruh trip state agar chat history baru juga terbaca
      await fetchTrip();
      
      setEditRequest('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengedit itinerary');
    } finally {
      setIsEditLoading(false);
    }
  };

  // -------------------------------------------------------
  // Open payment confirmation modal
  // -------------------------------------------------------
  const handleOpenBooking = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  // -------------------------------------------------------
  // Confirm → POST /api/booking → Midtrans Snap
  // -------------------------------------------------------
  const handleConfirmPay = async () => {
    setIsBookLoading(true);
    setError('');
    setIsModalOpen(false);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary_id: tripId }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.snap_token) {
        throw new Error(json.error ?? 'Gagal membuat booking');
      }

      const snapToken: string = json.data.snap_token;

      // Buka Midtrans Snap popup
      if (typeof window !== 'undefined' && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            router.push('/dashboard/my-trips');
          },
          onPending: () => {
            router.push('/dashboard/my-trips');
          },
          onError: () => {
            setError('Pembayaran gagal. Silakan coba lagi.');
            setIsBookLoading(false);
          },
          onClose: () => {
            setIsBookLoading(false);
          },
        });
      } else {
        // Fallback jika snap belum loaded
        throw new Error('Midtrans Snap belum siap. Coba refresh halaman.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses booking');
      setIsBookLoading(false);
    }
  };

  // -------------------------------------------------------
  // Cancel Booking
  // -------------------------------------------------------
  const handleCancelBooking = async () => {
    if (!confirm('Yakin ingin membatalkan booking ini? Itinerary akan dihapus.')) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/my-trips');
      } else {
        const json = await res.json();
        setError(json.error ?? 'Gagal membatalkan booking');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Gagal memproses pembatalan');
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------
  // Derived state
  // -------------------------------------------------------
  const isPaid = status === 'paid' || status === 'completed' || status === 'planned';
  const canEdit = status === 'draft';
  const canBook = status === 'draft';
  const isOngoing = status === 'planned' || status === 'paid';

  let canCancel = true;
  let formattedDateRange = '';
  if (trip?.startDate) {
    const start = new Date(trip.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (trip.duration || 0));

    const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    formattedDateRange = `${start.toLocaleDateString('id-ID', formatOpts)} - ${end.toLocaleDateString('id-ID', formatOpts)}`;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startMidnight = new Date(start);
    startMidnight.setHours(0, 0, 0, 0);

    const diffDays = (startMidnight.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 2) {
      canCancel = false;
    }
  }

  const showCancel = isOngoing && canCancel;

  // -------------------------------------------------------
  // Render — Loading
  // -------------------------------------------------------
  if (isLoading) return <TripDetailSkeleton />;

  if (!trip) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-600 font-medium mb-4">{error || 'Trip tidak ditemukan.'}</p>
          <button
            className="bg-greenDark text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#20401b] transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Status badge config
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',      className: 'bg-gray-100 text-gray-700 border border-gray-200' },
    planned:   { label: 'Planned',    className: 'bg-blue-100 text-blue-700 border border-blue-200' },
    paid:      { label: 'Paid',       className: 'bg-green-100 text-green-700 border border-green-200' },
    completed: { label: 'Completed',  className: 'bg-gray-800 text-white' },
  };
  const badge = statusConfig[status] ?? statusConfig.draft;

  // -------------------------------------------------------
  // Render — Main
  // -------------------------------------------------------
  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/my-trips')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-greenDark transition-colors mb-6"
        id="back-btn"
      >
        <ArrowLeft size={16} />
        My Trips
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{trip.title}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {trip.location} &middot; {formattedDateRange || `${trip.duration} days`} &middot; {(trip as any).pax ?? 1} Pax &middot; {formatPrice(trip.total_estimated_cost)}
          </p>
        </div>
        <span className={`${badge.className} text-xs font-bold px-3 py-1.5 rounded-full self-start`}>
          {badge.label}
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Paid Banner / E-Ticket */}
      {isPaid && (
        <div className="bg-greenDark text-white px-6 py-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-8 translate-y-8"></div>
          
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
            <div className="w-12 h-12 bg-white text-greenDark rounded-full flex items-center justify-center shrink-0">
               <Ticket size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">TapRoute E-Ticket</h3>
              <p className="text-xs sm:text-sm font-medium opacity-90">Booking ID: {trip.id.split('-').pop()?.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-center sm:text-right relative z-10 w-full sm:w-auto bg-green-900/40 px-5 py-3 rounded-xl border border-green-400/20 shadow-inner">
            <span className="block text-xs uppercase tracking-wider mb-1 font-bold opacity-80">Status</span>
            <span className="block font-bold text-lg text-green-300 items-center justify-center sm:justify-end gap-1">
              <CheckCircle size={16} className="inline mr-1 mb-1"/> PREMIUM LUNAS
            </span>
            <div className="mt-2 text-[10px] opacity-75">Tunjukkan layar ini kepada petugas TapRoute <br/> di seluruh lokasi wisata.</div>
          </div>
        </div>
      )}

      {/* ---- Itinerary Section ---- */}
      <section aria-label="Itinerary" className="space-y-10 mb-8">
        {itinerary.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            Itinerary belum tersedia.
          </div>
        ) : (
          itinerary.map((day) => (
            <div key={day.day}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-greenDark text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {day.day}
                </div>
                <h2 className="text-lg font-bold text-gray-900">Day {day.day}</h2>
              </div>

              {/* Activities */}
              <div className="pl-5 ml-4 border-l-2 border-dashed border-gray-200 space-y-4">
                {day.activities.map((activity, idx) => (
                  <ActivityItem
                    key={idx}
                    title={activity.place_name}
                    description={activity.description}
                    price={activity.estimated_price}
                    isUmkm={activity.umkm_flag}
                    isLast={idx === day.activities.length - 1}
                    detailHref={`/dashboard/trip/${trip.id}/activity/${day.day}-${idx}`}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* ---- Action Bar ---- */}
      {(canEdit || canBook || isOngoing) && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-3">

            {/* Edit Chat Drawer */}
            {isEditing && (
              <div className="bg-beigeLight rounded-2xl p-4 border border-greenDark/10 flex flex-col max-h-[60vh] sm:max-h-96 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Edit3 size={16} /> Tanya Assistant (Edit Trip)
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {((trip as any).messages || []).map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`inline-block px-4 py-2.5 max-w-[85%] rounded-[1.2rem] text-sm ${
                        m.sender === 'user' 
                          ? 'bg-greenDark text-white font-medium rounded-br-sm' 
                          : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                      }`}>
                         {m.text}
                      </span>
                    </div>
                  ))}
                  {isEditLoading && (
                    <div className="flex justify-start">
                      <span className="inline-block px-4 py-2.5 rounded-[1.2rem] text-sm bg-white border border-gray-100 text-gray-500 italic shadow-sm">
                         Terra sedang berpikir...
                      </span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-greenDark/20 transition-all shadow-sm"
                    placeholder='Misal: "Ganti aktivitas pertama di hari kedua dengan wisata pantai..."'
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEdit();
                      }
                    }}
                    disabled={isEditLoading}
                    id="edit-request-input"
                  />
                  <button
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-greenDark text-white hover:bg-[#20401b] transition-colors disabled:opacity-50 shrink-0 shadow-sm"
                    onClick={handleEdit}
                    disabled={isEditLoading || !editRequest.trim()}
                    id="apply-edit-btn"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canEdit && !isEditing && (
                <button
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border-2 border-greenDark/20 text-greenDark bg-transparent hover:bg-greenDark/5 transition-colors"
                  onClick={() => setIsEditing(true)}
                  id="edit-trip-btn"
                >
                  <Edit3 size={18} />
                  Edit with AI
                </button>
              )}
              {canBook && !isEditing && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-extrabold bg-greenDark text-white hover:bg-[#20401b] hover:shadow-lg transition-all disabled:opacity-50 shadow-md ring-4 ring-greenDark/20"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isBookLoading}
                  id="book-pay-btn"
                >
                  <Ticket size={20} />
                  {isBookLoading ? 'Processing...' : `Pay & Get Ticket — ${formatPrice(trip.total_estimated_cost)}`}
                </button>
              )}
              {showCancel && !isEditing && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-extrabold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all shadow-sm ring-2 ring-red-100 border border-red-200"
                  onClick={handleCancelBooking}
                  id="cancel-booking-btn"
                >
                  <X size={20} />
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        placeName={selectedActivity?.place_name ?? trip.title}
        price={trip.total_estimated_cost}
        pax={(trip as any).pax}
        onClose={() => { setIsModalOpen(false); setIsBookLoading(false); }}
        onPay={handleConfirmPay}
      />
    </div>
  );
}
