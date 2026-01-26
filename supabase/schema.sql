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
  pincode TEXT,            -- 6-digit pincode for location filtering
  image_urls JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs (max 3)
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_pincode ON products(pincode);

-- Migration: Add pincode column to existing products table (run if table already exists)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS pincode TEXT;
-- CREATE INDEX IF NOT EXISTS idx_products_pincode ON products(pincode);

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

-- ================================================
-- Default Images for Categories/Sub-categories
-- ================================================

-- Default images for categories and sub-categories (moved from localStorage)
CREATE TABLE IF NOT EXISTS default_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_type TEXT NOT NULL CHECK (image_type IN ('category', 'subcategory')),
  name TEXT NOT NULL,  -- category id or subcategory name (lowercase)
  image_url TEXT NOT NULL,  -- base64 data URL or external URL
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(image_type, name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_default_images_type_name ON default_images(image_type, name);

-- RLS for default_images
ALTER TABLE default_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for default_images" ON default_images FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Admin Panel Security
-- ================================================

-- Add admin flag to users table (run as migration if table exists)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Admin audit log for tracking all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,              -- 'admin_login', 'admin_logout', 'delete_product', 'view_dashboard', etc.
  target_type TEXT,                  -- 'product', 'user', 'category', 'subcategory', 'session', etc.
  target_id UUID,                    -- ID of the affected resource (if applicable)
  details JSONB DEFAULT '{}'::jsonb, -- Additional action details
  ip_address TEXT,                   -- Client IP address (if available)
  user_agent TEXT,                   -- Browser user agent
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for admin_audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_logs(target_type, target_id);

-- RLS for admin_audit_logs (allow all for now, can be restricted later)
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for admin_audit_logs" ON admin_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Delivery Helpers Module
-- ================================================

-- Delivery helpers registration (connecting buyers with local delivery people)
CREATE TABLE IF NOT EXISTS delivery_helpers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  home_village TEXT NOT NULL,
  service_villages TEXT[] NOT NULL,  -- max 5 including home village
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('walk', 'cycle', 'bike', 'auto', 'tractor', 'van')),
  availability_time TEXT NOT NULL CHECK (availability_time IN ('morning', 'evening', 'anytime')),
  availability_hours TEXT,  -- optional custom hours, e.g., "9-12, 4-7"
  capabilities TEXT[] NOT NULL,  -- item types: groceries, dairy, grains, stationery, books, small_parcels, furniture
  rate_same_village INTEGER,  -- optional approx rate in rupees
  rate_nearby_village INTEGER,
  rate_far_village INTEGER,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for delivery_helpers
CREATE INDEX IF NOT EXISTS idx_delivery_helpers_user ON delivery_helpers(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_helpers_home_village ON delivery_helpers(home_village);
CREATE INDEX IF NOT EXISTS idx_delivery_helpers_service_villages ON delivery_helpers USING GIN(service_villages);
CREATE INDEX IF NOT EXISTS idx_delivery_helpers_active ON delivery_helpers(is_active);

-- RLS for delivery_helpers
ALTER TABLE delivery_helpers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for delivery_helpers" ON delivery_helpers FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Shops Module (Shopkeeper Profiles)
-- ================================================

-- Add seller type to users (migration)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'occasional' CHECK (seller_type IN ('occasional', 'shopkeeper'));

-- Shops table for regular shopkeepers
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,  -- URL-friendly name for shareable links (e.g., "ramesh-kirana")
  description TEXT,
  location TEXT,
  pincode TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for shops
CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(shop_slug);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);

-- RLS for shops
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for shops" ON shops FOR ALL USING (true) WITH CHECK (true);
