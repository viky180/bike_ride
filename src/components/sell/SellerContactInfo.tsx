import { useApp } from '../../context/AppContext'
import { PincodeInput } from '../PincodeInput'

interface SellerContactInfoProps {
    location: string
    onLocationChange: (value: string) => void
    pincode: string
    onPincodeChange: (value: string) => void
    sellerPhone: string
    onSellerPhoneChange: (value: string) => void
    whatsappEnabled: boolean
    onWhatsappEnabledChange: (value: boolean) => void
    locationPlaceholder?: { hi: string; en: string }
}

export function SellerContactInfo({
    location,
    onLocationChange,
    pincode,
    onPincodeChange,
    sellerPhone,
    onSellerPhoneChange,
    whatsappEnabled,
    onWhatsappEnabledChange,
    locationPlaceholder = { hi: 'जैसे: रामपुर, सेक्टर 5...', en: 'e.g., Rampur, Sector 5...' }
}: SellerContactInfoProps) {
    const { language } = useApp()

    return (
        <>
            {/* Address/Location */}
            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'पता/लोकेशन' : 'Address/Location'}
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    placeholder={language === 'hi' ? locationPlaceholder.hi : locationPlaceholder.en}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-border)'
                    }}
                />
            </div>

            {/* Pincode with Auto-Detect */}
            <PincodeInput
                value={pincode}
                onChange={onPincodeChange}
                required
            />

            {/* Seller Phone */}
            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'संपर्क नंबर *' : 'Contact Number *'}
                </label>
                <input
                    type="tel"
                    className="form-input"
                    value={sellerPhone}
                    onChange={(e) => onSellerPhoneChange(e.target.value)}
                    placeholder={language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-border)'
                    }}
                />
            </div>

            {/* WhatsApp Contact */}
            <div className="form-group">
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '16px',
                        background: whatsappEnabled ? '#dcfce7' : 'var(--color-bg)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: whatsappEnabled ? '#22c55e' : 'var(--color-border)'
                    }}
                >
                    <input
                        type="checkbox"
                        checked={whatsappEnabled}
                        onChange={(e) => onWhatsappEnabledChange(e.target.checked)}
                        style={{ width: 24, height: 24 }}
                    />
                    <span style={{ fontSize: 24 }}>💬</span>
                    <span style={{ fontWeight: 600 }}>
                        {language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}
                    </span>
                </label>
            </div>
        </>
    )
}
