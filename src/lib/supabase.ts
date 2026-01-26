import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
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
    is_admin: boolean
    seller_type: 'occasional' | 'shopkeeper'
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
export type ProductCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'electronics' | 'clothes' | 'furniture' | 'books' | 'vehicles' | 'livestock' | 'pharmacy' | 'jobs' | 'other'

export interface Product {
    id: string
    seller_id: string
    category: ProductCategory
    name: string
    quantity: string
    price: string  // Changed to string to allow text like "₹50/kg", "₹100/quintal"
    location: string | null
    pincode: string | null
    image_urls: string[]
    status: 'available' | 'sold' | 'expired'
    created_at: string
    // Pharmacy-specific fields
    medicines?: string[]
    discount_percent?: string
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

export interface DefaultImage {
    id: string
    image_type: 'category' | 'subcategory'
    name: string
    image_url: string
    created_at: string
    updated_at: string
}

export interface ProductReport {
    id: string
    reporter_id: string | null
    target_type: 'product' | 'request'
    target_id: string
    reason: string
    description: string | null
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
    admin_notes: string | null
    created_at: string
    resolved_at: string | null
    resolved_by: string | null
    // Joined fields
    reporter?: User
    product?: Product
    request?: ProductRequest
}

// Delivery Helper types
export type VehicleType = 'walk' | 'cycle' | 'bike' | 'auto' | 'tractor' | 'van'
export type AvailabilityTime = 'morning' | 'evening' | 'anytime'
export type DeliveryCapability = 'groceries' | 'dairy' | 'grains' | 'stationery' | 'books' | 'small_parcels' | 'furniture'

export interface DeliveryHelper {
    id: string
    user_id: string
    home_village: string
    service_villages: string[]
    vehicle_type: VehicleType
    availability_time: AvailabilityTime
    availability_hours: string | null
    capabilities: DeliveryCapability[]
    rate_same_village: number | null
    rate_nearby_village: number | null
    rate_far_village: number | null
    phone: string
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined fields
    user?: User
}

// Shop interface for shopkeeper profiles
export interface Shop {
    id: string
    user_id: string
    shop_name: string
    shop_slug: string
    description: string | null
    location: string | null
    pincode: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined fields
    owner?: User
}

// ============================================
// Shop Management Utilities
// ============================================

/**
 * Generate a URL-friendly slug from shop name
 */
export function generateShopSlug(shopName: string, phone: string): string {
    const baseSlug = shopName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
    // Add last 4 digits of phone for uniqueness
    const phoneSuffix = phone.slice(-4)
    return `${baseSlug}-${phoneSuffix}`
}

/**
 * Create a new shop for a user
 */
export async function createShop(
    userId: string,
    shopName: string,
    phone: string,
    description?: string,
    location?: string,
    pincode?: string
): Promise<Shop | null> {
    try {
        const shopSlug = generateShopSlug(shopName, phone)

        const { data, error } = await supabase
            .from('shops')
            .insert({
                user_id: userId,
                shop_name: shopName,
                shop_slug: shopSlug,
                description: description || null,
                location: location || null,
                pincode: pincode || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating shop:', error)
            return null
        }

        // Update user's seller_type to shopkeeper
        await supabase
            .from('users')
            .update({ seller_type: 'shopkeeper' })
            .eq('id', userId)

        return data
    } catch (error) {
        console.error('Error creating shop:', error)
        return null
    }
}

/**
 * Get shop by user ID
 */
export async function getShopByUserId(userId: string): Promise<Shop | null> {
    try {
        const { data, error } = await supabase
            .from('shops')
            .select(`
                *,
                owner:users!user_id(id, name, phone)
            `)
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // No shop found
            console.error('Error fetching shop:', error)
            return null
        }
        return data
    } catch (error) {
        console.error('Error fetching shop:', error)
        return null
    }
}

/**
 * Get shop by slug (for shareable links)
 */
export async function getShopBySlug(slug: string): Promise<Shop | null> {
    try {
        const { data, error } = await supabase
            .from('shops')
            .select(`
                *,
                owner:users!user_id(id, name, phone)
            `)
            .eq('shop_slug', slug)
            .eq('is_active', true)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // No shop found
            console.error('Error fetching shop by slug:', error)
            return null
        }
        return data
    } catch (error) {
        console.error('Error fetching shop by slug:', error)
        return null
    }
}

/**
 * Update shop details
 */
