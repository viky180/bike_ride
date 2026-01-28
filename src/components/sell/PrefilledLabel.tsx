import { useApp } from '../../context/AppContext'
import { SellLocationSource } from '../../hooks/useSellLocationDefaults'

interface PrefilledLabelProps {
    source: SellLocationSource
}

export function PrefilledLabel({ source }: PrefilledLabelProps) {
    const { language } = useApp()

    if (!source) return null

    const label = source === 'shop'
        ? (language === 'hi' ? '🏪 आपकी दुकान से भरा गया' : '🏪 Prefilled from your shop')
        : (language === 'hi' ? '📍 आपकी लोकेशन से भरा गया' : '📍 Prefilled from your location')

    return (
        <div style={{
            fontSize: 12,
            color: 'var(--color-text-light)',
            marginBottom: 8,
            marginTop: -4
        }}>
            {label}
        </div>
    )
}