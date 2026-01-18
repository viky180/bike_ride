import { useState, useEffect } from 'react'
import { useGeolocation } from '../lib/useGeolocation'
import { useApp } from '../context/AppContext'

interface PincodeInputProps {
    value: string
    onChange: (pincode: string) => void
    required?: boolean
    showHelper?: boolean
    compact?: boolean
}

export function PincodeInput({
    value,
    onChange,
    required = false,
    showHelper = true,
    compact = false
}: PincodeInputProps) {
    const { language } = useApp()
    const { pincode: detectedPincode, loading, error, detectLocation, clearError } = useGeolocation()
    const [showSuccess, setShowSuccess] = useState(false)

    // When pincode is detected, update parent and show success
    useEffect(() => {
        if (detectedPincode) {
            onChange(detectedPincode)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
        }
    }, [detectedPincode, onChange])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
        onChange(val)
        if (error) clearError()
    }

    const handleDetect = async () => {
        await detectLocation()
    }

    const isValid = value.length === 6

    if (compact) {
        return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>📍</span>
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={language === 'hi' ? 'पिनकोड' : 'Pincode'}
                    maxLength={6}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: 14,
                        borderRadius: 8,
                        border: isValid ? '2px solid #22c55e' : '1px solid #e2e8f0',
                        background: 'white'
                    }}
                />
                <button
                    type="button"
                    onClick={handleDetect}
                    disabled={loading}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: loading ? '#e2e8f0' : showSuccess ? '#dcfce7' : '#dbeafe',
                        color: loading ? '#94a3b8' : showSuccess ? '#16a34a' : '#1d4ed8',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                border: '2px solid #94a3b8',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        </>
                    ) : showSuccess ? (
                        '✓'
                    ) : (
                        '📍'
                    )}
                </button>
            </div>
        )
    }

    return (
        <div className="form-group">
            <label className="form-label">
                {language === 'hi' ? 'पिनकोड' : 'Pincode'} {required && '*'}
            </label>

            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <input
                    type="text"
                    className="form-input"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={language === 'hi' ? '6 अंकों का पिनकोड' : '6-digit pincode'}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: isValid
                            ? '2px solid var(--color-success, #22c55e)'
                            : '2px solid var(--color-border, #e2e8f0)'
                    }}
                />

                <button
                    type="button"
                    onClick={handleDetect}
                    disabled={loading}
                    style={{
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: 'none',
                        background: loading
                            ? '#e2e8f0'
                            : showSuccess
                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 120,
                        justifyContent: 'center',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                display: 'inline-block',
                                width: 16,
                                height: 16,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            {language === 'hi' ? 'खोज...' : 'Finding...'}
                        </>
                    ) : showSuccess ? (
                        <>
                            ✓ {language === 'hi' ? 'मिला!' : 'Found!'}
                        </>
                    ) : (
                        <>
                            📍 {language === 'hi' ? 'पता लगाएं' : 'Detect'}
                        </>
                    )}
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div style={{
                    marginTop: 8,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    color: '#dc2626',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Helper text */}
            {showHelper && !error && (
                <small style={{ color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>
                    {language === 'hi'
                        ? '📍 आपके पिनकोड के पास के खरीदार आपका आइटम देख सकेंगे'
                        : '📍 Buyers near your pincode will be able to see your item'}
                </small>
            )}

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
