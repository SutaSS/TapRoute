// ============================================================
// TapRoute — Type Definitions
// ============================================================

// ------------------------------------------------------------
// Activity (per item dalam satu hari itinerary)
// ------------------------------------------------------------
export interface Activity {
  id?: string;
  place_name: string;
  description: string;
  estimated_price: number;
  category: 'destination' | 'umkm';
  booking_available: boolean;
  umkm_flag: boolean;
}

// ------------------------------------------------------------
// Day Itinerary (satu hari perjalanan)
// ------------------------------------------------------------
export interface DayItinerary {
  day: number;
  activities: Activity[];
}

// ------------------------------------------------------------
// Trip / Itinerary (entitas utama)
// ------------------------------------------------------------
export type TripStatus = 'draft' | 'planned' | 'paid' | 'completed';

export interface Trip {
  id: string;
  userId?: string;
  title: string;
  location: string;
  duration: number; // jumlah hari
  budget: number;
  preferences: string[];
  status: TripStatus;
  is_final: boolean;
  itinerary: DayItinerary[];
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

// ------------------------------------------------------------
// Booking
// ------------------------------------------------------------
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  itinerary_id: string;
  place_name: string;
  category: 'destination' | 'umkm';
  price: number;
  platform_fee: number;   // 10% dari price
  umkm_revenue: number;   // 90% dari price
  status: BookingStatus;
  created_at?: string;
}

// ------------------------------------------------------------
// Booking Fee Summary (untuk BookingModal)
// ------------------------------------------------------------
export interface BookingFeeSummary {
  total_price: number;
  platform_fee: number;
  umkm_revenue: number;
}

// ------------------------------------------------------------
// Form Input (untuk create trip)
// ------------------------------------------------------------
export interface TripFormInput {
  destination: string;
  duration: number;
  budget: number;
  preferences: string[];
}

// ------------------------------------------------------------
// API Response wrappers
// ------------------------------------------------------------
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ------------------------------------------------------------
// LLM Payload
// ------------------------------------------------------------
export interface GeneratePayload {
  destination: string;
  duration: number;
  budget: number;
  preferences: string[];
}

export interface EditPayload {
  itinerary_id: string;
  current_itinerary: DayItinerary[];
  user_request: string;
}
