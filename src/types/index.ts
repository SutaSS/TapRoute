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
  user_id?: string;
  title: string;
  location: string;
  duration: number;             // jumlah hari
  budget: number;               // integer (IDR)
  pax: number;                  // jumlah orang
  preferences: string[];
  status: TripStatus;
  is_final: boolean;
  itinerary: DayItinerary[];    // dari itinerary_json di DB
  total_estimated_cost: number; // integer (IDR)
  startDate?: string;
  created_at?: string;
  updated_at?: string;
}

// ------------------------------------------------------------
// Booking
// ------------------------------------------------------------
// Sesuai Dbdiagram.MD: status hanya pending | paid
export type BookingStatus = 'pending' | 'paid';

export interface Booking {
  id: string;
  itinerary_id: string;
  user_id: string;        // Dbdiagram.MD: bookings punya user_id
  place_name: string;
  category: 'destination' | 'umkm';
  price: number;          // integer (IDR)
  platform_fee: number;   // 10% dari price
  umkm_revenue: number;   // 90% dari price
  status: BookingStatus;
  created_at?: string;
}

// ------------------------------------------------------------
// Booking Fee Summary (untuk BookingModal)
// ------------------------------------------------------------
export interface BookingFeeSummary {
  total_price: number;    // sama dengan activity.estimated_price
  platform_fee: number;   // 10%
  umkm_revenue: number;   // 90%
}

// ------------------------------------------------------------
// Form Input (untuk create trip)
// ------------------------------------------------------------
export interface TripFormInput {
  destination: string;
  duration: number;
  budget: number;
  pax: number;
  startDate?: string;
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
  pax: number;
  preferences: string[];
}

export interface EditPayload {
  itinerary_id: string;
  current_itinerary: DayItinerary[];
  user_request: string;
}
