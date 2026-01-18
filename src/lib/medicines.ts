// Common medicines list for autocomplete in pharmacy listings
export interface Medicine {
    name: string
    hi: string  // Hindi name
}

export const COMMON_MEDICINES: Medicine[] = [
    // Pain & Fever
    { name: 'Paracetamol', hi: 'पैरासिटामोल' },
    { name: 'Crocin', hi: 'क्रोसिन' },
    { name: 'Dolo 650', hi: 'डोलो 650' },
    { name: 'Combiflam', hi: 'कॉम्बिफ्लेम' },
    { name: 'Disprin', hi: 'डिस्प्रिन' },
    { name: 'Brufen', hi: 'ब्रूफेन' },

    // Cold & Cough
    { name: 'Vicks VapoRub', hi: 'विक्स वेपोरब' },
    { name: 'Benadryl', hi: 'बेनाड्रिल' },
    { name: 'Cetrizine', hi: 'सेट्रिजीन' },
    { name: 'Sinarest', hi: 'सिनारेस्ट' },
    { name: 'D Cold Total', hi: 'डी कोल्ड टोटल' },
    { name: 'Strepsils', hi: 'स्ट्रेप्सिल्स' },

    // Digestion
    { name: 'Gelusil', hi: 'जेलुसिल' },
    { name: 'Digene', hi: 'डाइजीन' },
    { name: 'Eno', hi: 'इनो' },
    { name: 'Pudinhara', hi: 'पुदीन हारा' },
    { name: 'Hajmola', hi: 'हाजमोला' },
    { name: 'Pantocid', hi: 'पैंटोसिड' },
    { name: 'Omez', hi: 'ओमेज़' },

    // Antibiotics
    { name: 'Azithromycin', hi: 'अज़िथ्रोमाइसिन' },
    { name: 'Amoxicillin', hi: 'एमोक्सिसिलिन' },
    { name: 'Ciprofloxacin', hi: 'सिप्रोफ्लोक्सासिन' },
    { name: 'Metronidazole', hi: 'मेट्रोनिडाज़ोल' },

    // Vitamins & Supplements
    { name: 'Vitamin C', hi: 'विटामिन सी' },
    { name: 'B Complex', hi: 'बी कॉम्प्लेक्स' },
    { name: 'Calcium', hi: 'कैल्शियम' },
    { name: 'Iron Tablets', hi: 'आयरन टैबलेट' },
    { name: 'Multivitamin', hi: 'मल्टीविटामिन' },
    { name: 'Zinc', hi: 'ज़िंक' },

    // Diabetes
    { name: 'Metformin', hi: 'मेटफॉर्मिन' },
    { name: 'Glimepiride', hi: 'ग्लिमेपिराइड' },

    // Blood Pressure
    { name: 'Amlodipine', hi: 'एम्लोडिपाइन' },
    { name: 'Telmisartan', hi: 'टेल्मिसार्टन' },

    // First Aid
    { name: 'Bandage', hi: 'पट्टी' },
    { name: 'Cotton', hi: 'रुई' },
    { name: 'Dettol', hi: 'डेटॉल' },
    { name: 'Betadine', hi: 'बीटाडीन' },
    { name: 'ORS', hi: 'ओआरएस' },

    // Others
    { name: 'Eye Drops', hi: 'आई ड्रॉप्स' },
    { name: 'Ear Drops', hi: 'ईयर ड्रॉप्स' },
    { name: 'Thermometer', hi: 'थर्मामीटर' },
    { name: 'BP Monitor', hi: 'बीपी मॉनिटर' },
    { name: 'Glucometer Strips', hi: 'ग्लूकोमीटर स्ट्रिप्स' },
]

// Search medicines by name (English or Hindi)
export function searchMedicines(query: string): Medicine[] {
    if (!query || query.length < 2) return []
    const lowerQuery = query.toLowerCase()
    return COMMON_MEDICINES.filter(
        m => m.name.toLowerCase().includes(lowerQuery) || m.hi.includes(query)
    ).slice(0, 10)  // Return max 10 results
}
