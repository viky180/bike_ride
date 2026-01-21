import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { getPopularProducts, PopularProduct } from '../lib/popularProducts'
import { Header } from '../components/Header'

// Location scope options for job seekers
const LOCATION_SCOPES = [
    { id: 'state', en: 'State', hi: 'राज्य' },
    { id: 'district', en: 'District', hi: 'जिला' },
    { id: 'city', en: 'City', hi: 'शहर' },
    { id: 'village', en: 'Village', hi: 'गाँव' },
    { id: 'pincode', en: 'Pincode', hi: 'पिनकोड' },
]

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

    // Job seeker specific fields
    const [salaryExpected, setSalaryExpected] = useState('')
    const [experience, setExperience] = useState('')
    const [presentLocation, setPresentLocation] = useState('')
    const [allIndia, setAllIndia] = useState(false)
    const [availableRegions, setAvailableRegions] = useState<string[]>([])
    const [locationInput, setLocationInput] = useState('')
    const [selectedScope, setSelectedScope] = useState('state')

    const isJobCategory = category === 'jobs'

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

    const handleAddRegion = () => {
        if (locationInput.trim()) {
            const scope = LOCATION_SCOPES.find(s => s.id === selectedScope)
            const label = `${scope?.en || selectedScope}: ${locationInput.trim()}`
            if (!availableRegions.includes(label)) {
                setAvailableRegions([...availableRegions, label])
            }
            setLocationInput('')
        }
    }

    const handleRemoveRegion = (region: string) => {
        setAvailableRegions(availableRegions.filter(r => r !== region))
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

            // Build request data based on category
            let requestData: any = {
                buyer_id: user.id,
                category,
                product_name: productName.trim(),
                status: 'active'
            }

            if (isJobCategory) {
                // Job seeker specific data
                const details: string[] = []
                if (salaryExpected) details.push(`💰 ${salaryExpected}`)
                if (experience) details.push(`📋 ${experience}`)
                if (presentLocation) details.push(`📍 ${presentLocation}`)
                if (allIndia) {
                    details.push('🇮🇳 All India')
                } else if (availableRegions.length > 0) {
                    details.push(`Available: ${availableRegions.join(', ')}`)
                }

                requestData.quantity = details.join(' | ')
                requestData.location = presentLocation.trim() || null
                requestData.expected_price = null
            } else {
                // Regular product request
                requestData.quantity = quantity.trim() || null
                requestData.expected_price = expectedPrice ? parseInt(expectedPrice) : null
                requestData.location = location.trim() || null
            }

            const { error } = await supabase
                .from('product_requests')
                .insert(requestData)

            if (error) throw error

            showToast(isJobCategory
                ? (language === 'hi' ? '✅ नौकरी अनुरोध सबमिट!' : '✅ Job request submitted!')
                : t('request_submitted')
            )
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

                {/* Step 2: Product/Job Details */}
                {step === 2 && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>{selectedCat?.icon}</span>
                            <span style={{ fontWeight: 600 }}>
                                {isJobCategory
                                    ? (language === 'hi' ? 'नौकरी ढूंढ रहे हैं' : 'Looking for Job')
                                    : (language === 'hi' ? selectedCat?.hi : selectedCat?.en)
                                }
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

                        {/* Job type / Product selector */}
                        <div className="form-group">
                            <label className="form-label">
                                {isJobCategory
                                    ? (language === 'hi' ? 'कौन सा काम चाहिए?' : 'What job are you looking for?')
                                    : t('what_need')
                                }
                            </label>

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
                                    placeholder={isJobCategory
                                        ? (language === 'hi' ? 'काम का नाम लिखें...' : 'Type job title...')
                                        : (language === 'hi' ? 'उत्पाद का नाम लिखें...' : 'Type product name...')
                                    }
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

                        {/* Fields after product/job is selected */}
                        {productName && (
                            <>
                                {isJobCategory ? (
                                    <>
                                        {/* Job Seeker specific fields */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {language === 'hi' ? 'अपेक्षित वेतन' : 'Expected Salary'}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={salaryExpected}
                                                onChange={(e) => setSalaryExpected(e.target.value)}
                                                placeholder={language === 'hi' ? '₹500/दिन, ₹15000/महीना...' : '₹500/day, ₹15000/month...'}
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
                                            <label className="form-label">
                                                {language === 'hi' ? 'अनुभव' : 'Experience'}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                placeholder={language === 'hi' ? '2 साल, फ्रेशर...' : '2 years, fresher...'}
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
                                            <label className="form-label">
                                                {language === 'hi' ? 'वर्तमान स्थान' : 'Present Location'}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={presentLocation}
                                                onChange={(e) => setPresentLocation(e.target.value)}
                                                placeholder={language === 'hi' ? 'जैसे: रामपुर गाँव, दिल्ली...' : 'e.g., Rampur Village, Delhi...'}
                                                style={{
                                                    width: '100%',
                                                    padding: '16px',
                                                    fontSize: '18px',
                                                    borderRadius: '12px',
                                                    border: '2px solid var(--color-border)'
                                                }}
                                            />
                                        </div>

                                        {/* Available for regions */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {language === 'hi' ? 'कहाँ काम कर सकते हैं?' : 'Available to work in?'}
                                            </label>

                                            {/* All India checkbox */}
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '12px',
                                                background: allIndia ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                                                borderRadius: 8,
                                                marginBottom: 12,
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={allIndia}
                                                    onChange={(e) => setAllIndia(e.target.checked)}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                                <span style={{ fontWeight: 600 }}>
                                                    🇮🇳 {language === 'hi' ? 'पूरे भारत में' : 'All India'}
                                                </span>
                                            </label>

                                            {/* Location scope + input */}
                                            {!allIndia && (
                                                <>
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                                        {LOCATION_SCOPES.map(scope => (
                                                            <button
                                                                key={scope.id}
                                                                type="button"
                                                                onClick={() => setSelectedScope(scope.id)}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: 20,
                                                                    border: selectedScope === scope.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                                    background: selectedScope === scope.id ? 'var(--color-primary-light)' : 'transparent',
                                                                    fontWeight: selectedScope === scope.id ? 600 : 400,
                                                                    fontSize: 14
                                                                }}
                                                            >
                                                                {language === 'hi' ? scope.hi : scope.en}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <input
                                                            type="text"
                                                            value={locationInput}
                                                            onChange={(e) => setLocationInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddRegion()}
                                                            placeholder={language === 'hi' ? 'जोड़ने के लिए लिखें...' : 'Type to add...'}
                                                            style={{
                                                                flex: 1,
                                                                padding: '12px',
                                                                fontSize: '16px',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--color-border)'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleAddRegion}
                                                            style={{
                                                                padding: '12px 20px',
                                                                background: 'var(--color-primary)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 8,
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Added regions chips */}
                                                    {availableRegions.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                                            {availableRegions.map(region => (
                                                                <span
                                                                    key={region}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 6,
                                                                        padding: '6px 12px',
                                                                        background: 'var(--color-bg-secondary)',
                                                                        borderRadius: 20,
                                                                        fontSize: 14
                                                                    }}
                                                                >
                                                                    📍 {region}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveRegion(region)}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            padding: 0,
                                                                            cursor: 'pointer',
                                                                            fontSize: 16,
                                                                            color: 'var(--color-text-light)'
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Regular product request fields */}
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
                                    </>
                                )}

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={loading || !productName.trim()}
                                >
                                    {loading
                                        ? t('loading')
                                        : isJobCategory
                                            ? (language === 'hi' ? '📤 नौकरी ढूंढें' : '📤 Find Job')
                                            : t('submit_request')
                                    }
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
