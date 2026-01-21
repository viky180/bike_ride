// Default images utility - stores default images for categories and sub-categories

import { ProductCategory } from './supabase'
import { POPULAR_PRODUCTS, PopularProduct } from './popularProducts'

const STORAGE_KEY = 'default_category_images'
const SUBCATEGORY_STORAGE_KEY = 'default_subcategory_images'

interface DefaultImageStore {
    [key: string]: string // category/subcategory -> image URL
}

/**
 * Get all default category images from storage
 */
export function getAllDefaultImages(): DefaultImageStore {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

/**
 * Get all default sub-category images from storage
 */
export function getAllSubcategoryImages(): DefaultImageStore {
    try {
        const stored = localStorage.getItem(SUBCATEGORY_STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

/**
 * Get default image for a specific category
 */
export function getDefaultImage(category: ProductCategory): string | null {
    const images = getAllDefaultImages()
    return images[category] || null
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
    const subcategoryImages = getAllSubcategoryImages()
    const normalizedName = productName.toLowerCase().trim()

    // Direct match: Check for exact or partial match in sub-category images
    for (const [key, url] of Object.entries(subcategoryImages)) {
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
    if (englishKey && subcategoryImages[englishKey]) {
        return subcategoryImages[englishKey]
    }

    // Fall back to category default
    return getDefaultImage(category)
}

/**
 * Set default image for a category
 */
export function setDefaultImage(category: ProductCategory, imageUrl: string): void {
    const images = getAllDefaultImages()
    images[category] = imageUrl
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

/**
 * Set default image for a sub-category
 */
export function setSubcategoryImage(subcategoryName: string, imageUrl: string): void {
    const images = getAllSubcategoryImages()
    images[subcategoryName.toLowerCase()] = imageUrl
    localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(images))
}

/**
 * Remove default image for a category
 */
export function removeDefaultImage(category: ProductCategory): void {
    const images = getAllDefaultImages()
    delete images[category]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

/**
 * Remove default image for a sub-category
 */
export function removeSubcategoryImage(subcategoryName: string): void {
    const images = getAllSubcategoryImages()
    delete images[subcategoryName.toLowerCase()]
    localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(images))
}