export async function updateShop(
    shopId: string,
    userId: string,
    updates: Partial<Pick<Shop, 'shop_name' | 'description' | 'location' | 'pincode' | 'is_active'>>
): Promise<boolean> {
    try {
        // Verify ownership
        const { data: shop } = await supabase
            .from('shops')
            .select('user_id')
            .eq('id', shopId)
            .single()

        if (!shop || shop.user_id !== userId) {
            console.error('Unauthorized: User does not own this shop')
            return false
        }

        const { error } = await supabase
            .from('shops')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', shopId)

        if (error) {
            console.error('Error updating shop:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error updating shop:', error)
        return false
    }
}

/**
 * Get all products from a shop owner
 */
export async function getShopProducts(userId: string): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                seller:users!seller_id(id, name, phone)
            `)
            .eq('seller_id', userId)
            .eq('status', 'available')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching shop products:', error)
            return []
        }
        return data || []
    } catch (error) {
        console.error('Error fetching shop products:', error)
        return []
    }
}

// ============================================
// Image Management Utilities
// ============================================

/**
 * Delete an image from Supabase storage by its public URL
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
    try {
        // Extract the file path from the public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
        const urlParts = imageUrl.split('/product-images/')
        if (urlParts.length !== 2) {
            console.warn('Invalid image URL format:', imageUrl)
            return false
        }
        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath])

        if (error) {
            console.error('Error deleting image from storage:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
}

/**
 * Upload a single image to Supabase storage
 */
export async function uploadProductImage(userId: string, file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
            console.error('Image upload error:', uploadError)
            return null
        }

        if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(uploadData.path)
            return publicUrl
        }
        return null
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }
}

/**
 * Update a product's image URLs in the database
 * SECURITY: Verifies ownership before updating
 */
export async function updateProductImages(productId: string, imageUrls: string[], userId: string): Promise<boolean> {
    try {
        // Verify ownership first
        const { data: product } = await supabase
            .from('products')
            .select('seller_id')
            .eq('id', productId)
            .single()

        if (!product || product.seller_id !== userId) {
            console.error('Unauthorized: User does not own this product')
            return false
        }

        const { error } = await supabase
            .from('products')
            .update({ image_urls: imageUrls })
            .eq('id', productId)

        if (error) {
            console.error('Error updating product images:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error updating product images:', error)
        return false
    }
}

// ============================================
// Secure Product Operations
// SECURITY: These functions verify ownership before performing operations
// ============================================

/**
 * Delete a product if the user owns it
 * SECURITY: Verifies ownership before deleting
 */
export async function deleteProductSecure(productId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
        // Verify ownership (or admin)
        const { data: product } = await supabase
            .from('products')
            .select('seller_id')
            .eq('id', productId)
            .single()

        if (!product) {
            console.error('Product not found')
            return false
        }

        if (product.seller_id !== userId && !isAdmin) {
            console.error('Unauthorized: User does not own this product and is not admin')
            return false
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        if (error) {
            console.error('Error deleting product:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error deleting product:', error)
        return false
    }
}

/**
 * Update a product if the user owns it
 * SECURITY: Verifies ownership before updating
 */
export async function updateProductSecure(
    productId: string,
    userId: string,
    updates: Partial<Pick<Product, 'name' | 'quantity' | 'price' | 'status' | 'location' | 'pincode'>>,
    isAdmin: boolean = false
): Promise<boolean> {
    try {
        // Verify ownership (or admin)
        const { data: product } = await supabase
            .from('products')
            .select('seller_id')
            .eq('id', productId)
            .single()

        if (!product) {
            console.error('Product not found')
            return false
        }

        if (product.seller_id !== userId && !isAdmin) {
            console.error('Unauthorized: User does not own this product and is not admin')
            return false
        }

        const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)

        if (error) {
            console.error('Error updating product:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error updating product:', error)
        return false
    }
}

/**
 * Delete a product request if the user owns it
 * SECURITY: Verifies ownership before deleting
 */
export async function deleteProductRequestSecure(requestId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
        // Verify ownership (or admin)
        const { data: request } = await supabase
            .from('product_requests')
            .select('buyer_id')
            .eq('id', requestId)
            .single()

        if (!request) {
            console.error('Request not found')
            return false
        }

        if (request.buyer_id !== userId && !isAdmin) {
            console.error('Unauthorized: User does not own this request and is not admin')
            return false
        }

        const { error } = await supabase
            .from('product_requests')
            .delete()
            .eq('id', requestId)

        if (error) {
            console.error('Error deleting request:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Error deleting request:', error)
        return false
    }
}
