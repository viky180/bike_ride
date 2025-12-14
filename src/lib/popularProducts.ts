// Popular products by category for quick selection
import { ProductCategory } from './supabase'

export interface PopularProduct {
    name: string
    icon: string
    hi: string  // Hindi name
}

export const POPULAR_PRODUCTS: Record<ProductCategory, PopularProduct[]> = {
    vegetables: [
        { name: 'Tomato', icon: '🍅', hi: 'टमाटर' },
        { name: 'Potato', icon: '🥔', hi: 'आलू' },
        { name: 'Onion', icon: '🧅', hi: 'प्याज़' },
        { name: 'Carrot', icon: '🥕', hi: 'गाजर' },
        { name: 'Cabbage', icon: '🥬', hi: 'पत्ता गोभी' },
        { name: 'Brinjal', icon: '🍆', hi: 'बैंगन' },
        { name: 'Chilli', icon: '🌶️', hi: 'मिर्च' },
        { name: 'Cauliflower', icon: '🥦', hi: 'फूल गोभी' },
    ],
    fruits: [
        { name: 'Mango', icon: '🥭', hi: 'आम' },
        { name: 'Banana', icon: '🍌', hi: 'केला' },
        { name: 'Apple', icon: '🍎', hi: 'सेब' },
        { name: 'Orange', icon: '🍊', hi: 'संतरा' },
        { name: 'Grapes', icon: '🍇', hi: 'अंगूर' },
        { name: 'Watermelon', icon: '🍉', hi: 'तरबूज़' },
        { name: 'Papaya', icon: '🍈', hi: 'पपीता' },
        { name: 'Guava', icon: '🍐', hi: 'अमरूद' },
    ],
    grains: [
        { name: 'Wheat', icon: '🌾', hi: 'गेहूँ' },
        { name: 'Rice', icon: '🍚', hi: 'चावल' },
        { name: 'Corn', icon: '🌽', hi: 'मक्का' },
        { name: 'Lentils', icon: '🫘', hi: 'दाल' },
        { name: 'Mustard', icon: '🌻', hi: 'सरसों' },
        { name: 'Chickpeas', icon: '🥜', hi: 'चना' },
    ],
    dairy: [
        { name: 'Milk', icon: '🥛', hi: 'दूध' },
        { name: 'Curd', icon: '🍶', hi: 'दही' },
        { name: 'Ghee', icon: '🧈', hi: 'घी' },
        { name: 'Butter', icon: '🧈', hi: 'मक्खन' },
        { name: 'Paneer', icon: '🧀', hi: 'पनीर' },
    ],
    other: [
        { name: 'Eggs', icon: '🥚', hi: 'अंडे' },
        { name: 'Honey', icon: '🍯', hi: 'शहद' },
        { name: 'Jaggery', icon: '🟤', hi: 'गुड़' },
    ]
}

export function getPopularProducts(category: ProductCategory): PopularProduct[] {
    return POPULAR_PRODUCTS[category] || []
}
