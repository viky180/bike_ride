import { useApp } from '../context/AppContext'

interface DeliveryDisclaimerProps {
    compact?: boolean
}

export function DeliveryDisclaimer({ compact = false }: DeliveryDisclaimerProps) {
    const { language } = useApp()

    const hindiText = 'Gram Junction केवल संपर्क कराता है। डिलीवरी/भुगतान/सामान की जिम्मेदारी ऐप की नहीं है।'
    const englishText = 'Gram Junction only connects people. Delivery/payment/item responsibility is not on the app.'

    if (compact) {
        return (
            <div style={{
                padding: '8px 12px',
                background: '#fef3c7',
                borderRadius: 8,
                borderLeft: '4px solid #f59e0b',
                fontSize: 12,
                color: '#92400e'
            }}>
                <div style={{ fontWeight: 600 }}>{hindiText}</div>
                <div style={{ marginTop: 4, opacity: 0.8 }}>{englishText}</div>
            </div>
        )
    }

    return (
        <div style={{
            padding: 16,
            background: 'linear-gradient(135deg, #fef3c7+, #fef9c3)',
            borderRadius: 12,
            border: '1px solid #fcd34d',
            marginBottom: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                    <div style={{
                        fontWeight: 600,
                        color: '#92400e',
                        fontSize: 14,
                        marginBottom: 4
                    }}>
                        {language === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important Notice'}
                    </div>
                    <div style={{ color: '#a16207', fontSize: 14, lineHeight: 1.5 }}>
                        {hindiText}
                    </div>
                    <div style={{ color: '#a16207', fontSize: 13, marginTop: 4, opacity: 0.85 }}>
                        {englishText}
                    </div>
                </div>
            </div>
        </div>
    )
}
