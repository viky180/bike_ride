import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file.')
}

// Create client (or a dummy one if not configured)
export const supabase: SupabaseClient = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key')

// Types for our database
export interface User {
    id: string
    phone: string
    name: string
    is_driver: boolean
    created_at: string
}

export interface Ride {
    id: string
    driver_id: string
    origin: string          // Free text, e.g., "रामपुर गाँव"
    destination: string     // Free text, e.g., "ब्लॉक कार्यालय"
    departure_time: string
    available_seats: number
    cost_per_seat: number
    status: 'open' | 'full' | 'completed' | 'cancelled'
    created_at: string
    // Joined fields
    driver?: User
}

export interface Booking {
    id: string
    ride_id: string
    rider_id: string
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
    created_at: string
    // Joined fields
    ride?: Ride
    rider?: User
}

// Product categories
export type ProductCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'other'

export interface Product {
    id: string
    seller_id: string
    category: ProductCategory
    name: string
    quantity: string
    price: number
    location: string | null
    status: 'available' | 'sold' | 'expired'
    created_at: string
    // Joined fields
    seller?: User
}

export interface ProductRequest {
    id: string
    buyer_id: string
    category: ProductCategory
    product_name: string
    quantity: string | null
    expected_price: number | null
    location: string | null
    status: 'active' | 'fulfilled' | 'expired'
    created_at: string
    expires_at: string
    // Joined fields
    buyer?: User
}
