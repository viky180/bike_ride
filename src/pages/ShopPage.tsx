import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { Shop, Product, getShopBySlug, getShopProducts } from '../lib/supabase'
import { Header } from '../components/Header'
import { ProductCard } from '../components/ProductCard'

export function ShopPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { language, t, showToast } = useApp()
    const { user } = useAuth()
    const { requireAuth } = useRequireAuth()

    const [shop, setShop] = useState<Shop | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Check if current user owns this shop
    const isOwner = user && shop && user.id === shop.user_id

    useEffect(() => {
        if (slug) {
            fetchShop()
        }
    }, [slug])

    const fetchShop = async () => {
        setLoading(true)
        try {
            const shopData = await getShopBySlug(slug!)
            if (!shopData) {
                navigate('/')
                return
            }
            setShop(shopData)

            // Fetch shop products
            const shopProducts = await getShopProducts(shopData.user_id)
            setProducts(shopProducts)
        } catch (error) {
            console.error('Error fetching shop:', error)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleCall = () => {
        if (!requireAuth()) return
        if (shop?.owner?.phone) {
            window.open(`tel:${shop.owner.phone}`, '_self')
        }
    }

    const handleWhatsApp = () => {
        if (!requireAuth()) return
        if (shop?.owner?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मैंने आपकी दुकान "${shop.shop_name}" देखी।`
                : `Hi! I saw your shop "${shop.shop_name}".`
            window.open(`https://wa.me/91${shop.owner.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const handleShare = () => {
        const shopUrl = window.location.href
        const message = language === 'hi'
            ? `🏪 ${shop?.shop_name}\n📍 ${shop?.location || 'स्थान उपलब्ध नहीं'}\n\n👉 ${shopUrl}`
            : `🏪 ${shop?.shop_name}\n📍 ${shop?.location || 'Location not available'}\n\n👉 ${shopUrl}`

        if (navigator.share) {
            navigator.share({
                title: shop?.shop_name,
                text: message,
                url: shopUrl
            }).catch(() => {
                // Fallback to WhatsApp
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
            })
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        showToast(t('shop_link_copied'))
    }

    if (loading) {
        return (
            <div className="app">
                <Header title={language === 'hi' ? 'दुकान' : 'Shop'} showBack />
                <div className="page">
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="app">
                <Header title={language === 'hi' ? 'दुकान' : 'Shop'} showBack />
                <div className="page">
                    <div className="empty-state">
                        <div className="icon">❌</div>
                        <p>{language === 'hi' ? 'दुकान नहीं मिली' : 'Shop not found'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Header title={shop.shop_name} showBack />

            <div className="page">
                {/* Shop Header Card */}
                <div className="card mb-lg" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 40 }}>🏪</span>
                            <div>
                                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                                    {shop.shop_name}
                                </h1>
                                <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>
                                    {shop.owner?.name || (language === 'hi' ? 'दुकानदार' : 'Shopkeeper')}
                                </p>
                            </div>
                        </div>

                        {shop.description && (
                            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
                                {shop.description}
                            </p>
                        )}

                        {shop.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                <span>📍</span>
                                <span>{shop.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {shop.owner?.phone && (
                        <>
                            <button
                                onClick={handleCall}
                                className="btn btn-success"
                                style={{ flex: 1 }}
                            >
                                📞 {t('call')}
                            </button>
                            <button
                                onClick={handleWhatsApp}
                                className="btn btn-whatsapp"
                                style={{ flex: 1 }}
                            >
                                💬 WhatsApp
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleShare}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        📤
                    </button>
                </div>

                {/* Copy Link Button */}
                <button
                    onClick={copyLink}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 10,
                        border: '2px dashed #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        fontSize: 13,
                        cursor: 'pointer',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}
                >
                    🔗 {language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}
                </button>

                {/* Edit Shop Button (for owner) */}
                {isOwner && (
                    <button
                        onClick={() => navigate('/shop-settings')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginBottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        ✏️ {t('edit_shop')}
                    </button>
                )}

                {/* Products Section */}
                <div className="section-title" style={{ marginBottom: 12 }}>
                    📦 {t('all_products')} ({products.length})
                </div>

                {products.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 12
                    }}>
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="icon">📦</div>
                        <p>{t('no_shop_products')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
