import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'
import { supabase, Product, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { getStoredPincode } from '../lib/storage'

export function HomePage() {
    const { t, user, language, mode } = useApp()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')

    // Check if ride mode (deactivated but keep for future)
    const isRideMode = mode === 'ride'

    const headerTitle = isRideMode
        ? (language === 'hi' ? '🏍️ बाइक सवारी' : '🏍️ Bike Rides')
        : (language === 'hi' ? '🛒 स्थानीय बाज़ार' : '🛒 Local Market')

    // Fetch products on mount
    useEffect(() => {
        if (!isRideMode) {
            fetchProducts()
        }
    }, [isRideMode])

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
    const getFilteredProducts = () => {
        let filtered = products
        const pincode = getStoredPincode()

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        // Filter by pincode - show exact + nearby (first 3 digits match)
        if (pincode && pincode.length === 6) {
            const pincodePrefix = pincode.slice(0, 3)
            filtered = filtered.filter(p => {
                if (!p.pincode) return true // Show products without pincode
                return p.pincode.slice(0, 3) === pincodePrefix
            })
            // Sort: exact matches first
            filtered.sort((a, b) => {
                const aExact = a.pincode === pincode ? 0 : 1
                const bExact = b.pincode === pincode ? 0 : 1
                return aExact - bExact
            })
        }

        return filtered
    }

    const filteredProducts = getFilteredProducts()

    // Ride mode view (deactivated but kept)
    if (isRideMode) {
        return (
            <div className="app">
                <Header title={headerTitle} />
                <div className="page">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{ fontSize: 24, marginBottom: 8 }}>
                            {user?.name ? `नमस्ते, ${user.name}!` : t('app_name')}
                        </h1>
                        <p className="text-light">
                            {language === 'hi' ? 'कहाँ जाना है?' : 'Where do you want to go?'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Link to="/find" className="home-section-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <div className="home-section-icon">🔍</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सवारी खोजें' : 'Find a Ride'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'आज उपलब्ध सवारी देखें' : 'See available rides today'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>
                        <Link to="/post" className="home-section-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                            <div className="home-section-icon">🏍️</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सवारी दें' : 'Offer a Ride'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'अपनी यात्रा साझा करें' : 'Share your journey'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // Produce mode - Show all products with categories
    return (
        <div className="app">
            <Header title={headerTitle} />

            <div className="page">
                {/* Welcome message */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h1 style={{ fontSize: 20, marginBottom: 4 }}>
                        {user?.name ? `${language === 'hi' ? 'नमस्ते' : 'Hello'}, ${user.name}!` : t('app_name')}
                    </h1>
                    <p className="text-light" style={{ fontSize: 14 }}>
                        {language === 'hi' ? 'आपके आस-पास बिक्री के लिए उपलब्ध' : 'Available for sale near you'}
                    </p>
                </div>

                {/* Horizontal scrollable categories */}
                <div className="category-scroll" style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 12,
                    marginBottom: 16,
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <button
                        className={`category-pill ${selectedCategory === 'all' ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: selectedCategory === 'all' ? '2px solid #10b981' : '1px solid #e2e8f0',
                            background: selectedCategory === 'all' ? '#dcfce7' : 'white',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            color: selectedCategory === 'all' ? '#059669' : '#64748b'
                        }}
                    >
                        <span>🔍</span>
                        <span>{language === 'hi' ? 'सभी' : 'All'}</span>
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '8px 14px',
                                borderRadius: 20,
                                border: selectedCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #e2e8f0',
                                background: selectedCategory === cat.id ? `${cat.color}15` : 'white',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                color: selectedCategory === cat.id ? cat.color : '#64748b'
                            }}
                        >
                            <span>{cat.icon}</span>
                            <span>{language === 'hi' ? cat.hi : cat.en}</span>
                        </button>
                    ))}
                </div>

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
                        <p>{language === 'hi' ? 'कोई आइटम नहीं मिला' : 'No items found'}</p>
                        <Link
                            to="/request"
                            style={{
                                display: 'inline-block',
                                marginTop: 12,
                                padding: '12px 24px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            🔔 {language === 'hi' ? 'मांग करें' : 'Request Item'}
                        </Link>
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

                {/* Quick tip banner */}
                {!loading && filteredProducts.length > 0 && (
                    <div style={{
                        marginTop: 24,
                        padding: 16,
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                        borderRadius: 12,
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 14, color: '#0369a1', marginBottom: 8 }}>
                            {language === 'hi' ? 'जो चाहिए वो नहीं मिला?' : "Can't find what you need?"}
                        </p>
                        <Link
                            to="/request"
                            style={{
                                fontSize: 14,
                                color: '#1d4ed8',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            🔔 {language === 'hi' ? 'मांग पोस्ट करें →' : 'Post a request →'}
                        </Link>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
