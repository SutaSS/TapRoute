'use client';

// ============================================================
// TapRoute — BookingModal Component
// ============================================================
// Modal konfirmasi pembayaran
// Menampilkan: total price, platform fee (10%), UMKM revenue (90%)
// CTA: "Confirm Payment"

import React from 'react';
import { Activity, BookingFeeSummary } from '@/types';
import { calculateBookingFee } from '@/lib/llm';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface BookingModalProps {
  activity: Activity | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (activity: Activity, fees: BookingFeeSummary) => void;
  onClose: () => void;
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
export default function BookingModal({
  activity,
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}: BookingModalProps) {
  if (!isOpen || !activity) return null;

  const { platform_fee, umkm_revenue } = calculateBookingFee(activity.estimated_price);
  const fees: BookingFeeSummary = {
    total_price: activity.estimated_price,
    platform_fee,
    umkm_revenue,
  };

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleConfirm = () => {
    // TODO: Tambahkan animasi loading / success setelah confirm
    onConfirm(activity, fees);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Tutup modal jika klik di luar content area
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 id="booking-modal-title" className="modal-title">
            🛒 Konfirmasi Booking
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Tutup modal"
            id="booking-modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Place Info */}
        <div className="modal-place-info">
          <h3 className="modal-place-name">{activity.place_name}</h3>
          <p className="modal-place-description">{activity.description}</p>
          {activity.umkm_flag && (
            <span className="badge badge--umkm">🏪 UMKM Lokal</span>
          )}
        </div>

        {/* Fee Breakdown */}
        <div className="modal-fee-breakdown">
          <h4 className="fee-title">Rincian Pembayaran</h4>

          <div className="fee-row">
            <span className="fee-label">Harga</span>
            <span className="fee-value">{formatPrice(activity.estimated_price)}</span>
          </div>

          <div className="fee-row fee-row--platform">
            <span className="fee-label">
              Platform Fee <small>(10%)</small>
            </span>
            <span className="fee-value">{formatPrice(platform_fee)}</span>
          </div>

          <div className="fee-row fee-row--umkm">
            <span className="fee-label">
              UMKM Revenue <small>(90%)</small>
              <span
                className="umkm-tooltip"
                title="90% dari pembayaran langsung ke mitra UMKM lokal"
              >
                ℹ️
              </span>
            </span>
            <span className="fee-value fee-value--highlight">{formatPrice(umkm_revenue)}</span>
          </div>

          <div className="fee-divider" />

          <div className="fee-row fee-row--total">
            <span className="fee-label">
              <strong>Total Bayar</strong>
            </span>
            <span className="fee-value fee-value--total">
              <strong>{formatPrice(activity.estimated_price)}</strong>
            </span>
          </div>
        </div>

        {/* UMKM Impact Info */}
        {activity.umkm_flag && (
          <div className="modal-umkm-impact">
            <p>
              💚 Dengan memesan ini, kamu mendukung UMKM lokal secara langsung!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
            id="booking-cancel-btn"
          >
            Batal
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={isLoading}
            id="booking-confirm-btn"
          >
            {isLoading ? '⏳ Memproses...' : '✅ Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
