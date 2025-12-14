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
    destination: 'block_office' | 'market' | 'bus_stand' | 'phc' | 'bank'
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
