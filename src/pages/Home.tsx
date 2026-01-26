import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'
import { supabase, Product, ProductCategory, ProductRequest } from '../lib/supabase'
import { HorizontalCategorySelector } from '../components/HorizontalCategorySelector'
import { getStoredPincode } from '../lib/storage'
import { getCategory, ServiceCategory } from '../lib/categories'

export function HomePage() {
    const { t, language, mode } = useApp()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [products, setProducts] = useState<Product[]>([])
    const [requests, setRequests] = useState<ProductRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ServiceCategory | 'all'>('all')

    // Check if ride mode (deactivated but keep for future)
    const isRideMode = mode === 'ride'

    const headerTitle = isRideMode
        ? (language === 'hi' ? '🏍️ बाइक सवारी' : '🏍️ Bike Rides')
        : (language === 'hi' ? '🛒 स्थानीय बाज़ार' : '🛒 Local Market')

    // Fetch products and requests on mount
    useEffect(() => {
        if (!isRideMode) {
            fetchProducts()
            fetchRequests()
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

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('product_requests')
                .select(`
                    *,
                    buyer:users!buyer_id(id, name, phone)
                `)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setRequests((data || []) as ProductRequest[])
        } catch (error) {
            console.error('Error fetching requests:', error)
        }
    }

    // Filter products by category and pincode
    const getFilteredProducts = () => {
        let filtered = products
        const pincode = getStoredPincode()

        // Filter by category
        if (selectedCategory !== 'all' && selectedCategory !== 'delivery_help') {
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

    const handleCategorySelect = (category: ProductCategory | ServiceCategory | 'all') => {
        if (category === 'delivery_help') {
            navigate('/delivery-help')
            return
        }
        setSelectedCategory(category)
    }

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
            <div className="header-stack">
                <Header title={headerTitle} />

                {/* Category filter */}
                <HorizontalCategorySelector
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelect}
                    language={language}
                />
            </div>

            <div className="page" style={{ paddingTop: 0 }}>
                {/* Welcome message */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h1 style={{ fontSize: 20, marginBottom: 4 }}>
                        {user?.name ? `${language === 'hi' ? 'नमस्ते' : 'Hello'}, ${user.name}!` : t('app_name')}
                    </h1>
                    <p className="text-light" style={{ fontSize: 14 }}>
                        {language === 'hi' ? 'आपके आस-पास बिक्री के लिए उपलब्ध' : 'Available for sale near you'}
                    </p>
                </div>

                {/* Requests horizontal scroll section */}
                {requests.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                📢 {language === 'hi' ? 'लोग ढूंढ रहे हैं' : 'People are looking for'}
                            </h3>
                            <Link
                                to="/demand"
                                style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
                            >
                                {language === 'hi' ? 'सभी देखें →' : 'View all →'}
                            </Link>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: 12,
                            overflowX: 'auto',
                            paddingBottom: 8,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}>
                            {requests.slice(0, 6).map(request => {
                                const category = getCategory(request.category)
                                return (
                                    <Link
                                        key={request.id}
                                        to="/demand"
                                        style={{
                                            minWidth: 160,
                                            padding: 12,
                                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                            borderRadius: 12,
                                            textDecoration: 'none',
                                            color: '#92400e',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 20,
                                                background: 'rgba(255,255,255,0.6)',
                                                borderRadius: 8,
                                                padding: '4px 6px'
                                            }}>
                                                {category?.icon || '📦'}
                                            </span>
                                            <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                                                {request.product_name.length > 18
                                                    ? request.product_name.slice(0, 18) + '...'
                                                    : request.product_name}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                                            {request.quantity && <span>📦 {request.quantity}</span>}
                                            {request.expected_price && <span style={{ marginLeft: 8 }}>💰 ₹{request.expected_price}</span>}
                                            {!request.quantity && !request.expected_price && (
                                                <span>{language === 'hi' ? 'संपर्क करें' : 'Contact them'}</span>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

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
