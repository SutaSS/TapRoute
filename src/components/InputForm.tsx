'use client';

// ============================================================
// TapRoute — InputForm Component
// ============================================================
// Controlled form untuk create trip
// Props: onSubmit(data: TripFormInput) => void
//        isLoading: boolean

import React, { useState } from 'react';
import { TripFormInput } from '@/types';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const DESTINATIONS = [
  'Bali',
  'Yogyakarta',
  'Lombok',
  'Raja Ampat',
  'Labuan Bajo',
  'Bromo',
  'Komodo',
  'Wakatobi',
  'Belitung',
  'Toraja',
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14];

const PREFERENCE_OPTIONS = [
  { value: 'beach', label: '🏖️ Pantai' },
  { value: 'mountain', label: '⛰️ Gunung' },
  { value: 'culture', label: '🏛️ Budaya' },
  { value: 'culinary', label: '🍜 Kuliner' },
  { value: 'adventure', label: '🧗 Petualangan' },
  { value: 'relaxation', label: '🧘 Relaksasi' },
  { value: 'shopping', label: '🛍️ Belanja' },
  { value: 'umkm', label: '🏪 UMKM Lokal' },
];

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface InputFormProps {
  onSubmit: (data: TripFormInput) => void;
  isLoading?: boolean;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [formData, setFormData] = useState<TripFormInput>({
    destination: DESTINATIONS[0],
    duration: 3,
    budget: 1000000,
    preferences: [],
  });

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, destination: e.target.value }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }));
  };

  const handlePreferenceToggle = (value: string) => {
    setFormData((prev) => {
      const exists = prev.preferences.includes(value);
      return {
        ...prev,
        preferences: exists
          ? prev.preferences.filter((p) => p !== value)
          : [...prev.preferences, value],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Tambahkan validasi form jika perlu
    onSubmit(formData);
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="input-form">
      {/* Destination */}
      <div className="form-group">
        <label htmlFor="destination">📍 Destinasi</label>
        <select
          id="destination"
          value={formData.destination}
          onChange={handleDestinationChange}
          disabled={isLoading}
          className="form-select"
        >
          {DESTINATIONS.map((dest) => (
            <option key={dest} value={dest}>
              {dest}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div className="form-group">
        <label htmlFor="duration">📅 Durasi</label>
        <select
          id="duration"
          value={formData.duration}
          onChange={handleDurationChange}
          disabled={isLoading}
          className="form-select"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} hari
            </option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div className="form-group">
        <label htmlFor="budget">
          💰 Budget: <strong>IDR {formData.budget.toLocaleString('id-ID')}</strong>
        </label>
        <input
          id="budget"
          type="range"
          min={200000}
          max={10000000}
          step={100000}
          value={formData.budget}
          onChange={handleBudgetChange}
          disabled={isLoading}
          className="form-range"
        />
        <div className="range-labels">
          <span>IDR 200K</span>
          <span>IDR 10JT</span>
        </div>
      </div>

      {/* Preferences */}
      <div className="form-group">
        <label>🎯 Preferensi (pilih satu atau lebih)</label>
        <div className="preference-grid">
          {PREFERENCE_OPTIONS.map((pref) => (
            <label key={pref.value} className="preference-chip">
              <input
                type="checkbox"
                checked={formData.preferences.includes(pref.value)}
                onChange={() => handlePreferenceToggle(pref.value)}
                disabled={isLoading}
              />
              <span>{pref.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-generate"
        id="generate-trip-btn"
      >
        {isLoading ? '✨ AI is crafting your trip...' : '🚀 Generate Trip'}
      </button>
    </form>
  );
}
