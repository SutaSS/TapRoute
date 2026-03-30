'use client';

// ============================================================
// TapRoute — ItineraryCard Component
// ============================================================
// Container untuk satu hari perjalanan
// Menampilkan: nomor hari + list ActivityItem

import React from 'react';
import { DayItinerary, Activity } from '@/types';
import ActivityItem from './ActivityItem';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface ItineraryCardProps {
  day: DayItinerary;
  showBookButtons?: boolean; // true setelah is_final = true
  isPaid?: boolean;           // true jika status = 'paid'
  onBook?: (activity: Activity) => void;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function calculateDayTotal(activities: Activity[]): number {
  return activities.reduce((sum, act) => sum + act.estimated_price, 0);
}

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
export default function ItineraryCard({
  day,
  showBookButtons = false,
  isPaid = false,
  onBook,
}: ItineraryCardProps) {
  const dayTotal = calculateDayTotal(day.activities);
  const umkmCount = day.activities.filter((a) => a.umkm_flag).length;

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="itinerary-card" id={`day-${day.day}`} role="region" aria-label={`Hari ${day.day}`}>
      {/* Day Header */}
      <div className="itinerary-card__header">
        <div className="day-label">
          <span className="day-number">Hari {day.day}</span>
          {umkmCount > 0 && (
            <span className="umkm-count-badge">🏪 {umkmCount} UMKM</span>
          )}
        </div>
        <span className="day-total">{formatPrice(dayTotal)}</span>
      </div>

      {/* Activities */}
      <div className="itinerary-card__activities">
        {day.activities.length === 0 ? (
          // TODO: Tampilkan empty state yang lebih baik
          <p className="empty-activities">Tidak ada aktivitas untuk hari ini.</p>
        ) : (
          day.activities.map((activity, idx) => (
            <ActivityItem
              key={`${day.day}-${idx}`}
              activity={activity}
              showBookButton={showBookButtons}
              disabled={isPaid}
              onBook={onBook}
            />
          ))
        )}
      </div>
    </div>
  );
}
