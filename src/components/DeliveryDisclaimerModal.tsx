import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const DISCLAIMER_KEY = 'gram_junction_delivery_disclaimer_seen'

interface DeliveryDisclaimerModalProps {
    onClose?: () => void
}

export function DeliveryDisclaimerModal({ onClose }: DeliveryDisclaimerModalProps) {
    const { language } = useApp()
    const [show, setShow] = useState(false)

    useEffect(() => {
        const seen = localStorage.getItem(DISCLAIMER_KEY)
        if (!seen) {
            setShow(true)
        }
    }, [])

    const handleUnderstand = () => {
        localStorage.setItem(DISCLAIMER_KEY, 'true')
        setShow(false)
        onClose?.()
    }

    if (!show) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
        }}>
            <div style={{
                background: 'white',
                borderRadius: 16,
                maxWidth: 340,
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: 20,
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: 48 }}>⚠️</span>
                    <h2 style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 700,
                        marginTop: 8,
                        marginBottom: 0
                    }}>
                        {language === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important Notice'}
                    </h2>
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                    <p style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1f2937',
                        lineHeight: 1.6,
                        marginBottom: 12,
                        textAlign: 'center'
                    }}>
                        Gram Junction केवल संपर्क कराता है। डिलीवरी/भुगतान/सामान की जिम्मेदारी ऐप की नहीं है।
                    </p>
                    <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 1.5,
                        textAlign: 'center'
                    }}>
                        Gram Junction only connects people. Delivery/payment/item responsibility is not on the app.
                    </p>
                </div>

                {/* Button */}
                <div style={{ padding: '0 20px 20px' }}>
                    <button
                        onClick={handleUnderstand}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        {language === 'hi' ? 'मैं समझ गया' : 'I Understand'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function useDeliveryDisclaimerSeen(): boolean {
    const [seen, setSeen] = useState(true)

    useEffect(() => {
        setSeen(localStorage.getItem(DISCLAIMER_KEY) === 'true')
    }, [])

    return seen
}
