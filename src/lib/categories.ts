// Product categories with icons and translations
import { ProductCategory } from './supabase'

export interface Category {
    id: ProductCategory
    icon: string
    en: string
    hi: string
    color: string
}

export const CATEGORIES: Category[] = [
    {
        id: 'vegetables',
        icon: '🥬',
        en: 'Vegetables',
        hi: 'सब्ज़ियाँ',
        color: '#22c55e' // green
    },
    {
        id: 'fruits',
        icon: '🍎',
        en: 'Fruits',
        hi: 'फल',
        color: '#ef4444' // red
    },
    {
        id: 'grains',
        icon: '🌾',
        en: 'Grains',
        hi: 'अनाज',
        color: '#f59e0b' // amber
    },
    {
        id: 'dairy',
        icon: '🥛',
        en: 'Dairy',
        hi: 'दूध/डेयरी',
        color: '#3b82f6' // blue
    },
    {
        id: 'other',
        icon: '📦',
        en: 'Other',
        hi: 'अन्य',
        color: '#8b5cf6' // violet
    }
]

export function getCategory(id: ProductCategory): Category | undefined {
    return CATEGORIES.find(c => c.id === id)
}
