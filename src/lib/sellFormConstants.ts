// Sell form constants and types

// Electronics sub-items
export const ELECTRONICS_ITEMS = [
    { id: 'phone', icon: '📱', en: 'Phone', hi: 'फोन' },
    { id: 'laptop', icon: '💻', en: 'Laptop', hi: 'लैपटॉप' },
    { id: 'ac', icon: '❄️', en: 'AC', hi: 'एसी' },
    { id: 'geyser', icon: '🚿', en: 'Geyser', hi: 'गीज़र' },
    { id: 'bulb', icon: '💡', en: 'Bulb/Light', hi: 'बल्ब/लाइट' },
    { id: 'earphone', icon: '🎧', en: 'Earphone', hi: 'ईयरफोन' },
    { id: 'mixer', icon: '🍹', en: 'Mixer/Grinder', hi: 'मिक्सर/ग्राइंडर' },
    { id: 'accessories', icon: '🔌', en: 'Mobile Accessories', hi: 'मोबाइल एसेसरीज़' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
] as const

// Clothes sub-items
export const CLOTHES_ITEMS = [
    { id: 'shirt', icon: '👔', en: 'Shirt', hi: 'शर्ट' },
    { id: 'tshirt', icon: '👕', en: 'T-Shirt', hi: 'टी-शर्ट' },
    { id: 'pants', icon: '👖', en: 'Pants/Jeans', hi: 'पैंट/जींस' },
    { id: 'kurta', icon: '🥻', en: 'Kurta', hi: 'कुर्ता' },
    { id: 'saree', icon: '👗', en: 'Saree', hi: 'साड़ी' },
    { id: 'suit', icon: '🤵', en: 'Suit/Blazer', hi: 'सूट/ब्लेज़र' },
    { id: 'dress', icon: '👗', en: 'Dress', hi: 'ड्रेस' },
    { id: 'jacket', icon: '🧥', en: 'Jacket/Sweater', hi: 'जैकेट/स्वेटर' },
    { id: 'kids', icon: '🧒', en: 'Kids Wear', hi: 'बच्चों के कपड़े' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
] as const

// Size options for clothes
export const SIZE_OPTIONS = [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
    { id: 'xxl', label: 'XXL' },
    { id: 'free', label: 'Free Size' },
] as const

// Books sub-items
export const BOOKS_ITEMS = [
    { id: 'textbook', icon: '📖', en: 'Textbook', hi: 'पाठ्यपुस्तक' },
    { id: 'novel', icon: '📚', en: 'Novel/Story', hi: 'नॉवेल/कहानी' },
    { id: 'competitive', icon: '🏆', en: 'Competitive Exam', hi: 'प्रतियोगी परीक्षा' },
    { id: 'ncert', icon: '🏫', en: 'NCERT/CBSE', hi: 'NCERT/CBSE' },
    { id: 'reference', icon: '📑', en: 'Reference Book', hi: 'संदर्भ पुस्तक' },
    { id: 'religious', icon: '🙏', en: 'Religious', hi: 'धार्मिक' },
    { id: 'children', icon: '👶', en: 'Children Books', hi: 'बच्चों की किताबें' },
    { id: 'magazine', icon: '📰', en: 'Magazine/Comics', hi: 'मैगज़ीन/कॉमिक्स' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
] as const

// Vehicles sub-items
export const VEHICLES_ITEMS = [
    { id: 'scooter', icon: '🛵', en: 'Scooter', hi: 'स्कूटर' },
    { id: 'motorcycle', icon: '🏍️', en: 'Motorcycle', hi: 'मोटरसाइकिल' },
    { id: 'bicycle', icon: '🚲', en: 'Bicycle', hi: 'साइकिल' },
    { id: 'car', icon: '🚗', en: 'Car', hi: 'कार' },
    { id: 'auto', icon: '🛺', en: 'Auto Rickshaw', hi: 'ऑटो रिक्शा' },
    { id: 'tractor', icon: '🚜', en: 'Tractor', hi: 'ट्रैक्टर' },
    { id: 'truck', icon: '🚚', en: 'Truck/Tempo', hi: 'ट्रक/टेंपो' },
    { id: 'electric', icon: '⚡', en: 'Electric Vehicle', hi: 'इलेक्ट्रिक वाहन' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
] as const

// Fuel type options
export const FUEL_OPTIONS = [
    { id: 'petrol', label: 'Petrol/पेट्रोल', icon: '⛽' },
    { id: 'diesel', label: 'Diesel/डीज़ल', icon: '🛢️' },
    { id: 'electric', label: 'Electric/इलेक्ट्रिक', icon: '⚡' },
    { id: 'cng', label: 'CNG', icon: '💨' },
    { id: 'manual', label: 'Manual/मैनुअल', icon: '🚴' },
] as const

// Livestock sub-items
export const LIVESTOCK_ITEMS = [
    { id: 'cow', icon: '🐄', en: 'Cow', hi: 'गाय' },
    { id: 'buffalo', icon: '🐃', en: 'Buffalo', hi: 'भैंस' },
    { id: 'goat', icon: '🐐', en: 'Goat', hi: 'बकरी' },
    { id: 'sheep', icon: '🐑', en: 'Sheep', hi: 'भेड़' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
] as const

// Selling urgency options
export const URGENCY_OPTIONS = [
    { id: '1-3', hi: '1 से 3 दिन', en: '1-3 days' },
    { id: '4-7', hi: '4 से 7 दिन', en: '4-7 days' },
    { id: '7+', hi: 'हफ्ते से ज़्यादा', en: '1+ week' },
] as const

// Selling type options
export const SELLING_TYPE_OPTIONS = [
    { id: 'home', hi: 'खूँटे का पशु', en: 'Home-raised animal' },
    { id: 'mandi', hi: 'मंडी का पशु', en: 'Market animal' },
] as const

// Lactation stages
export const LACTATION_OPTIONS = [
    { id: 'none', hi: 'ब्यायी नहीं', en: 'Not calved' },
    { id: 'first', hi: 'पहला', en: 'First' },
    { id: 'second', hi: 'दूसरा', en: 'Second' },
    { id: 'other', hi: 'अन्य', en: 'Other' },
] as const

// Types
export type ElectronicsItem = typeof ELECTRONICS_ITEMS[number]
export type ClothesItem = typeof CLOTHES_ITEMS[number]
export type BooksItem = typeof BOOKS_ITEMS[number]
export type VehiclesItem = typeof VEHICLES_ITEMS[number]
export type LivestockItem = typeof LIVESTOCK_ITEMS[number]
export type Condition = 'new' | 'old' | ''
export type Gender = 'men' | 'women' | 'kids' | 'unisex' | ''

// Common form data shared across forms
export interface SellerInfo {
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
}

// Product submit data
export interface ProductSubmitData {
    name: string
    category: string
    price: string
    quantity: string
    location: string
    pincode: string
    imageFiles: File[]
    imagePreviews: string[]
    // Category-specific fields stored as JSON in quantity field
    details?: Record<string, any>
}
