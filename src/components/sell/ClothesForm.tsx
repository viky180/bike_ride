import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CLOTHES_ITEMS, SIZE_OPTIONS, ClothesItem, Condition, Gender } from '../../lib/sellFormConstants'
import { CategoryBadge } from './CategoryBadge'
import { ItemSelector } from './ItemSelector'
import { SellerContactInfo } from './SellerContactInfo'
import { Disclaimer } from './Disclaimer'
import { ImageUpload } from '../ImageUpload'

interface ClothesFormProps {
    onBack: () => void
    onSubmit: (data: ClothesFormData) => Promise<void>
    loading: boolean
}

export interface ClothesFormData {
    name: string
    selectedIcon: string
    brand: string
    gender: Gender
    size: string
    color: string
    material: string
    condition: Condition
    price: string
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
    imageFiles: File[]
    imagePreviews: string[]
}

export function ClothesForm({ onBack, onSubmit, loading }: ClothesFormProps) {
    const { t, language } = useApp()

    const [clothesItem, setClothesItem] = useState<string>('')
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [brand, setBrand] = useState('')
    const [gender, setGender] = useState<Gender>('')
    const [size, setSize] = useState('')
    const [color, setColor] = useState('')
    const [material, setMaterial] = useState('')
    const [condition, setCondition] = useState<Condition>('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleSelectItem = (item: ClothesItem) => {
        setClothesItem(item.id)
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

    const handleSubmit = () => {
        onSubmit({
            name, selectedIcon, brand, gender, size, color, material, condition,
            price, location, pincode, sellerPhone, whatsappEnabled, imageFiles, imagePreviews
        })
    }

    const showDetails = clothesItem && (clothesItem !== 'other' || name.trim())
    const canSubmit = name.trim() && condition && size && price && sellerPhone.trim()

    return (
        <>
            <CategoryBadge icon="👕" labelHi="कपड़े" labelEn="Clothes" onChangeClick={onBack} />

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                </label>
                <ItemSelector
                    items={CLOTHES_ITEMS}
                    selectedId={clothesItem}
                    onSelect={handleSelectItem}
                    showCustomInput={showCustomInput}
                    customInputValue={name}
                    onCustomInputChange={setName}
                />
            </div>

            {showDetails && (
                <>
                    {/* Brand Name */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'ब्रांड का नाम (वैकल्पिक)' : 'Brand Name (Optional)'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder={language === 'hi' ? "जैसे: Levi's, Zara, FabIndia..." : "e.g., Levi's, Zara, FabIndia..."}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'किसके लिए?' : 'For whom?'}
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                                { id: 'men', icon: '👨', hi: 'पुरुष', en: 'Men' },
                                { id: 'women', icon: '👩', hi: 'महिला', en: 'Women' },
                                { id: 'kids', icon: '🧒', hi: 'बच्चे', en: 'Kids' },
                                { id: 'unisex', icon: '👤', hi: 'Unisex', en: 'Unisex' },
                            ].map(g => (
                                <button
                                    key={g.id}
                                    type="button"
                                    className={`btn btn-sm ${gender === g.id ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setGender(g.id as Gender)}
                                >
                                    {g.icon} {language === 'hi' ? g.hi : g.en}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'साइज़ *' : 'Size *'}</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {SIZE_OPTIONS.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className={`btn btn-sm ${size === s.label ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setSize(s.label)}
                                    style={{ minWidth: 50 }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'रंग' : 'Color'}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: नीला, लाल, काला...' : 'e.g., Blue, Red, Black...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Material */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कपड़े का प्रकार/मटीरियल' : 'Fabric/Material'}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: कॉटन, सिल्क, पॉलिएस्टर...' : 'e.g., Cotton, Silk, Polyester...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Condition */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'स्थिति *' : 'Condition *'}</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCondition('new')} style={{ flex: 1 }}>
                                ✨ {language === 'hi' ? 'नया' : 'New'}
                            </button>
                            <button type="button" className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCondition('old')} style={{ flex: 1 }}>
                                👕 {language === 'hi' ? 'पुराना' : 'Used'}
                            </button>
                        </div>
                    </div>

                    <ImageUpload onImagesChange={handleImagesChange} currentPreviews={imagePreviews} maxImages={5} />

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">{t('enter_price')} *</label>
                        <input
                            type="number"
                            className="form-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="₹"
                            style={{ width: '100%', padding: '16px', fontSize: '24px', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--color-border)' }}
                        />
                    </div>

                    <SellerContactInfo
                        location={location} onLocationChange={setLocation}
                        pincode={pincode} onPincodeChange={setPincode}
                        sellerPhone={sellerPhone} onSellerPhoneChange={setSellerPhone}
                        whatsappEnabled={whatsappEnabled} onWhatsappEnabledChange={setWhatsappEnabled}
                    />

                    {/* Summary Card */}
                    <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{brand ? `${brand} ` : ''}{name} {color && `- ${color}`}</div>
                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>Size: {size || '—'} | {condition === 'new' ? '✨ नया/New' : '👕 पुराना/Used'}</div>
                                {gender && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>{gender === 'men' ? '👨 पुरुष/Men' : gender === 'women' ? '👩 महिला/Women' : gender === 'kids' ? '🧒 बच्चे/Kids' : '👤 Unisex'}</div>}
                                {material && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>🧵 {material}</div>}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>₹{price || '0'}</div>
                        </div>
                        {location && <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>}
                        {sellerPhone && <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}><span>📞 {sellerPhone}</span>{whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}</div>}
                    </div>

                    <Disclaimer />

                    <button className="btn btn-success" onClick={handleSubmit} disabled={loading || !canSubmit}>
                        {loading ? t('loading') : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                    </button>
                </>
            )}
        </>
    )
}
