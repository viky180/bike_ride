// Simple i18n system for Hindi/English
export type Language = 'en' | 'hi'

const translations = {
    en: {
        // App
        app_name: 'Gram Junction',
        app_tagline: 'Village Connection Hub',

        // Home
        offer_ride: 'Offer Ride',
        find_ride: 'Find Ride',
        my_rides: 'My Rides',

        // Post Ride
        where_from: 'Where are you starting from?',
        where_going: 'Where are you going?',
        when_going: 'When?',
        how_many_seats: 'How many seats?',
        price_per_seat: 'Price per seat',
        post_ride: 'Post Ride',
        ride_posted: 'Ride Posted!',
        enter_origin: 'e.g., Rampur Village',
        enter_destination: 'e.g., Block Office',
        from: 'From',
        to: 'To',

        // Find Ride
        available_rides: 'Available Rides',
        no_rides: 'No rides available',
        seats_left: 'seat(s) left',
        request_ride: 'Request Ride',
        ride_requested: 'Request Sent!',

        // Booking
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',
        accept: 'Accept',
        reject: 'Reject',

        // Time
        today: 'Today',
        tomorrow: 'Tomorrow',
        am: 'AM',
        pm: 'PM',

        // User
        enter_name: 'Enter your name',
        enter_phone: 'Enter phone number',
        save: 'Save',
        driver: 'Driver',
        rider: 'Rider',

        // Common
        cancel: 'Cancel',
        confirm: 'Confirm',
        back: 'Back',
        loading: 'Loading...',
        offline: 'You are offline',
        rupees: '₹',

        // Requests
        ride_requests: 'Ride Requests',
        no_requests: 'No requests yet',
        your_bookings: 'Your Bookings',
        rides_you_posted: 'Rides You Posted',

        // Produce Module
        produce: 'Produce',
        browse_produce: 'Browse Produce',
        sell_produce: 'Sell Produce',
        my_products: 'My Products',
        no_products: 'No products available',
        call: 'Call',
        mark_sold: 'Mark Sold',
        product_posted: 'Product Listed!',
        product_deleted: 'Product Deleted',
        product_sold: 'Marked as Sold',
        what_selling: 'What are you selling?',
        select_category: 'Select Category',
        enter_product_name: 'Product name',
        enter_quantity: 'Quantity (e.g., 10 kg)',
        enter_price: 'Price in ₹',
        your_location: 'Your location',
        all_categories: 'All',

        // Demand Board
        demand_board: "Today's Demand",
        request_product: 'Request Product',
        product_not_found: 'Product not found?',
        what_need: 'What do you need?',
        expected_price: 'Expected price (optional)',
        submit_request: 'Submit Request',
        request_submitted: 'Request Submitted!',
        no_demands: 'No demands yet',
        max_requests: 'Max 2 active requests allowed',
        your_requests: 'Your Requests'
    },
    hi: {
        // App
        app_name: 'ग्राम जंक्शन',
        app_tagline: 'गाँव का संगम',

        // Home
        offer_ride: 'सवारी दें',
        find_ride: 'सवारी खोजें',
        my_rides: 'मेरी सवारी',

        // Post Ride
        where_from: 'कहाँ से चल रहे हैं?',
        where_going: 'कहाँ जा रहे हैं?',
        when_going: 'कब?',
        how_many_seats: 'कितनी सीट?',
        price_per_seat: 'प्रति सीट किराया',
        post_ride: 'सवारी पोस्ट करें',
        ride_posted: 'सवारी पोस्ट हो गई!',
        enter_origin: 'जैसे: रामपुर गाँव',
        enter_destination: 'जैसे: ब्लॉक कार्यालय',
        from: 'से',
        to: 'तक',

        // Find Ride
        available_rides: 'उपलब्ध सवारी',
        no_rides: 'कोई सवारी नहीं',
        seats_left: 'सीट बाकी',
        request_ride: 'सवारी माँगें',
        ride_requested: 'अनुरोध भेजा गया!',

        // Booking
        pending: 'प्रतीक्षा में',
        accepted: 'स्वीकृत',
        rejected: 'अस्वीकृत',
        accept: 'स्वीकार',
        reject: 'अस्वीकार',

        // Time
        today: 'आज',
        tomorrow: 'कल',
        am: 'सुबह',
        pm: 'शाम',

        // User
        enter_name: 'अपना नाम दर्ज करें',
        enter_phone: 'फ़ोन नंबर दर्ज करें',
        save: 'सहेजें',
        driver: 'चालक',
        rider: 'सवारी',

        // Common
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        back: 'वापस',
        loading: 'लोड हो रहा...',
        offline: 'आप ऑफ़लाइन हैं',
        rupees: '₹',

        // Requests
        ride_requests: 'सवारी अनुरोध',
        no_requests: 'अभी कोई अनुरोध नहीं',
        your_bookings: 'आपकी बुकिंग',
        rides_you_posted: 'आपकी पोस्ट की गई सवारी',

        // Produce Module
        produce: 'उपज',
        browse_produce: 'उपज देखें',
        sell_produce: 'बेचें',
        my_products: 'मेरे उत्पाद',
        no_products: 'कोई उत्पाद नहीं',
        call: 'कॉल करें',
        mark_sold: 'बिक गया',
        product_posted: 'उत्पाद सूचीबद्ध!',
        product_deleted: 'उत्पाद हटाया गया',
        product_sold: 'बिक गया',
        what_selling: 'क्या बेच रहे हैं?',
        select_category: 'श्रेणी चुनें',
        enter_product_name: 'उत्पाद का नाम',
        enter_quantity: 'मात्रा (जैसे: 10 किलो)',
        enter_price: 'कीमत ₹ में',
        your_location: 'आपका स्थान',
        all_categories: 'सभी',

        // Demand Board
        demand_board: 'आज की मांग',
        request_product: 'मांग करें',
        product_not_found: 'उत्पाद नहीं मिला?',
        what_need: 'क्या चाहिए?',
        expected_price: 'अनुमानित कीमत (वैकल्पिक)',
        submit_request: 'मांग भेजें',
        request_submitted: 'मांग भेज दी गई!',
        no_demands: 'अभी कोई मांग नहीं',
        max_requests: 'अधिकतम 2 सक्रिय मांगें',
        your_requests: 'आपकी मांगें'
    }
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, lang: Language = 'hi'): string {
    return translations[lang][key] || translations.en[key] || key
}

// Get stored language preference
export function getStoredLanguage(): Language {
    const stored = localStorage.getItem('gram_junction_lang')
    return (stored === 'en' || stored === 'hi') ? stored : 'hi'
}

// Save language preference
export function setStoredLanguage(lang: Language): void {
    localStorage.setItem('gram_junction_lang', lang)
}
