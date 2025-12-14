import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { getPopularProducts, PopularProduct } from '../lib/popularProducts'
import { Header } from '../components/Header'

export function SellProductPage() {
    const { t, user, showToast, language } = useApp()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCustomInput, setShowCustomInput] = useState(false)

    const handleSelectCategory = (cat: ProductCategory) => {
        setCategory(cat)
        setName('')
        setSelectedIcon('')
        setShowCustomInput(false)
        setStep(2)
    }

    const handleSelectProduct = (product: PopularProduct) => {
        setName(language === 'hi' ? product.hi : product.name)
        setSelectedIcon(product.icon)
        setShowCustomInput(false)
    }

    const handleCustomInput = () => {
        setShowCustomInput(true)
        setSelectedIcon('')
    }

    const handleSubmit = async () => {
        if (!category || !name.trim() || !quantity.trim() || !price || !user) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('products')
                .insert({
                    seller_id: user.id,
                    category,
                    name: name.trim(),
                    quantity: quantity.trim(),
                    price: parseInt(price),
                    location: location.trim() || null,
                    status: 'available'
                })

            if (error) throw error

            showToast(t('product_posted'))
            navigate('/my-products')
        } catch (error) {
            console.error('Error posting product:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedCat = category ? CATEGORIES.find(c => c.id === category) : null
    const popularProducts = category ? getPopularProducts(category) : []

    return (
        <div className="app">
            <Header title={t('sell_produce')} showBack />

            <div className="page">
                {/* Step 1: Select Category */}
                {step === 1 && (
                    <>
                        <h2 className="section-title">{t('select_category')}</h2>
                        <div className="category-grid">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className="category-card"
                                    onClick={() => handleSelectCategory(cat.id)}
                                    style={{
                                        borderColor: cat.color,
                                        background: `${cat.color}10`
                                    }}
                                >
                                    <span className="icon">{cat.icon}</span>
                                    <span className="name">{language === 'hi' ? cat.hi : cat.en}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Step 2: Select Product & Details */}
                {step === 2 && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>{selectedCat?.icon}</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? selectedCat?.hi : selectedCat?.en}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Popular products grid */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                            </label>

                            {/* Popular product icons */}
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

                            {/* Custom text input (shown when "Other" is selected or no selection) */}
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

                                {/* Summary */}
                                <div className="card mb-lg">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon || selectedCat?.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
                                            <div style={{ color: 'var(--color-text-light)' }}>{quantity || '—'}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !quantity.trim() || !price}
                                >
                                    {loading ? t('loading') : t('sell_produce')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                    {[1, 2].map(s => (
                        <div
                            key={s}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: s === step ? 'var(--color-primary)' : 'var(--color-border)',
                                cursor: s < step ? 'pointer' : 'default'
                            }}
                            onClick={() => s < step && setStep(s)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
