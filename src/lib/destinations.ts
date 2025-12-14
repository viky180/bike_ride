// Predefined destinations with icons and translations
export interface Destination {
    id: 'block_office' | 'market' | 'bus_stand' | 'phc' | 'bank'
    icon: string
    en: string
    hi: string
    color: string
}

export const DESTINATIONS: Destination[] = [
    {
        id: 'block_office',
        icon: '🏛️',
        en: 'Block Office',
        hi: 'ब्लॉक कार्यालय',
        color: '#6366f1' // indigo
    },
    {
        id: 'market',
        icon: '🛒',
        en: 'Market',
        hi: 'बाज़ार',
        color: '#f59e0b' // amber
    },
    {
        id: 'bus_stand',
        icon: '🚌',
        en: 'Bus Stand',
        hi: 'बस स्टैंड',
        color: '#3b82f6' // blue
    },
    {
        id: 'phc',
        icon: '🏥',
        en: 'PHC / Hospital',
        hi: 'अस्पताल',
        color: '#ef4444' // red
    },
    {
        id: 'bank',
        icon: '🏦',
        en: 'Bank',
        hi: 'बैंक',
        color: '#10b981' // emerald
    }
]

export function getDestination(id: string): Destination | undefined {
    return DESTINATIONS.find(d => d.id === id)
}
