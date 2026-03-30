'use client';

// ============================================================
// TapRoute — Trip Detail Page (/trip/[id])
// ============================================================
// Main interaction page:
//   - View itinerary per hari
//   - Edit itinerary (jika NOT paid)
//   - Finalize dengan "Done" → is_final: true, status: planned
//   - Booking via BookingModal (hanya setelah Done)
//   - Read-only jika status = 'paid'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Activity, BookingFeeSummary, DayItinerary, ApiResponse } from '@/types';
import ItineraryCard from '@/components/ItineraryCard';
import BookingModal from '@/components/BookingModal';

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------
  const [trip, setTrip]               = useState<Trip | null>(null);
  const [itinerary, setItinerary]     = useState<DayItinerary[]>([]);
  const [status, setStatus]           = useState<Trip['status']>('draft');
  const [isFinal, setIsFinal]         = useState(false);

  const [isEditing, setIsEditing]     = useState(false);
  const [editRequest, setEditRequest] = useState('');

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading]         = useState(true);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [isBookLoading, setIsBookLoading] = useState(false);
  const [error, setError]                 = useState('');

  // ------------------------------------------------------------
  // fetchTrip — ambil data trip dari API
  // ------------------------------------------------------------
  const fetchTrip = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/trips/${tripId}`);
      const json: ApiResponse<Trip> = await res.json();

      if (!res.ok || !json.data) throw new Error(json.error ?? 'Trip tidak ditemukan');

      setTrip(json.data);
      setItinerary(json.data.itinerary);
      setStatus(json.data.status);
      setIsFinal(json.data.is_final);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat trip');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // ------------------------------------------------------------
  // handleEdit — kirim edit request ke /api/edit
  // ------------------------------------------------------------
  const handleEdit = async () => {
    if (!editRequest.trim()) return;
    setIsEditLoading(true);
    setError('');

    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_id: tripId,
          current_itinerary: itinerary,
          user_request: editRequest,
        }),
      });

      const json: ApiResponse<{ itinerary: DayItinerary[] }> = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Gagal edit itinerary');

      // Update local state
      setItinerary(json.data.itinerary);
      setEditRequest('');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat edit');
    } finally {
      setIsEditLoading(false);
    }
  };

  // ------------------------------------------------------------
  // handleDone — finalize itinerary (is_final: true, status: planned)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // handleOpenBooking — buka modal booking
  // ------------------------------------------------------------
  const handleOpenBooking = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  // ------------------------------------------------------------
  // handleConfirmBooking — proses booking via /api/booking
  // ------------------------------------------------------------
  const handleConfirmBooking = async (activity: Activity, fees: BookingFeeSummary) => {
    setIsBookLoading(true);
    setError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_id: tripId,
          place_name: activity.place_name,
          category: activity.category,
          price: fees.total_price,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal booking');

      // Update status lokal
      setStatus('paid');
      setIsModalOpen(false);
      setSelectedActivity(null);

      // TODO: Tampilkan success toast/notification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses booking');
    } finally {
      setIsBookLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Render — Loading
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="trip-detail-page">
        <div className="loading-state">
          <div className="spinner" aria-label="Memuat trip..." />
          <p>Memuat itinerary...</p>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="trip-detail-page">
        <div className="error-state">
          <p>❌ {error || 'Trip tidak ditemukan.'}</p>
          <button className="btn-secondary" onClick={() => router.push('/dashboard')}>
            ← Kembali ke Dashboard
          </button>
        </div>
      </main>
    );
  }

  const isPaid  = status === 'paid' || status === 'completed';
  const canEdit = !isPaid && !isFinal;

  // ------------------------------------------------------------
  // Render — Main
  // ------------------------------------------------------------
  return (
    <main className="trip-detail-page">
      {/* Header Section */}
      <header className="trip-detail-header">
        <button
          className="btn-ghost btn-back"
          onClick={() => router.push('/dashboard')}
          id="back-btn"
        >
          ← Dashboard
        </button>

        <div className="trip-detail-header__info">
          <h1 className="trip-detail-title">{trip.title}</h1>
          <p className="trip-detail-location">📍 {trip.location} · 📅 {trip.duration} hari</p>
        </div>

        {/* Status Badge */}
        <div className="trip-detail-header__status">
          <span className={`status-badge status-badge--${status}`}>
            {status === 'draft'     && '📝 Draft'}
            {status === 'planned'   && '🔵 Planned'}
            {status === 'paid'      && '🟢 Trip Booked'}
            {status === 'completed' && '⚫ Completed'}
          </span>
          <span className="trip-total-price">{formatPrice(trip.total_estimated_cost)}</span>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          ❌ {error}
        </div>
      )}

      {/* Itinerary Section */}
      <section className="itinerary-section" aria-label="Itinerary">
        {itinerary.map((day) => (
          <ItineraryCard
            key={day.day}
            day={day}
            showBookButtons={isFinal}
            isPaid={isPaid}
            onBook={handleOpenBooking}
          />
        ))}
      </section>

      {/* Edit Mode Toolbar (hanya jika belum paid dan belum final) */}
      {canEdit && (
        <section className="edit-section" aria-label="Edit itinerary">
          {isEditing ? (
            <div className="edit-input-area">
              <label htmlFor="edit-request-input" className="edit-label">
                ✏️ Modifikasi Itinerary
              </label>
              <textarea
                id="edit-request-input"
                className="edit-textarea"
                value={editRequest}
                onChange={(e) => setEditRequest(e.target.value)}
                placeholder='Contoh: "Ganti pantai dengan wisata gunung di hari 1"'
                rows={3}
                disabled={isEditLoading}
              />
              <div className="edit-actions">
                <button
                  className="btn-ghost"
                  onClick={() => { setIsEditing(false); setEditRequest(''); }}
                  disabled={isEditLoading}
                  id="cancel-edit-btn"
                >
                  Batal
                </button>
                <button
                  className="btn-primary"
                  onClick={handleEdit}
                  disabled={isEditLoading || !editRequest.trim()}
                  id="submit-edit-btn"
                >
                  {isEditLoading ? '🤖 AI sedang mengubah...' : '✅ Terapkan Perubahan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="edit-toolbar">
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(true)}
                id="edit-trip-btn"
              >
                ✏️ Edit Trip
              </button>
              <button
                className="btn-primary"
                onClick={handleDone}
                disabled={isDoneLoading}
                id="done-trip-btn"
              >
                {isDoneLoading ? '⏳ Menyimpan...' : '✅ Done'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Paid State Banner */}
      {isPaid && (
        <div className="paid-banner" role="status">
          🎉 Trip ini sudah dibooking! Selamat berwisata!
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        isLoading={isBookLoading}
        onConfirm={handleConfirmBooking}
        onClose={() => { setIsModalOpen(false); setSelectedActivity(null); }}
      />
    </main>
  );
}
