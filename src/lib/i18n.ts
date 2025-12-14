// Simple i18n system for Hindi/English
export type Language = 'en' | 'hi'

const translations = {
    en: {
        // App
        app_name: 'Gramin Sawari',
        app_tagline: 'Rural Ride Sharing',

        // Home
        offer_ride: 'Offer Ride',
        find_ride: 'Find Ride',
        my_rides: 'My Rides',

        // Post Ride
        where_going: 'Where are you going?',
        when_going: 'When?',
        how_many_seats: 'How many seats?',
        price_per_seat: 'Price per seat',
        post_ride: 'Post Ride',
        ride_posted: 'Ride Posted!',

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
        rides_you_posted: 'Rides You Posted'
    },
    hi: {
        // App
        app_name: 'ग्रामीण सवारी',
        app_tagline: 'गाँव की सवारी',

        // Home
        offer_ride: 'सवारी दें',
        find_ride: 'सवारी खोजें',
        my_rides: 'मेरी सवारी',

        // Post Ride
        where_going: 'कहाँ जा रहे हैं?',
        when_going: 'कब?',
        how_many_seats: 'कितनी सीट?',
        price_per_seat: 'प्रति सीट किराया',
        post_ride: 'सवारी पोस्ट करें',
        ride_posted: 'सवारी पोस्ट हो गई!',

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
        rides_you_posted: 'आपकी पोस्ट की गई सवारी'
    }
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, lang: Language = 'hi'): string {
    return translations[lang][key] || translations.en[key] || key
}

// Get stored language preference
export function getStoredLanguage(): Language {
    const stored = localStorage.getItem('gramin_sawari_lang')
    return (stored === 'en' || stored === 'hi') ? stored : 'hi'
}

// Save language preference
export function setStoredLanguage(lang: Language): void {
    localStorage.setItem('gramin_sawari_lang', lang)
}
