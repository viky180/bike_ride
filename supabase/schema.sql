-- ================================================
-- Gram Junction - Rural Ride Sharing & Local Marketplace Schema
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
  origin TEXT,  -- Free text origin location, e.g., "रामपुर गाँव"
  destination TEXT NOT NULL,  -- Free text destination, e.g., "ब्लॉक कार्यालय"
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

-- ================================================
-- Produce Discovery Module
-- ================================================

-- Products listed for sale
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vegetables', 'fruits', 'grains', 'dairy', 'other')),
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,  -- e.g., "10 kg", "50 pieces"
  price INTEGER NOT NULL CHECK (price > 0),
  location TEXT,           -- Village/area name
  image_urls JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs (max 3)
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);

-- RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Product Demand (Zarurat Board) Module
-- ================================================

-- Product requests/demands from buyers
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vegetables', 'fruits', 'grains', 'dairy', 'other')),
  product_name TEXT NOT NULL,
  quantity TEXT,                -- e.g., "5 kg", "daily"
  expected_price INTEGER,       -- Optional expected price
  location TEXT,                -- Village/area name
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);

-- Indexes for product_requests
CREATE INDEX IF NOT EXISTS idx_requests_category ON product_requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_buyer ON product_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requests_expires ON product_requests(expires_at);

-- RLS for product_requests
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for product_requests" ON product_requests FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Storage Bucket Policies (for product-images)
-- NOTE: Create the 'product-images' bucket via Supabase Dashboard first
-- Then run these policies:
-- ================================================

-- Migration to add image_url to existing products table (run once if table already exists)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Storage policies (uncomment after creating bucket named 'product-images' in dashboard)
-- Policy: Anyone can view product images (public read)
-- CREATE POLICY "Public read access for product images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'product-images');

-- Policy: Anyone can upload product images (since auth is phone-based in this app)
-- CREATE POLICY "Public upload for product images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'product-images');

-- Policy: Anyone can delete product images
-- CREATE POLICY "Public delete for product images"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'product-images');
