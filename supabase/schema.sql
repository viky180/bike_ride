-- ================================================
-- Gramin Sawari - Rural Ride Sharing Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified, phone-based identification)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_driver BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rides posted by drivers
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL CHECK (destination IN ('block_office', 'market', 'bus_stand', 'phc', 'bank')),
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER DEFAULT 1 CHECK (available_seats >= 0 AND available_seats <= 4),
  cost_per_seat INTEGER DEFAULT 10 CHECK (cost_per_seat >= 0),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ride bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ride_id, rider_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_rides_destination ON rides(destination);
CREATE INDEX IF NOT EXISTS idx_rides_departure ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_bookings_ride ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_rider ON bookings(rider_id);

-- Row Level Security (RLS) - Keep it simple for MVP
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth in MVP)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for rides" ON rides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-update ride status when seats are full
CREATE OR REPLACE FUNCTION update_ride_status()
RETURNS TRIGGER AS $$
DECLARE
  accepted_count INTEGER;
  total_seats INTEGER;
BEGIN
  IF NEW.status = 'accepted' THEN
    SELECT COUNT(*) INTO accepted_count
    FROM bookings
    WHERE ride_id = NEW.ride_id AND status = 'accepted';
    
    SELECT available_seats INTO total_seats
    FROM rides
    WHERE id = NEW.ride_id;
    
    IF accepted_count >= total_seats THEN
      UPDATE rides SET status = 'full' WHERE id = NEW.ride_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_accepted
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION update_ride_status();
