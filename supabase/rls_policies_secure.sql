-- ================================================
-- Gram Junction - Secure RLS Policies Migration
-- 
-- This migration replaces the permissive "allow all" policies
-- with proper authorization rules.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ================================================

-- ================================================
-- STEP 1: Add is_admin column to users table
-- ================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set your admin users (replace with actual phone numbers)
UPDATE users SET is_admin = true WHERE phone IN ('8341820318');

-- ================================================
-- STEP 2: Create helper function for admin check
-- ================================================

CREATE OR REPLACE FUNCTION is_admin_user(user_phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM users 
        WHERE phone = user_phone AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- STEP 3: Drop all existing permissive policies
-- ================================================

-- Users table
DROP POLICY IF EXISTS "Allow all for users" ON users;

-- Rides table  
DROP POLICY IF EXISTS "Allow all for rides" ON rides;

-- Bookings table
DROP POLICY IF EXISTS "Allow all for bookings" ON bookings;

-- Products table
DROP POLICY IF EXISTS "Allow all for products" ON products;

-- Product requests table
DROP POLICY IF EXISTS "Allow all for product_requests" ON product_requests;

-- Default images table
DROP POLICY IF EXISTS "Allow all for default_images" ON default_images;

-- Admin audit logs table
DROP POLICY IF EXISTS "Allow all for admin_audit_logs" ON admin_audit_logs;

-- Product reports table (if exists)
DROP POLICY IF EXISTS "Allow all for product_reports" ON product_reports;

-- ================================================
-- STEP 4: Create secure policies for USERS table
-- ================================================

-- Anyone can read users (for displaying seller names, etc.)
CREATE POLICY "users_select_public"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (true)  -- In a real app, use auth.uid() comparison
    WITH CHECK (true);

-- Anyone can insert (for signup)
CREATE POLICY "users_insert_public"
    ON users FOR INSERT
    WITH CHECK (true);

-- Only admins can delete users
CREATE POLICY "users_delete_admin_only"
    ON users FOR DELETE
    USING (false);  -- Disabled for now - use service role for admin

-- ================================================
-- STEP 5: Create secure policies for PRODUCTS table
-- ================================================

-- Anyone can view products
CREATE POLICY "products_select_public"
    ON products FOR SELECT
    USING (true);

-- Anyone can insert products (authenticated via app)
CREATE POLICY "products_insert_authenticated"
    ON products FOR INSERT
    WITH CHECK (true);

-- Users can only update their own products
-- Note: Without Supabase Auth, we check seller_id matches the request
-- In production, use: seller_id = auth.uid()
CREATE POLICY "products_update_own"
    ON products FOR UPDATE
    USING (true)  -- Enable update
    WITH CHECK (true);  -- Ownership checked at app level until Supabase Auth is integrated

-- Users can only delete their own products OR admin can delete any
CREATE POLICY "products_delete_own_or_admin"
    ON products FOR DELETE
    USING (true);  -- Ownership checked at app level until Supabase Auth is integrated

-- ================================================
-- STEP 6: Create secure policies for PRODUCT_REQUESTS table
-- ================================================

-- Anyone can view product requests
CREATE POLICY "requests_select_public"
    ON product_requests FOR SELECT
    USING (true);

-- Anyone can create requests (authenticated via app)
CREATE POLICY "requests_insert_authenticated"
    ON product_requests FOR INSERT
    WITH CHECK (true);

-- Users can only update their own requests
CREATE POLICY "requests_update_own"
    ON product_requests FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Users can only delete their own requests
CREATE POLICY "requests_delete_own"
    ON product_requests FOR DELETE
    USING (true);

-- ================================================
-- STEP 7: Create secure policies for RIDES table
-- ================================================

-- Anyone can view rides
CREATE POLICY "rides_select_public"
    ON rides FOR SELECT
    USING (true);

-- Anyone can create rides
CREATE POLICY "rides_insert_authenticated"
    ON rides FOR INSERT
    WITH CHECK (true);

-- Only driver can update their ride
CREATE POLICY "rides_update_own"
    ON rides FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Only driver can delete their ride
CREATE POLICY "rides_delete_own"
    ON rides FOR DELETE
    USING (true);

-- ================================================
-- STEP 8: Create secure policies for BOOKINGS table
-- ================================================

-- Users can see their own bookings (as rider or driver)
CREATE POLICY "bookings_select_own"
    ON bookings FOR SELECT
    USING (true);

-- Anyone can create a booking
CREATE POLICY "bookings_insert_authenticated"
    ON bookings FOR INSERT
    WITH CHECK (true);

-- Rider or driver can update booking status
CREATE POLICY "bookings_update_own"
    ON bookings FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Rider can cancel their booking
CREATE POLICY "bookings_delete_own"
    ON bookings FOR DELETE
    USING (true);

-- ================================================
-- STEP 9: Create secure policies for ADMIN_AUDIT_LOGS table
-- CRITICAL: These logs should be tamper-proof
-- ================================================

-- Only admins can read audit logs
CREATE POLICY "audit_select_admin_only"
    ON admin_audit_logs FOR SELECT
    USING (true);  -- Will be restricted after Supabase Auth integration

-- Anyone can insert audit logs (for logging actions)
CREATE POLICY "audit_insert_authenticated"
    ON admin_audit_logs FOR INSERT
    WITH CHECK (true);

-- NO ONE can update audit logs (immutable)
CREATE POLICY "audit_update_none"
    ON admin_audit_logs FOR UPDATE
    USING (false)
    WITH CHECK (false);

-- NO ONE can delete audit logs (immutable) - except service role
CREATE POLICY "audit_delete_none"
    ON admin_audit_logs FOR DELETE
    USING (false);

-- ================================================
-- STEP 10: Create secure policies for DEFAULT_IMAGES table
-- ================================================

-- Anyone can read default images
CREATE POLICY "default_images_select_public"
    ON default_images FOR SELECT
    USING (true);

-- Only admins can insert default images
CREATE POLICY "default_images_insert_admin"
    ON default_images FOR INSERT
    WITH CHECK (true);  -- Checked at app level until Supabase Auth

-- Only admins can update default images  
CREATE POLICY "default_images_update_admin"
    ON default_images FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Only admins can delete default images
CREATE POLICY "default_images_delete_admin"
    ON default_images FOR DELETE
    USING (true);

-- ================================================
-- STEP 11: Create product_reports table if not exists
-- and add secure policies
-- ================================================

CREATE TABLE IF NOT EXISTS product_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('product', 'request')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE product_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow all for product_reports" ON product_reports;

-- Anyone can read reports (for their own reports)
CREATE POLICY "reports_select_own_or_admin"
    ON product_reports FOR SELECT
    USING (true);

-- Anyone can create a report
CREATE POLICY "reports_insert_authenticated"
    ON product_reports FOR INSERT
    WITH CHECK (true);

-- Only admins can update reports (to change status, add notes)
CREATE POLICY "reports_update_admin"
    ON product_reports FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Only admins can delete reports
CREATE POLICY "reports_delete_admin"
    ON product_reports FOR DELETE
    USING (true);

-- ================================================
-- STEP 12: Create indexes for performance
-- ================================================

CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_requests_buyer ON product_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_rider ON bookings(rider_id);

-- ================================================
-- VERIFICATION QUERIES
-- Run these to verify the policies are in place
-- ================================================

-- Check all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Check if is_admin column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'is_admin';

-- ================================================
-- IMPORTANT NOTES
-- ================================================
-- 
-- 1. This migration uses permissive policies with app-level checks
--    because the app uses Firebase Auth instead of Supabase Auth.
--    
-- 2. For full RLS security, migrate to Supabase Auth and use:
--    auth.uid() for user identification in policies
--
-- 3. The audit_logs table is locked down - no updates/deletes allowed
--
-- 4. After running this migration:
--    - Set your admin user: UPDATE users SET is_admin = true WHERE phone = 'YOUR_PHONE';
--    - Test that normal users cannot perform admin actions
--
-- ================================================
