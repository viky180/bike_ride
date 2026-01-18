import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGeolocation } from '../lib/useGeolocation'
import { getStoredPincode, setStoredPincode } from '../lib/storage'

interface HeaderProps {
    title?: string
    showBack?: boolean
    onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
    const { language, setLanguage, t } = useApp()
    const navigate = useNavigate()
    const location = useLocation()

    // Pincode state
    const [pincode, setPincode] = useState(getStoredPincode() || '')
    const [showPincodeInput, setShowPincodeInput] = useState(false)
    const { pincode: detectedPincode, loading: detectingLocation, error: locationError, detectLocation } = useGeolocation()

    // Auto-detect pincode on mount if not already set
    useEffect(() => {
        if (!pincode) {
            detectLocation()
        }
    }, [])

    // Update pincode when detected
    useEffect(() => {
        if (detectedPincode) {
            setPincode(detectedPincode)
            setStoredPincode(detectedPincode)
            setShowPincodeInput(false)
        }
    }, [detectedPincode])

    const handleBack = () => {
        if (onBack) {
            onBack()
            return
        }

        if (location.key !== 'default') {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    const handlePincodeClick = () => {
        if (detectingLocation) return
        if (pincode) {
            // Show input to change
            setShowPincodeInput(true)
        } else {
            // Try to detect
            detectLocation()
        }
    }

    const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
        setPincode(val)
    }

    const handlePincodeSave = () => {
        if (pincode.length === 6) {
            setStoredPincode(pincode)
            setShowPincodeInput(false)
        }
    }

    return (
        <header className="header">
            {showBack ? (
                <button className="header-back" onClick={handleBack} aria-label={t('back')}>
                    ←
                </button>
            ) : (
                <div className="header-title">{title || t('app_name')}</div>
            )}

            {showBack && <div className="header-title">{title}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Pincode Button */}
                <button
                    className="header-pincode-btn"
                    onClick={handlePincodeClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        borderRadius: 16,
                        border: pincode ? '1px solid #22c55e' : '1px solid #e2e8f0',
                        background: pincode ? '#dcfce7' : '#f8fafc',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: pincode ? '#16a34a' : '#64748b'
                    }}
                >
                    {detectingLocation ? (
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
                            <span>{language === 'hi' ? 'खोज...' : '...'}</span>
                        </>
                    ) : pincode ? (
                        <>
                            <span>📍</span>
                            <span>{pincode}</span>
                        </>
                    ) : (
                        <>
                            <span>📍</span>
                            <span>{language === 'hi' ? 'पिनकोड' : 'Location'}</span>
                        </>
                    )}
                </button>

                {/* Pincode Input Modal */}
                {showPincodeInput && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: 24,
                            borderRadius: 16,
                            width: '90%',
                            maxWidth: 320
                        }}>
                            <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                                {language === 'hi' ? 'पिनकोड दर्ज करें' : 'Enter Pincode'}
                            </h3>
                            {locationError && (
                                <div style={{
                                    marginBottom: 12,
                                    padding: '8px 12px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: 8,
                                    color: '#dc2626',
                                    fontSize: 13
                                }}>
                                    ⚠️ {locationError}
                                </div>
                            )}
                            <input
                                type="text"
                                value={pincode}
                                onChange={handlePincodeChange}
                                placeholder="6 digit pincode"
                                maxLength={6}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    fontSize: 18,
                                    borderRadius: 8,
                                    border: pincode.length === 6 ? '2px solid #22c55e' : '2px solid #e2e8f0',
                                    marginBottom: 16,
                                    textAlign: 'center',
                                    letterSpacing: 4
                                }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => {
                                        detectLocation()
                                    }}
                                    disabled={detectingLocation}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#dbeafe',
                                        color: '#1d4ed8',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    📍 {language === 'hi' ? 'पता लगाएं' : 'Detect'}
                                </button>
                                <button
                                    onClick={handlePincodeSave}
                                    disabled={pincode.length !== 6}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 8,
                                        border: 'none',
                                        background: pincode.length === 6 ? '#22c55e' : '#e2e8f0',
                                        color: pincode.length === 6 ? 'white' : '#94a3b8',
                                        fontWeight: 600,
                                        cursor: pincode.length === 6 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {language === 'hi' ? 'सेव करें' : 'Save'}
                                </button>
                            </div>
                            <button
                                onClick={() => setShowPincodeInput(false)}
                                style={{
                                    width: '100%',
                                    marginTop: 12,
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: 'transparent',
                                    color: '#64748b',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Language Toggle */}
                <div className="lang-toggle">
                    <button
                        className={language === 'hi' ? 'active' : ''}
                        onClick={() => setLanguage('hi')}
                    >
                        हि
                    </button>
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        En
                    </button>
                </div>
            </div>

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </header>
    )
}
