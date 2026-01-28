import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ELECTRONICS_ITEMS, ElectronicsItem, Condition } from '../../lib/sellFormConstants'
import { CategoryBadge } from './CategoryBadge'
import { ItemSelector } from './ItemSelector'
import { SellerContactInfo } from './SellerContactInfo'
import { Disclaimer } from './Disclaimer'
import { ImageUpload } from '../ImageUpload'
import { useSellLocationDefaults } from '../../hooks/useSellLocationDefaults'
import { PrefilledLabel } from './PrefilledLabel'

interface ElectronicsFormProps {
    onBack: () => void
    onSubmit: (data: ElectronicsFormData) => Promise<void>
    loading: boolean
}

export interface ElectronicsFormData {
    name: string
    selectedIcon: string
    companyName: string
    modelName: string
    condition: Condition
    yearsUsed: string
    hasBill: boolean | null
    defects: string
    price: string
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
    imageFiles: File[]
    imagePreviews: string[]
    thumbnailIndex: number
}

export function ElectronicsForm({ onBack, onSubmit, loading }: ElectronicsFormProps) {
    const { t, language } = useApp()

    const [electronicsItem, setElectronicsItem] = useState<string>('')
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [companyName, setCompanyName] = useState('')
    const [modelName, setModelName] = useState('')
    const [condition, setCondition] = useState<Condition>('')
    const [yearsUsed, setYearsUsed] = useState('')
    const [hasBill, setHasBill] = useState<boolean | null>(null)
    const [defects, setDefects] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [thumbnailIndex, setThumbnailIndex] = useState(0)

    const { source } = useSellLocationDefaults({
        location,
        setLocation,
        pincode,
        setPincode,
        phone: sellerPhone,
        setPhone: setSellerPhone
    })

    const handleSelectItem = (item: ElectronicsItem) => {
        setElectronicsItem(item.id)
        setName(language === 'hi' ? item.hi : item.en)
        setSelectedIcon(item.icon)
        if (item.id === 'other') {
            setShowCustomInput(true)
            setName('')
        } else {
            setShowCustomInput(false)
        }
    }

    const handleImagesChange = (files: File[], previews: string[]) => {
        setImageFiles(files)
        setImagePreviews(previews)
    }

    const handleThumbnailChange = (index: number) => {
        setThumbnailIndex(index)
    }

    const handleSubmit = () => {
        onSubmit({
            name,
            selectedIcon,
            companyName,
            modelName,
            condition,
            yearsUsed,
            hasBill,
            defects,
            price,
            location,
            pincode,
            sellerPhone,
            whatsappEnabled,
            imageFiles,
            imagePreviews,
            thumbnailIndex
        })
    }

    const showDetails = electronicsItem && (electronicsItem !== 'other' || name.trim())
    const canSubmit = name.trim() && companyName.trim() && condition && price && sellerPhone.trim()

    return (
        <>
            <CategoryBadge
                icon="📱"
                labelHi="इलेक्ट्रॉनिक्स"
                labelEn="Electronics"
                onChangeClick={onBack}
            />

            {/* Electronics item selection */}
            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                </label>
                <ItemSelector
                    items={ELECTRONICS_ITEMS}
                    selectedId={electronicsItem}
                    onSelect={handleSelectItem}
                    showCustomInput={showCustomInput}
                    customInputValue={name}
                    onCustomInputChange={setName}
                />
            </div>

            {/* Show detailed form when item is selected */}
            {showDetails && (
                <>
                    {/* Company Name */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'कंपनी का नाम *' : 'Company Name *'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: Samsung, Apple, LG...' : 'e.g., Samsung, Apple, LG...'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Model Name */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'मॉडल का नाम' : 'Model Name'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: Galaxy S21, iPhone 13...' : 'e.g., Galaxy S21, iPhone 13...'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Condition: New or Old */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'स्थिति *' : 'Condition *'}
                        </label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setCondition('new')}
                                style={{ flex: 1 }}
                            >
                                ✨ {language === 'hi' ? 'नया' : 'New'}
                            </button>
                            <button
                                type="button"
                                className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setCondition('old')}
                                style={{ flex: 1 }}
                            >
                                📦 {language === 'hi' ? 'पुराना' : 'Used'}
                            </button>
                        </div>
                    </div>

                    {/* Years Used (only if old) */}
                    {condition === 'old' && (
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'कितने साल इस्तेमाल किया?' : 'How many years used?'}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={yearsUsed}
                                onChange={(e) => setYearsUsed(e.target.value)}
                                placeholder={language === 'hi' ? 'जैसे: 2 साल, 6 महीने...' : 'e.g., 2 years, 6 months...'}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '18px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--color-border)'
                                }}
                            />
                        </div>
                    )}

                    {/* Original Bill Available */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'ओरिजिनल बिल उपलब्ध?' : 'Original Bill Available?'}
                        </label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                className={`btn ${hasBill === true ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => setHasBill(true)}
                                style={{ flex: 1 }}
                            >
                                ✅ {language === 'hi' ? 'हाँ' : 'Yes'}
                            </button>
                            <button
                                type="button"
                                className={`btn ${hasBill === false ? 'btn-outline' : 'btn-outline'}`}
                                onClick={() => setHasBill(false)}
                                style={{ flex: 1, opacity: hasBill === false ? 1 : 0.7 }}
                            >
                                ❌ {language === 'hi' ? 'नहीं' : 'No'}
                            </button>
                        </div>
                    </div>

                    {/* Defects */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'कोई खराबी/दोष?' : 'Any Defects?'}
                        </label>
                        <textarea
                            className="form-input"
                            value={defects}
                            onChange={(e) => setDefects(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: स्क्रीन पर छोटा स्क्रैच, बैटरी कमज़ोर...' : 'e.g., Small scratch on screen, weak battery...'}
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Image Upload */}
                    <ImageUpload
                        onImagesChange={handleImagesChange}
                        currentPreviews={imagePreviews}
                        maxImages={5}
                        thumbnailIndex={thumbnailIndex}
                        onThumbnailChange={handleThumbnailChange}
                    />

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">{t('enter_price')} *</label>
                        <input
                            type="number"
                            className="form-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="₹"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '24px',
                                fontWeight: 700,
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Seller Contact Info */}
                    <PrefilledLabel source={source} />
                    <SellerContactInfo
                        location={location}
                        onLocationChange={setLocation}
                        pincode={pincode}
                        onPincodeChange={setPincode}
                        sellerPhone={sellerPhone}
                        onSellerPhoneChange={setSellerPhone}
                        whatsappEnabled={whatsappEnabled}
                        onWhatsappEnabledChange={setWhatsappEnabled}
                    />

                    {/* Summary Card */}
                    <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>
                                    {companyName} {name} {modelName && `(${modelName})`}
                                </div>
                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                    {condition === 'new' ? '✨ नया/New' : `📦 पुराना/Used ${yearsUsed ? `(${yearsUsed})` : ''}`}
                                </div>
                                {hasBill && (
                                    <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                                        ✅ {language === 'hi' ? 'बिल उपलब्ध' : 'Bill Available'}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                ₹{price || '0'}
                            </div>
                        </div>
                        {defects && (
                            <div style={{ color: 'var(--color-warning)', marginBottom: 8 }}>
                                ⚠️ {defects}
                            </div>
                        )}
                        {location && (
                            <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                        )}
                        {sellerPhone && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span>📞 {sellerPhone}</span>
                                {whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}
                            </div>
                        )}
                    </div>

                    <Disclaimer />

                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                    >
                        {loading
                            ? t('loading')
                            : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                    </button>
                </>
            )}
        </>
    )
}
