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
import { ArrowLeft, CheckCircle, Edit3, Send, X } from 'lucide-react';

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
      const res = await fetch(`/api/trips/${tripId}`);
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
  // Edit via LLM
  // -------------------------------------------------------
  const handleEdit = async () => {
    if (!editRequest.trim()) return;
    setIsEditLoading(true);
    setError('');
    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary_id: tripId, user_request: editRequest }),
      });
      const json: ApiResponse<{itineraryJson: DayItinerary[]; totalEstimatedCost: number}> = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Gagal edit itinerary');
      // itineraryJson datang dari Prisma Itinerary object
      const fresh = json.data.itineraryJson;
      setItinerary(Array.isArray(fresh) ? fresh : itinerary);
      setEditRequest('');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengedit itinerary');
    } finally {
      setIsEditLoading(false);
    }
  };

  // -------------------------------------------------------
  // Done — finalize itinerary
  // -------------------------------------------------------
  const handleDone = async () => {
    setIsDoneLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_final: true, status: 'planned' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal finalize trip');
      setIsFinal(true);
      setStatus('planned');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal finalize trip');
    } finally {
      setIsDoneLoading(false);
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
  // Derived state
  // -------------------------------------------------------
  const isPaid = status === 'paid' || status === 'completed';
  const canEdit = !isPaid && !isFinal;
  const canBook = isFinal && !isPaid;

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
            {trip.location} &middot; {trip.duration} days &middot; {formatPrice(trip.total_estimated_cost)}
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

      {/* Paid Banner */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle size={16} />
          Trip ini sudah dibooking! Selamat berwisata!
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
                    buttonText={
                      isPaid
                        ? 'Paid'
                        : canBook && activity.booking_available
                          ? 'Book Now'
                          : undefined
                    }
                    onBook={
                      canBook && activity.booking_available && !isPaid
                        ? () => handleOpenBooking(activity)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* ---- Action Bar ---- */}
      {!isPaid && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 -mx-4 md:-mx-8 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-3">

            {/* Edit Input */}
            {isEditing && (
              <div className="bg-beigeLight rounded-2xl p-4 border border-greenDark/10 space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Modify Itinerary
                </label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-greenDark/20 resize-none"
                  rows={3}
                  placeholder='Example: "Replace beach activity on Day 1 with mountain hiking"'
                  value={editRequest}
                  onChange={(e) => setEditRequest(e.target.value)}
                  disabled={isEditLoading}
                  id="edit-request-input"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => { setIsEditing(false); setEditRequest(''); }}
                    disabled={isEditLoading}
                    id="cancel-edit-btn"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-greenDark text-white hover:bg-[#20401b] transition-colors disabled:opacity-50"
                    onClick={handleEdit}
                    disabled={isEditLoading || !editRequest.trim()}
                    id="apply-edit-btn"
                  >
                    <Send size={14} />
                    {isEditLoading ? 'AI is updating...' : 'Apply Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canEdit && !isEditing && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsEditing(true)}
                  id="edit-trip-btn"
                >
                  <Edit3 size={16} />
                  Edit Trip
                </button>
              )}
              {canEdit && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-greenDark text-white hover:bg-[#20401b] transition-colors disabled:opacity-50 shadow-sm"
                  onClick={handleDone}
                  disabled={isDoneLoading}
                  id="done-trip-btn"
                >
                  <CheckCircle size={16} />
                  {isDoneLoading ? 'Saving...' : 'Done — Ready to Book'}
                </button>
              )}
              {canBook && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-greenDark text-white hover:bg-[#20401b] transition-colors disabled:opacity-50 shadow-md"
                  onClick={() => {
                    // Buka modal konfirmasi dulu dengan activity pertama yang booking_available
                    const firstBookable = itinerary
                      .flatMap((d) => d.activities)
                      .find((a) => a.booking_available);
                    if (firstBookable) {
                      handleOpenBooking(firstBookable);
                    } else {
                      // Jika tidak ada booking_available, langsung proses seluruh itinerary
                      handleConfirmPay();
                    }
                  }}
                  disabled={isBookLoading}
                  id="book-pay-btn"
                >
                  {isBookLoading ? 'Processing...' : 'Book & Pay'}
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
        onClose={() => { setIsModalOpen(false); setIsBookLoading(false); }}
        onPay={handleConfirmPay}
      />
    </div>
  );
}
