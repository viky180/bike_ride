import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getPopularProducts, PopularProduct } from '../../lib/popularProducts'
import { ProductCategory } from '../../lib/supabase'
import { CATEGORIES } from '../../lib/categories'
import { CategoryBadge } from './CategoryBadge'
import { ImageUpload } from '../ImageUpload'
import { PincodeInput } from '../PincodeInput'

interface RegularProductFormProps {
    category: ProductCategory
    onBack: () => void
    onSubmit: (data: RegularProductFormData) => Promise<void>
    loading: boolean
}

export interface RegularProductFormData {
    name: string
    selectedIcon: string
    quantity: string
    price: string
    location: string
    pincode: string
    imageFiles: File[]
    imagePreviews: string[]
}

export function RegularProductForm({ category, onBack, onSubmit, loading }: RegularProductFormProps) {
    const { t, language } = useApp()

    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const selectedCat = CATEGORIES.find(c => c.id === category)
    const popularProducts = getPopularProducts(category)

    const handleSelectProduct = (product: PopularProduct) => {
        setName(language === 'hi' ? product.hi : product.name)
        setSelectedIcon(product.icon)
        setShowCustomInput(false)
    }

    const handleCustomInput = () => {
        setShowCustomInput(true)
        setSelectedIcon('')
    }

    const handleImagesChange = (files: File[], previews: string[]) => {
        setImageFiles(files)
        setImagePreviews(previews)
    }

    const handleSubmit = () => {
        onSubmit({ name, selectedIcon, quantity, price, location, pincode, imageFiles, imagePreviews })
    }

    const canSubmit = name.trim() && quantity.trim() && price

    return (
        <>
            <CategoryBadge
                icon={selectedCat?.icon || '📦'}
                labelHi={selectedCat?.hi || 'श्रेणी'}
                labelEn={selectedCat?.en || 'Category'}
                onChangeClick={onBack}
            />

            {/* Popular products grid */}
            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                </label>

                <div className="popular-products-grid">
                    {popularProducts.map(product => (
                        <button
                            key={product.name}
                            className={`popular-product-btn ${name === (language === 'hi' ? product.hi : product.name) ? 'selected' : ''}`}
                            onClick={() => handleSelectProduct(product)}
                        >
                            <span className="icon">{product.icon}</span>
                            <span className="name">{language === 'hi' ? product.hi : product.name}</span>
                        </button>
                    ))}

                    {/* Other/Custom option */}
                    <button
                        className={`popular-product-btn ${showCustomInput ? 'selected' : ''}`}
                        onClick={handleCustomInput}
                    >
                        <span className="icon">✏️</span>
                        <span className="name">{language === 'hi' ? 'अन्य' : 'Other'}</span>
                    </button>
                </div>

                {showCustomInput && (
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'hi' ? 'उत्पाद का नाम लिखें...' : 'Type product name...'}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '18px',
                            borderRadius: '12px',
                            border: '2px solid var(--color-primary)',
                            marginTop: '12px'
                        }}
                    />
                )}
            </div>

            {/* Show remaining fields only if product is selected */}
            {name && (
                <>
                    <ImageUpload
                        onImagesChange={handleImagesChange}
                        currentPreviews={imagePreviews}
                        maxImages={3}
                    />

                    <div className="form-group">
                        <label className="form-label">{t('enter_quantity')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder={language === 'hi' ? '10 किलो, 50 पीस...' : '10 kg, 50 pieces...'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('enter_price')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={language === 'hi' ? '₹50/किलो, ₹500/क्विंटल...' : '₹50/kg, ₹500/quintal...'}
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

                    <div className="form-group">
                        <label className="form-label">{t('your_location')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: रामपुर गाँव' : 'e.g., Rampur Village'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    <PincodeInput value={pincode} onChange={setPincode} required />

                    {/* Summary */}
                    <div className="card mb-lg">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 32 }}>{selectedIcon || selectedCat?.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
                                <div style={{ color: 'var(--color-text-light)' }}>{quantity || '—'}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                {price || '₹0'}
                            </div>
                        </div>
                        {location && (
                            <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                        )}
                    </div>

                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? t('loading') : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                    </button>
                </>
            )}
        </>
    )
}
