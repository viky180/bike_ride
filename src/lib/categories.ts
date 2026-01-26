// Product categories with icons and translations
import { ProductCategory } from './supabase'

// Service categories (not products)
export type ServiceCategory = 'delivery_help'

export interface Category {
    id: ProductCategory | ServiceCategory
    icon: string
    en: string
    hi: string
    color: string
    image?: string // Path to category image
    isHero?: boolean // Featured in hero section
}

export type ProductCategoryEntry = Category & { id: ProductCategory }
export type ServiceCategoryEntry = Category & { id: ServiceCategory }

// Hero categories - Agriculture / खेती-बाड़ी section
export const HERO_CATEGORIES: ProductCategoryEntry[] = [
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
        en: 'Dairy',
        hi: 'दूध/डेयरी',
        color: '#3b82f6',
        image: '/images/categories/dairy.png',
        isHero: true
    },
    {
        id: 'grains',
        icon: '🌾',
        en: 'Grains',
        hi: 'अनाज',
        color: '#f59e0b',
        image: '/images/categories/grain.png',
        isHero: true
    },
]

// Standard categories - 3-column grid
export const STANDARD_CATEGORIES: (ProductCategoryEntry | ServiceCategoryEntry)[] = [
    {
        id: 'delivery_help',
        icon: '🚚',
        en: 'Delivery Help',
        hi: 'डिलीवरी सहायता',
        color: '#0ea5e9',
        image: '/images/categories/delivery.png'
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
        id: 'books',
        icon: '📚',
        en: 'Books & Stationery',
        hi: 'किताबें और स्टेशनरी',
        color: '#84cc16',
        image: '/images/categories/books.png'
    },
    {
        id: 'pharmacy',
        icon: '💊',
        en: 'Pharmacy',
        hi: 'दवाखाना',
        color: '#ef4444',
        image: '/images/categories/pharmacy.png'
    },
    {
        id: 'jobs',
        icon: '💼',
        en: 'Jobs',
        hi: 'नौकरी',
        color: '#8b5cf6',
        image: '/images/categories/jobs.png'
    },
    {
        id: 'electronics',
        icon: '📱',
        en: 'Electronics',
        hi: 'इलेक्ट्रॉनिक्स',
        color: '#6366f1',
        image: '/images/categories/electronics.png'
    },
    {
        id: 'furniture',
        icon: '🪑',
        en: 'Furniture',
        hi: 'फर्नीचर',
        color: '#a855f7',
        image: '/images/categories/furniture.png'
    }
]

// All categories combined (for backwards compatibility)
export const CATEGORIES: ProductCategoryEntry[] = [
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
        id: 'books',
        icon: '📚',
        en: 'Books & Stationery',
        hi: 'किताबें और स्टेशनरी',
        color: '#84cc16'
    },
    {
        id: 'pharmacy',
        icon: '💊',
        en: 'Pharmacy',
        hi: 'दवाखाना',
        color: '#ef4444'
    },
    {
        id: 'jobs',
        icon: '💼',
        en: 'Jobs',
        hi: 'नौकरी',
        color: '#8b5cf6'
    },
    {
        id: 'furniture',
        icon: '🪑',
        en: 'Furniture',
        hi: 'फर्नीचर',
        color: '#a855f7'
    },
    {
        id: 'other',
        icon: '📦',
        en: 'Other',
        hi: 'अन्य',
        color: '#8b5cf6'
    }
]

export function getCategory(id: ProductCategory): ProductCategoryEntry | undefined {
    return CATEGORIES.find(c => c.id === id)
}

// Product-only categories (excludes service categories like delivery_help)
// Use this in sell forms, demand boards, and other product-specific contexts
export const PRODUCT_STANDARD_CATEGORIES = STANDARD_CATEGORIES.filter(
    (cat): cat is ProductCategoryEntry => cat.id !== 'delivery_help'
)

// Home category list includes service categories like delivery_help
const DELIVERY_HELP_CATEGORY = STANDARD_CATEGORIES.find(
    (cat): cat is ServiceCategoryEntry => cat.id === 'delivery_help'
)
const ELECTRONICS_INDEX = CATEGORIES.findIndex(cat => cat.id === 'electronics')
const HOME_BASE_CATEGORIES =
    ELECTRONICS_INDEX === -1
        ? CATEGORIES
        : [
            ...CATEGORIES.slice(0, ELECTRONICS_INDEX),
            ...(DELIVERY_HELP_CATEGORY ? [DELIVERY_HELP_CATEGORY] : []),
            ...CATEGORIES.slice(ELECTRONICS_INDEX)
        ]

export const HOME_CATEGORIES: (ProductCategoryEntry | ServiceCategoryEntry)[] = [
    ...HOME_BASE_CATEGORIES
]

