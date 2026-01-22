// Default images utility - stores default images for categories and sub-categories in Supabase

import { supabase, ProductCategory } from './supabase'
import { POPULAR_PRODUCTS, PopularProduct } from './popularProducts'

interface DefaultImageStore {
    [key: string]: string // category/subcategory -> image URL
}

// Local cache for images (populated from database)
let categoryImagesCache: DefaultImageStore = {}
let subcategoryImagesCache: DefaultImageStore = {}
let cacheLoaded = false

/**
 * Load all default images from database into cache
 * Call this on app initialization
 */
export async function loadDefaultImagesFromDB(): Promise<void> {
    try {
        const { data, error } = await supabase
            .from('default_images')
            .select('*')

        if (error) {
            console.error('Error loading default images:', error)
            return
        }

        // Clear and populate caches
        categoryImagesCache = {}
        subcategoryImagesCache = {}

        for (const row of data || []) {
            if (row.image_type === 'category') {
                categoryImagesCache[row.name] = row.image_url
            } else if (row.image_type === 'subcategory') {
                subcategoryImagesCache[row.name] = row.image_url
            }
        }

        cacheLoaded = true
    } catch (err) {
        console.error('Failed to load default images:', err)
    }
}

/**
 * Get all default category images from cache
 */
export function getAllDefaultImages(): DefaultImageStore {
    return { ...categoryImagesCache }
}

/**
 * Get all default sub-category images from cache
 */
export function getAllSubcategoryImages(): DefaultImageStore {
    return { ...subcategoryImagesCache }
}

/**
 * Check if cache has been loaded
 */
export function isCacheLoaded(): boolean {
    return cacheLoaded
}

/**
 * Get default image for a specific category
 */
export function getDefaultImage(category: ProductCategory): string | null {
    return categoryImagesCache[category] || null
}

/**
 * Find the English name key for a product based on Hindi name matching
 * This helps match products named in Hindi to images stored with English keys
 */
function findEnglishKeyForHindiName(productName: string): string | null {
    const normalizedName = productName.toLowerCase().trim()

    // Search all categories for a matching Hindi name
    for (const products of Object.values(POPULAR_PRODUCTS)) {
        for (const product of products as PopularProduct[]) {
            const hindiLower = product.hi.toLowerCase()
            const englishLower = product.name.toLowerCase()

            // Check if product name matches or contains Hindi name
            if (normalizedName === hindiLower ||
                normalizedName.includes(hindiLower) ||
                hindiLower.includes(normalizedName)) {
                return englishLower
            }
            // Also check if it matches English name
            if (normalizedName === englishLower ||
                normalizedName.includes(englishLower) ||
                englishLower.includes(normalizedName)) {
                return englishLower
            }
        }
    }
    return null
}

/**
 * Get default image for a specific sub-category (product name)
 * Falls back to category default if sub-category not found
 * Supports matching both English and Hindi product names
 */
export function getDefaultImageForProduct(category: ProductCategory, productName: string): string | null {
    const normalizedName = productName.toLowerCase().trim()

    // Direct match: Check for exact or partial match in sub-category images
    for (const [key, url] of Object.entries(subcategoryImagesCache)) {
        const lowerKey = key.toLowerCase()
        // Exact match
        if (lowerKey === normalizedName) {
            return url
        }
        // Product name contains the key (e.g., "Fresh Curd" contains "curd")
        if (normalizedName.includes(lowerKey)) {
            return url
        }
        // Key contains the product name (e.g., "mobile phone" key matches "phone" product)
        if (lowerKey.includes(normalizedName)) {
            return url
        }
    }

    // Hindi name lookup: Find English key for Hindi-named products
    const englishKey = findEnglishKeyForHindiName(productName)
    if (englishKey && subcategoryImagesCache[englishKey]) {
        return subcategoryImagesCache[englishKey]
    }

    // Fall back to category default
    return getDefaultImage(category)
}

/**
 * Set default image for a category (saves to database)
 */
export async function setDefaultImage(category: ProductCategory, imageUrl: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('default_images')
            .upsert({
                image_type: 'category',
                name: category,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'image_type,name'
            })

        if (error) {
            console.error('Error saving category image:', error)
            return false
        }

        // Update local cache
        categoryImagesCache[category] = imageUrl
        return true
    } catch (err) {
        console.error('Failed to save category image:', err)
        return false
    }
}

/**
 * Set default image for a sub-category (saves to database)
 */
export async function setSubcategoryImage(subcategoryName: string, imageUrl: string): Promise<boolean> {
    const name = subcategoryName.toLowerCase()
    try {
        const { error } = await supabase
            .from('default_images')
            .upsert({
                image_type: 'subcategory',
                name: name,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'image_type,name'
            })

        if (error) {
            console.error('Error saving subcategory image:', error)
            return false
        }

        // Update local cache
        subcategoryImagesCache[name] = imageUrl
        return true
    } catch (err) {
        console.error('Failed to save subcategory image:', err)
        return false
    }
}

/**
 * Remove default image for a category (deletes from database)
 */
export async function removeDefaultImage(category: ProductCategory): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('default_images')
            .delete()
            .eq('image_type', 'category')
            .eq('name', category)

        if (error) {
            console.error('Error removing category image:', error)
            return false
        }

        // Update local cache
        delete categoryImagesCache[category]
        return true
    } catch (err) {
        console.error('Failed to remove category image:', err)
        return false
    }
}

/**
 * Remove default image for a sub-category (deletes from database)
 */
export async function removeSubcategoryImage(subcategoryName: string): Promise<boolean> {
    const name = subcategoryName.toLowerCase()
    try {
        const { error } = await supabase
            .from('default_images')
            .delete()
            .eq('image_type', 'subcategory')
            .eq('name', name)

        if (error) {
            console.error('Error removing subcategory image:', error)
            return false
        }

        // Update local cache
        delete subcategoryImagesCache[name]
        return true
    } catch (err) {
        console.error('Failed to remove subcategory image:', err)
        return false
    }
}
