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
        your_requests: 'Your Requests',

        // Delivery Help
        delivery_help: 'Delivery Help',
        register_helper: 'Register as Helper',
        edit_registration: 'Edit Registration',
        home_village: 'Home Village',
        service_villages: 'Service Villages',
        max_villages: 'Max 5 villages including home',
        vehicle_type: 'Vehicle Type',
        availability: 'Availability',
        availability_hours: 'Custom Hours (optional)',
        capabilities: 'What can you deliver?',
        rate_slabs: 'Approximate Rates',
        rate_same_village: 'Same village',
        rate_nearby_village: 'Nearby village',
        rate_far_village: '2-3 villages away',
        rate_approx: 'Approx.',
        rate_may_vary: 'May vary based on time/item',
        nearby_helpers: 'Nearby Delivery Helpers',
        no_helpers: 'No helpers in this area yet',
        helper_registered: 'Registration successful!',
        helper_updated: 'Registration updated!',
        // Vehicle types
        vehicle_walk: 'Walk',
        vehicle_cycle: 'Cycle',
        vehicle_bike: 'Bike',
        vehicle_auto: 'Auto',
        vehicle_tractor: 'Tractor',
        vehicle_van: 'Van',
        // Availability times
        time_morning: 'Morning',
        time_evening: 'Evening',
        time_anytime: 'Anytime',
        // Capabilities
        cap_groceries: 'Groceries',
        cap_dairy: 'Milk/Dairy',
        cap_grains: 'Grains',
        cap_stationery: 'Stationery',
        cap_books: 'Books',
        cap_small_parcels: 'Small Parcels',
        cap_furniture: 'Furniture',
        // Disclaimer
        disclaimer_title: 'Important Notice',
        disclaimer_text: 'Gram Junction only connects people. Delivery/payment/item responsibility is not on the app.',
        disclaimer_understand: 'I Understand',

        // Shop / Shopkeeper
        my_shop: 'My Shop',
        become_shopkeeper: 'Become a Shopkeeper',
        shopkeeper_note: 'Only for regular sellers with a shop. Occasional sellers do not need this.',
        shop_name: 'Shop Name',
        shop_description: 'Description (optional)',
        create_shop: 'Create Shop',
        view_shop: 'View Shop',
        edit_shop: 'Edit Shop',
        shop_created: 'Shop Created!',
        shop_updated: 'Shop Updated!',
        share_shop: 'Share Shop',
        shop_link_copied: 'Shop link copied!',
        all_products: 'All Products',
        no_shop_products: 'No products in this shop yet'
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
        your_requests: 'आपकी मांगें',

        // Delivery Help
        delivery_help: 'डिलीवरी सहायता',
        register_helper: 'सहायक बनें',
        edit_registration: 'पंजीकरण संपादित करें',
        home_village: 'घर का गाँव',
        service_villages: 'सेवा गाँव',
        max_villages: 'घर सहित अधिकतम 5 गाँव',
        vehicle_type: 'वाहन प्रकार',
        availability: 'उपलब्धता',
        availability_hours: 'समय (वैकल्पिक)',
        capabilities: 'क्या पहुँचा सकते हैं?',
        rate_slabs: 'अनुमानित दरें',
        rate_same_village: 'एक ही गाँव',
        rate_nearby_village: 'नजदीकी गाँव',
        rate_far_village: '2-3 गाँव दूर',
        rate_approx: 'लगभग',
        rate_may_vary: 'समय/सामान के अनुसार बदल सकता है।',
        nearby_helpers: 'नजदीकी डिलीवरी सहायक',
        no_helpers: 'इस क्षेत्र में अभी कोई सहायक नहीं',
        helper_registered: 'पंजीकरण सफल!',
        helper_updated: 'पंजीकरण अपडेट!',
        // Vehicle types
        vehicle_walk: 'पैदल',
        vehicle_cycle: 'साइकिल',
        vehicle_bike: 'बाइक',
        vehicle_auto: 'ऑटो',
        vehicle_tractor: 'ट्रैक्टर',
        vehicle_van: 'वैन',
        // Availability times
        time_morning: 'सुबह',
        time_evening: 'शाम',
        time_anytime: 'कभी भी',
        // Capabilities
        cap_groceries: 'किराना',
        cap_dairy: 'दूध/डेयरी',
        cap_grains: 'अनाज',
        cap_stationery: 'स्टेशनरी',
        cap_books: 'किताबें',
        cap_small_parcels: 'छोटे पार्सल',
        cap_furniture: 'फर्नीचर',
        // Disclaimer
        disclaimer_title: 'महत्वपूर्ण सूचना',
        disclaimer_text: 'Gram Junction केवल संपर्क कराता है। डिलीवरी/भुगतान/सामान की जिम्मेदारी ऐप की नहीं है।',
        disclaimer_understand: 'मैं समझ गया',

        // Shop / Shopkeeper
        my_shop: 'मेरी दुकान',
        become_shopkeeper: 'दुकानदार बनें',
        shopkeeper_note: 'केवल नियमित विक्रेताओं के लिए जिनकी दुकान है। कभी-कभार बेचने वालों को इसकी जरूरत नहीं।',
        shop_name: 'दुकान का नाम',
        shop_description: 'विवरण (वैकल्पिक)',
        create_shop: 'दुकान बनाएं',
        view_shop: 'दुकान देखें',
        edit_shop: 'दुकान संपादित करें',
        shop_created: 'दुकान बन गई!',
        shop_updated: 'दुकान अपडेट!',
        share_shop: 'दुकान शेयर करें',
        shop_link_copied: 'दुकान लिंक कॉपी हो गई!',
        all_products: 'सभी उत्पाद',
        no_shop_products: 'इस दुकान में अभी कोई उत्पाद नहीं'
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
