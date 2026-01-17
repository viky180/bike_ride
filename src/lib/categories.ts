// Product categories with icons and translations
import { ProductCategory } from './supabase'

export interface Category {
    id: ProductCategory
    icon: string
    en: string
    hi: string
    color: string
    image?: string // Path to category image
    isHero?: boolean // Featured in hero section
}

// Hero categories - featured with larger cards
export const HERO_CATEGORIES: Category[] = [
    {
        id: 'vegetables',
        icon: '🥬',
        en: 'Vegetables & Fruits',
        hi: 'सब्जियाँ और फल',
        color: '#22c55e',
        image: '/images/categories/fruits_vegetables.png',
        isHero: true
    },
    {
        id: 'dairy',
        icon: '🥛',
        en: 'Dairy & Grains',
        hi: 'दूध और अनाज',
        color: '#3b82f6',
        image: '/images/categories/dairy.png',
        isHero: true
    }
]

// Standard categories - 3-column grid
export const STANDARD_CATEGORIES: Category[] = [
    {
        id: 'electronics',
        icon: '📱',
        en: 'Electronics',
        hi: 'इलेक्ट्रॉनिक्स',
        color: '#6366f1',
        image: '/images/categories/electronics.png'
    },
    {
        id: 'clothes',
        icon: '👕',
        en: 'Clothes',
        hi: 'कपड़े',
        color: '#ec4899',
        image: '/images/categories/faishion.png'
    },
    {
        id: 'furniture',
        icon: '🪑',
        en: 'Furniture',
        hi: 'फर्नीचर',
        color: '#f59e0b',
        image: '/images/categories/furniture.png'
    },
    {
        id: 'books',
        icon: '📚',
        en: 'Old Books',
        hi: 'पुरानी किताबें',
        color: '#84cc16',
        image: '/images/categories/books.png'
    },
    {
        id: 'stationery',
        icon: '✏️',
        en: 'Stationery',
        hi: 'स्टेशनरी',
        color: '#14b8a6',
        image: '/images/categories/stationary.png'
    },
    {
        id: 'vehicles',
        icon: '🛵',
        en: 'Vehicles',
        hi: 'वाहन',
        color: '#f97316',
        image: '/images/categories/vehicle.png'
    }
]

// All categories combined (for backwards compatibility)
export const CATEGORIES: Category[] = [
    // Original agriculture categories
    {
        id: 'vegetables',
        icon: '🥬',
        en: 'Vegetables',
        hi: 'सब्ज़ियाँ',
        color: '#22c55e'
    },
    {
        id: 'fruits',
        icon: '🍎',
        en: 'Fruits',
        hi: 'फल',
        color: '#ef4444'
    },
    {
        id: 'grains',
        icon: '🌾',
        en: 'Grains',
        hi: 'अनाज',
        color: '#f59e0b'
    },
    {
        id: 'dairy',
        icon: '🥛',
        en: 'Dairy',
        hi: 'दूध/डेयरी',
        color: '#3b82f6'
    },
    // New expanded categories
    {
        id: 'electronics',
        icon: '📱',
        en: 'Electronics',
        hi: 'इलेक्ट्रॉनिक्स',
        color: '#6366f1'
    },
    {
        id: 'clothes',
        icon: '👕',
        en: 'Clothes',
        hi: 'कपड़े',
        color: '#ec4899'
    },
    {
        id: 'furniture',
        icon: '🪑',
        en: 'Furniture',
        hi: 'फर्नीचर',
        color: '#a855f7'
    },
    {
        id: 'books',
        icon: '📚',
        en: 'Old Books',
        hi: 'पुरानी किताबें',
        color: '#84cc16'
    },
    {
        id: 'stationery',
        icon: '✏️',
        en: 'Stationery',
        hi: 'स्टेशनरी',
        color: '#14b8a6'
    },
    {
        id: 'vehicles',
        icon: '🛵',
        en: 'Vehicles',
        hi: 'वाहन',
        color: '#f97316'
    },
    {
        id: 'other',
        icon: '📦',
        en: 'Other',
        hi: 'अन्य',
        color: '#8b5cf6'
    }
]

export function getCategory(id: ProductCategory): Category | undefined {
    return CATEGORIES.find(c => c.id === id)
}
