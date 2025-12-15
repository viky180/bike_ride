import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { getPopularProducts, PopularProduct } from '../lib/popularProducts'
import { Header } from '../components/Header'

export function RequestProductPage() {
    const { t, user, showToast, language } = useApp()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [productName, setProductName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [expectedPrice, setExpectedPrice] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCustomInput, setShowCustomInput] = useState(false)

    const handleSelectCategory = (cat: ProductCategory) => {
        setCategory(cat)
        setProductName('')
        setShowCustomInput(false)
        setStep(2)
    }

    const handleSelectProduct = (product: PopularProduct) => {
        setProductName(language === 'hi' ? product.hi : product.name)
        setShowCustomInput(false)
    }

    const handleSubmit = async () => {
        if (!category || !productName.trim() || !user) return

        setLoading(true)
        try {
            // Check active request count
            const { count } = await supabase
                .from('product_requests')
                .select('*', { count: 'exact', head: true })
                .eq('buyer_id', user.id)
                .eq('status', 'active')

            if (count && count >= 2) {
                showToast(t('max_requests'))
                setLoading(false)
                return
            }

            const { error } = await supabase
                .from('product_requests')
                .insert({
                    buyer_id: user.id,
                    category,
                    product_name: productName.trim(),
                    quantity: quantity.trim() || null,
                    expected_price: expectedPrice ? parseInt(expectedPrice) : null,
                    location: location.trim() || null,
                    status: 'active'
                })

            if (error) throw error

            showToast(t('request_submitted'))
            navigate('/demand')
        } catch (error) {
            console.error('Error submitting request:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedCat = category ? CATEGORIES.find(c => c.id === category) : null
    const popularProducts = category ? getPopularProducts(category) : []

    return (
        <div className="app">
            <Header title={t('request_product')} showBack />

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

                {/* Step 2: Product Details */}
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

                        {/* What do you need? */}
                        <div className="form-group">
                            <label className="form-label">{t('what_need')}</label>

                            {/* Popular product icons */}
                            <div className="popular-products-grid">
                                {popularProducts.map(product => (
                                    <button
                                        key={product.name}
                                        className={`popular-product-btn ${productName === (language === 'hi' ? product.hi : product.name) ? 'selected' : ''}`}
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <span className="icon">{product.icon}</span>
                                        <span className="name">{language === 'hi' ? product.hi : product.name}</span>
                                    </button>
                                ))}

                                {/* Other option */}
                                <button
                                    className={`popular-product-btn ${showCustomInput ? 'selected' : ''}`}
                                    onClick={() => setShowCustomInput(true)}
                                >
                                    <span className="icon">✏️</span>
                                    <span className="name">{language === 'hi' ? 'अन्य' : 'Other'}</span>
                                </button>
                            </div>

                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
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
                        {productName && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">{t('enter_quantity')} ({language === 'hi' ? 'वैकल्पिक' : 'optional'})</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={language === 'hi' ? '5 किलो, रोज़...' : '5 kg, daily...'}
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
                                    <label className="form-label">{t('expected_price')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={expectedPrice}
                                        onChange={(e) => setExpectedPrice(e.target.value)}
                                        placeholder="₹"
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

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={loading || !productName.trim()}
                                >
                                    {loading ? t('loading') : t('submit_request')}
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
