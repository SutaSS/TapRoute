'use client';

// ============================================================
// TapRoute — ActivityItem Component
// ============================================================
// Card untuk satu aktivitas dalam itinerary
// Menampilkan: place_name, description, price, category badge, Book Now button

import React from 'react';
import { Activity } from '@/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface ActivityItemProps {
  activity: Activity;
  onBook?: (activity: Activity) => void;
  showBookButton?: boolean; // hanya tampil jika is_final = true
  disabled?: boolean;       // true jika status = 'paid'
}

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
export default function ActivityItem({
  activity,
  onBook,
  showBookButton = false,
  disabled = false,
}: ActivityItemProps) {
  const { place_name, description, estimated_price, category, booking_available, umkm_flag } =
    activity;

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleBook = () => {
    // TODO: Tambahkan konfirmasi atau animasi sebelum open modal
    if (onBook) {
      onBook(activity);
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      className={`activity-card ${umkm_flag ? 'activity-card--umkm' : ''} ${
        disabled ? 'activity-card--disabled' : ''
      }`}
      role="article"
      aria-label={`Aktivitas: ${place_name}`}
    >
      {/* Category Badge */}
      <div className="activity-badges">
        {umkm_flag ? (
          <span className="badge badge--umkm">🏪 UMKM Lokal</span>
        ) : (
          <span className="badge badge--destination">📍 Destinasi</span>
        )}
        {category === 'umkm' && (
          <span className="badge badge--support">Dukung Lokal</span>
        )}
      </div>

      {/* Content */}
      <div className="activity-content">
        <h4 className="activity-title">{place_name}</h4>
        <p className="activity-description">{description}</p>
      </div>

      {/* Footer */}
      <div className="activity-footer">
        <span className="activity-price">{formatPrice(estimated_price)}</span>

        {/* Book Now Button */}
        {showBookButton && booking_available && (
          <button
            className="btn-book"
            onClick={handleBook}
            disabled={disabled}
            id={`book-btn-${place_name.toLowerCase().replace(/\s+/g, '-')}`}
            aria-label={`Pesan ${place_name}`}
          >
            {disabled ? '✅ Booked' : '🛒 Book Now'}
          </button>
        )}
      </div>
    </div>
  );
}
