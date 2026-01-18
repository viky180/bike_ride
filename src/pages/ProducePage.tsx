import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, Product, ProductCategory } from '../lib/supabase'
import { HERO_CATEGORIES, STANDARD_CATEGORIES, CATEGORIES } from '../lib/categories'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'
import { getStoredPincode, setStoredPincode } from '../lib/storage'
import { useGeolocation } from '../lib/useGeolocation'

export function ProducePage() {
    const { t, language } = useApp()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
    const [showProducts, setShowProducts] = useState(false)

    // Pincode filter state
    const [filterPincode, setFilterPincode] = useState(getStoredPincode() || '')

    // Geolocation for auto-detect
    const { pincode: detectedPincode, loading: detectingLocation, error: locationError, detectLocation } = useGeolocation()

    useEffect(() => {
        fetchProducts()
    }, [])

    // Save pincode to localStorage when it changes
    useEffect(() => {
        if (filterPincode.length === 6) {
            setStoredPincode(filterPincode)
        }
    }, [filterPincode])

    // Auto-fill pincode when detected
    useEffect(() => {
        if (detectedPincode) {
            setFilterPincode(detectedPincode)
        }
    }, [detectedPincode])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:users!seller_id(id, name, phone)
                `)
                .eq('status', 'available')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts((data || []) as Product[])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter products by category and pincode
    // Shows exact matches first, then nearby matches (same first 3 digits)
    const getFilteredProducts = () => {
        let filtered = products

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        // Filter by pincode - include exact + nearby, sorted with exact first
        if (filterPincode.length === 6) {
            const pincodePrefix = filterPincode.slice(0, 3)

            // Get all products matching the pincode area (first 3 digits)
            filtered = filtered.filter(p => {
                if (!p.pincode) return false
                return p.pincode.slice(0, 3) === pincodePrefix
            })

            // Sort: exact matches first, then nearby
            filtered.sort((a, b) => {
                const aExact = a.pincode === filterPincode ? 0 : 1
                const bExact = b.pincode === filterPincode ? 0 : 1
                return aExact - bExact
            })
        }

        return filtered
    }

    const filteredProducts = getFilteredProducts()

    const handleCategoryClick = (categoryId: ProductCategory) => {
        setSelectedCategory(categoryId)
        setShowProducts(true)
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setShowProducts(false)
    }

    const handleClearPincode = () => {
        setFilterPincode('')
        setStoredPincode(null)
    }

    // Category browsing view (Zepto-inspired)
    if (!showProducts) {
        return (
            <div className="app">
                <Header title={t('browse_produce')} />

                <div className="page category-browse-page">
                    {/* Pincode Filter Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 20,
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 20 }}>📍</span>
                            <span style={{ fontWeight: 600, color: '#0369a1' }}>
                                {language === 'hi' ? 'अपने एरिया में खोजें' : 'Find in your area'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {/* Input wrapper with clear button */}
                            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={filterPincode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                        setFilterPincode(val)
                                    }}
                                    placeholder={language === 'hi' ? 'पिनकोड डालें' : 'Enter pincode'}
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: filterPincode ? '12px 44px 12px 16px' : '12px 16px',
                                        fontSize: 16,
                                        borderRadius: 12,
                                        border: filterPincode.length === 6 ? '2px solid #22c55e' : '2px solid #cbd5e1',
                                        background: 'white'
                                    }}
                                />
                                {filterPincode && (
                                    <button
                                        onClick={handleClearPincode}
                                        style={{
                                            position: 'absolute',
                                            right: 8,
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            border: 'none',
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={detectLocation}
                                disabled={detectingLocation}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: detectingLocation ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: detectingLocation ? '#94a3b8' : 'white',
                                    fontWeight: 600,
                                    cursor: detectingLocation ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: detectingLocation ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                {detectingLocation ? (
                                    <>
                                        <span style={{
                                            display: 'inline-block',
                                            width: 14,
                                            height: 14,
                                            border: '2px solid #94a3b8',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    </>
                                ) : (
                                    <>📍 {language === 'hi' ? 'पता लगाएं' : 'Detect'}</>
                                )}
                            </button>
                        </div>
                        {filterPincode.length === 6 && (
                            <small style={{ display: 'block', marginTop: 8, color: '#64748b' }}>
                                {language === 'hi'
                                    ? `✨ पहले ${filterPincode} से, फिर ${filterPincode.slice(0, 3)}xxx एरिया से`
                                    : `✨ First from ${filterPincode}, then from ${filterPincode.slice(0, 3)}xxx area`}
                            </small>
                        )}
                        {locationError && (
                            <small style={{ display: 'block', marginTop: 8, color: '#dc2626' }}>
                                ⚠️ {locationError}
                            </small>
                        )}
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>

                    {/* Hero Section - Agriculture / खेती-बाड़ी */}
                    <section className="category-section">
                        <h2 className="section-title" style={{ marginBottom: 16 }}>
                            🌾 {language === 'hi' ? 'खेती-बाड़ी' : 'Agriculture'}
                        </h2>
                        <div className="category-hero-grid">
                            {HERO_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className="category-hero-card"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                    }}
                                >
                                    <div className="category-hero-overlay">
                                        <span className="category-hero-name">
                                            {language === 'hi' ? cat.hi : cat.en}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Other Categories - 3 column grid */}
                    <section className="category-section">
                        <h2 className="category-section-title">
                            {language === 'hi' ? 'अन्य श्रेणियाँ' : 'Other Categories'}
                        </h2>
                        <div className="category-standard-grid">
                            {STANDARD_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className="category-standard-card"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                    }}
                                >
                                    <div className="category-standard-overlay">
                                        <span className="category-standard-name">
                                            {language === 'hi' ? cat.hi : cat.en}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Request banner + Demand board link */}
                    <div className="produce-actions">
                        <Link to="/request" className="request-banner">
                            <span>🔍</span>
                            <span>{t('product_not_found')}</span>
                            <span className="arrow">→</span>
                        </Link>
                        <Link to="/demand" className="demand-link">
                            <span>📢</span>
                            <span>{t('demand_board')}</span>
                        </Link>
                    </div>

                    {/* Sell FAB */}
                    <Link to="/sell" className="fab">
                        <span>+</span>
                    </Link>
                </div>

                <BottomNav />
            </div >
        )
    }

    // Product listing view (when category is selected)
    return (
        <div className="app">
            <Header title={t('browse_produce')} showBack onBack={handleBackToCategories} />

            <div className="page">
                {/* Pincode Filter (compact) */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: 12
                }}>
                    <span>📍</span>
                    <input
                        type="text"
                        value={filterPincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setFilterPincode(val)
                        }}
                        placeholder={language === 'hi' ? 'पिनकोड' : 'Pincode'}
                        maxLength={6}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: 14,
                            borderRadius: 8,
                            border: filterPincode.length === 6 ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            background: 'white'
                        }}
                    />
                    {filterPincode.length === 6 && (
                        <button
                            onClick={handleClearPincode}
                            style={{
                                padding: '8px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    )}
                    <button
                        onClick={detectLocation}
                        disabled={detectingLocation}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: 'none',
                            background: detectingLocation ? '#e2e8f0' : '#dbeafe',
                            color: detectingLocation ? '#94a3b8' : '#1d4ed8',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: detectingLocation ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {detectingLocation ? '...' : '📍'}
                    </button>
                </div>

                {/* Category filter tabs */}
                <div className="category-tabs">
                    <button
                        className={`category-tab ${selectedCategory === null ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <span className="icon">🔍</span>
                        <span className="name">{t('all_categories')}</span>
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-tab ${selectedCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                borderColor: selectedCategory === cat.id ? cat.color : undefined,
                                background: selectedCategory === cat.id ? `${cat.color}15` : undefined
                            }}
                        >
                            <span className="icon">{cat.icon}</span>
                            <span className="name">{language === 'hi' ? cat.hi : cat.en}</span>
                        </button>
                    ))}
                </div>

                {/* Back to categories link */}
                <button className="back-to-categories" onClick={handleBackToCategories}>
                    ← {language === 'hi' ? 'श्रेणियाँ देखें' : 'Browse Categories'}
                </button>

                {/* Loading */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">🌾</div>
                        <p>{filterPincode.length === 6
                            ? (language === 'hi' ? 'इस पिनकोड में कोई आइटम नहीं मिला' : 'No items found in this pincode')
                            : t('no_products')
                        }</p>
                        {filterPincode.length === 6 && (
                            <button
                                onClick={handleClearPincode}
                                style={{
                                    marginTop: 12,
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {language === 'hi' ? 'सभी देखें' : 'Show all'}
                            </button>
                        )}
                    </div>
                )}

                {/* Product grid */}
                <div className="product-grid">
                    {!loading && filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

                {/* Sell FAB */}
                <Link to="/sell" className="fab">
                    <span>+</span>
                </Link>
            </div>

            <BottomNav />
        </div>
    )
}

