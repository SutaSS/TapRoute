'use client';

// ============================================================
// TapRoute — Dashboard Page (/dashboard)
// ============================================================
// Main landing page setelah login
// Menampilkan semua trips (planned + history/paid)
// CTA: + Create New Trip → /create

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, TripStatus } from '@/types';

// ------------------------------------------------------------
// Status badge config
// ------------------------------------------------------------
const STATUS_CONFIG: Record<TripStatus, { label: string; className: string }> = {
  draft:     { label: '📝 Draft',     className: 'badge--draft' },
  planned:   { label: '🔵 Planned',   className: 'badge--planned' },
  paid:      { label: '🟢 Paid',      className: 'badge--paid' },
  completed: { label: '⚫ Completed', className: 'badge--completed' },
};

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
export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips]       = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');

  // ------------------------------------------------------------
  // fetchTrips — ambil semua trips dari API
  // ------------------------------------------------------------
  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/trips');
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Gagal memuat trips');

      setTrips(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // TODO: Cek auth session sebelum fetch
    fetchTrips();
  }, []);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleCreateTrip = () => {
    router.push('/create');
  };

  const handleTripClick = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  // ------------------------------------------------------------
  // Render — Loading
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="dashboard-page">
        <div className="loading-state">
          <div className="spinner" aria-label="Memuat..." />
          <p>Memuat trips...</p>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Render — Error
  // ------------------------------------------------------------
  if (error) {
    return (
      <main className="dashboard-page">
        <div className="error-state">
          <p>❌ {error}</p>
          <button className="btn-secondary" onClick={fetchTrips}>
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Render — Main
  // ------------------------------------------------------------
  return (
    <main className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__text">
          <h1 className="dashboard-title">Your Trips 🗺️</h1>
          <p className="dashboard-subtitle">
            {trips.length} trip{trips.length !== 1 ? 's' : ''} tersimpan
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleCreateTrip}
          id="create-new-trip-btn"
        >
          + Create New Trip
        </button>
      </header>

      {/* Trip List */}
      {trips.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state__icon">🧳</div>
          <h2>No trips yet.</h2>
          <p>Start your first journey!</p>
          <button
            className="btn-primary"
            onClick={handleCreateTrip}
            id="empty-create-trip-btn"
          >
            + Create New Trip
          </button>
        </div>
      ) : (
        <section className="trip-list" aria-label="Daftar trips">
          {trips.map((trip) => {
            const statusCfg = STATUS_CONFIG[trip.status];
            return (
              <article
                key={trip.id}
                className="trip-card"
                onClick={() => handleTripClick(trip.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTripClick(trip.id)}
                id={`trip-card-${trip.id}`}
                aria-label={`Trip: ${trip.title}`}
              >
                <div className="trip-card__header">
                  <h3 className="trip-card__title">{trip.title}</h3>
                  <span className={`badge ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="trip-card__meta">
                  <span className="trip-card__location">📍 {trip.location}</span>
                  <span className="trip-card__duration">📅 {trip.duration} hari</span>
                </div>

                <div className="trip-card__footer">
                  <span className="trip-card__price">
                    {formatPrice(trip.total_estimated_cost)}
                  </span>
                  <span className="trip-card__arrow">→</span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
