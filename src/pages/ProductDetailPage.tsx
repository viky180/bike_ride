import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, Product } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { formatDistanceToNow } from 'date-fns'
import { hi } from 'date-fns/locale'
import { Header } from '../components/Header'

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { language, t } = useApp()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [showFullscreen, setShowFullscreen] = useState(false)

    useEffect(() => {
        if (id) {
            fetchProduct()
        }
    }, [id])

    const fetchProduct = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:users!seller_id(id, name, phone)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProduct(data)
        } catch (error) {
            console.error('Error fetching product:', error)
            navigate('/produce')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="app">
                <Header title={language === 'hi' ? 'उत्पाद विवरण' : 'Product Details'} showBack />
                <div className="page">
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="app">
                <Header title={language === 'hi' ? 'उत्पाद विवरण' : 'Product Details'} showBack />
                <div className="page">
                    <div className="empty-state">
                        <div className="icon">❌</div>
                        <p>{language === 'hi' ? 'उत्पाद नहीं मिला' : 'Product not found'}</p>
                    </div>
                </div>
            </div>
        )
    }

    const category = getCategory(product.category)
    const timeAgo = formatDistanceToNow(new Date(product.created_at), {
        addSuffix: true,
        locale: language === 'hi' ? hi : undefined
    })

    const images = product.image_urls || []
    const hasImages = images.length > 0

    const handleCall = () => {
        if (product.seller?.phone) {
            window.open(`tel:${product.seller.phone}`, '_self')
        }
    }

    const handleWhatsApp = () => {
        if (product.seller?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मुझे आपका ${product.name} (${product.quantity}) चाहिए।`
                : `Hi! I'm interested in your ${product.name} (${product.quantity}).`
            window.open(`https://wa.me/91${product.seller.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="app">
            <Header title={language === 'hi' ? 'उत्पाद विवरण' : 'Product Details'} showBack />

            <div className="page">
                {/* Image Gallery */}
                {hasImages ? (
                    <div className="product-gallery">
                        <div
                            className="product-gallery-main"
                            onClick={() => setShowFullscreen(true)}
                        >
                            <img
                                src={images[selectedImageIndex]}
                                alt={`${product.name} - Photo ${selectedImageIndex + 1}`}
                            />
                            {images.length > 1 && (
                                <>
                                    <button className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
                                    <button className="gallery-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
                                </>
                            )}
                            <div className="gallery-counter">
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                            <div className="gallery-zoom-hint">
                                {language === 'hi' ? '🔍 बड़ा करने के लिए टैप करें' : '🔍 Tap to enlarge'}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="product-gallery-thumbs">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`gallery-thumb ${index === selectedImageIndex ? 'active' : ''}`}
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="product-no-image">
                        <span className="icon">{category?.icon || '📦'}</span>
                        <span>{language === 'hi' ? 'कोई फोटो नहीं' : 'No photos'}</span>
                    </div>
                )}

                {/* Product Info Card */}
                <div className="card mb-lg">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                        <span style={{ fontSize: 32 }}>{category?.icon || '📦'}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 20 }}>{product.name}</div>
                            <div style={{ color: 'var(--color-text-light)' }}>
                                {language === 'hi' ? category?.hi : category?.en}
                            </div>
                        </div>
                        {product.status === 'sold' && (
                            <span className="badge badge-pending">{language === 'hi' ? 'बिक गया' : 'Sold'}</span>
                        )}
                    </div>

                    <div className="product-details">
                        <div className="product-quantity">
                            <span className="icon">📦</span>
                            <span>{product.quantity}</span>
                        </div>
                        <div className="product-price">
                            ₹{product.price}
                        </div>
                    </div>
                </div>

                {/* Pharmacy-specific: Discount Badge */}
                {product.category === 'pharmacy' && product.discount_percent && (
                    <div className="card mb-lg" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 32 }}>🏷️</span>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                                    {product.discount_percent} {language === 'hi' ? 'छूट' : 'OFF'}
                                </div>
                                <div style={{ color: '#b91c1c', fontSize: 14 }}>
                                    {language === 'hi' ? 'सभी दवाइयों पर' : 'On all medicines'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pharmacy-specific: Medicines List */}
                {product.category === 'pharmacy' && product.medicines && product.medicines.length > 0 && (
                    <div className="card mb-lg">
                        <div className="section-title" style={{ marginBottom: 12 }}>
                            💊 {language === 'hi' ? 'उपलब्ध दवाइयाँ' : 'Available Medicines'} ({product.medicines.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {product.medicines.map((medicine, index) => (
                                <span
                                    key={index}
                                    style={{
                                        padding: '6px 12px',
                                        background: '#dbeafe',
                                        color: '#1d4ed8',
                                        borderRadius: 16,
                                        fontSize: 13,
                                        fontWeight: 500
                                    }}
                                >
                                    {medicine}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Seller Info */}
                <div className="card mb-lg">
                    <div className="section-title" style={{ marginBottom: 12 }}>
                        {language === 'hi' ? '👤 विक्रेता की जानकारी' : '👤 Seller Information'}
                    </div>
                    <div className="product-seller" style={{ marginBottom: 0 }}>
                        <div className="seller-info">
                            <span className="icon">👤</span>
                            <span style={{ fontWeight: 600 }}>{product.seller?.name || (language === 'hi' ? 'विक्रेता' : 'Seller')}</span>
                        </div>
                        {product.location && (
                            <div className="seller-location">
                                <span className="icon">📍</span>
                                <span>{product.location}</span>
                            </div>
                        )}
                        <div className="product-time">{timeAgo}</div>
                    </div>
                </div>

                {/* Contact Actions */}
                {product.status === 'available' && product.seller?.phone && (
                    <div className="product-actions">
                        <button
                            className="btn btn-success"
                            onClick={handleCall}
                            style={{ flex: 1 }}
                        >
                            📞 {t('call')}
                        </button>
                        <button
                            className="btn btn-whatsapp"
                            onClick={handleWhatsApp}
                            style={{ flex: 1 }}
                        >
                            💬 WhatsApp
                        </button>
                    </div>
                )}
            </div>

            {/* Fullscreen Image Modal */}
            {showFullscreen && hasImages && (
                <div className="fullscreen-modal" onClick={() => setShowFullscreen(false)}>
                    <button className="fullscreen-close">✕</button>
                    <img
                        src={images[selectedImageIndex]}
                        alt={`${product.name} - Full view`}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <>
                            <button className="fullscreen-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
                            <button className="fullscreen-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
                        </>
                    )}
                    <div className="fullscreen-counter">
                        {selectedImageIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    )
}
