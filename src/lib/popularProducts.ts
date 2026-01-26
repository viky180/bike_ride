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
    ],
    electronics: [
        { name: 'Mobile Phone', icon: '📱', hi: 'मोबाइल फोन' },
        { name: 'Laptop', icon: '💻', hi: 'लैपटॉप' },
        { name: 'Headphones', icon: '🎧', hi: 'हेडफोन' },
        { name: 'Charger', icon: '🔌', hi: 'चार्जर' },
    ],
    clothes: [
        { name: 'Shirt', icon: '👕', hi: 'शर्ट' },
        { name: 'Pants', icon: '👖', hi: 'पैंट' },
        { name: 'Saree', icon: '👗', hi: 'साड़ी' },
        { name: 'Shoes', icon: '👟', hi: 'जूते' },
    ],
    furniture: [
        { name: 'Chair', icon: '🪑', hi: 'कुर्सी' },
        { name: 'Table', icon: '🪵', hi: 'मेज़' },
        { name: 'Bed', icon: '🛏️', hi: 'बिस्तर' },
        { name: 'Sofa', icon: '🛋️', hi: 'सोफा' },
    ],
    books: [
        { name: 'Textbook', icon: '📚', hi: 'पाठ्यपुस्तक' },
        { name: 'Novel', icon: '📖', hi: 'उपन्यास' },
        { name: 'Notebook', icon: '📓', hi: 'नोटबुक' },
        { name: 'Pen', icon: '🖊️', hi: 'पेन' },
        { name: 'Pencil', icon: '✏️', hi: 'पेंसिल' },
        { name: 'Eraser', icon: '🧹', hi: 'रबड़' },
        { name: 'Ruler', icon: '📏', hi: 'स्केल' },
    ],
    vehicles: [
        { name: 'Bicycle', icon: '🚲', hi: 'साइकिल' },
        { name: 'Scooter', icon: '🛵', hi: 'स्कूटर' },
        { name: 'Motorcycle', icon: '🏍️', hi: 'मोटरसाइकिल' },
        { name: 'Car', icon: '🚗', hi: 'कार' },
    ],
    livestock: [
        { name: 'Cow', icon: '🐄', hi: 'गाय' },
        { name: 'Buffalo', icon: '🐃', hi: 'भैंस' },
        { name: 'Goat', icon: '🐐', hi: 'बकरी' },
        { name: 'Sheep', icon: '🐑', hi: 'भेड़' },
    ],
    pharmacy: [
        { name: 'First Aid Kit', icon: '⛑️', hi: 'प्राथमिक चिकित्सा किट' },
        { name: 'Pain Relief (Balms/Spray)', icon: '🧴', hi: 'दर्द निवारक' },
        { name: 'Ayurvedic Medicine', icon: '🌿', hi: 'आयुर्वेदिक दवा' },
        { name: 'Surgical Items', icon: '🩹', hi: 'सर्जिकल आइटम' },
        { name: 'Baby Care', icon: '👶', hi: 'शिशु देखभाल' },
    ],
    jobs: [
        { name: 'Driver', icon: '🚗', hi: 'ड्राइवर' },
        { name: 'Cook', icon: '👨‍🍳', hi: 'रसोइया' },
        { name: 'Security Guard', icon: '💂', hi: 'सुरक्षा गार्ड' },
        { name: 'Helper', icon: '🤝', hi: 'हेल्पर' },
        { name: 'Cleaner', icon: '🧹', hi: 'सफाईकर्मी' },
        { name: 'Electrician', icon: '⚡', hi: 'इलेक्ट्रीशियन' },
        { name: 'Plumber', icon: '🔧', hi: 'प्लंबर' },
        { name: 'Teacher', icon: '👩‍🏫', hi: 'शिक्षक' },
        { name: 'Salesman', icon: '🏪', hi: 'सेल्समैन' },
        { name: 'Labour', icon: '👷', hi: 'मजदूर' },
    ]
}

export function getPopularProducts(category: ProductCategory): PopularProduct[] {
    return POPULAR_PRODUCTS[category] || []
}
