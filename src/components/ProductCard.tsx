import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Product } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { formatDistanceToNow } from 'date-fns'
import { hi } from 'date-fns/locale'

interface ProductCardProps {
    product: Product
    onCall?: () => void
    onWhatsApp?: () => void
    showActions?: boolean
    onMarkSold?: () => void
    onDelete?: () => void
    clickable?: boolean
}

export function ProductCard({
    product,
    onCall,
    onWhatsApp,
    showActions = true,
    onMarkSold,
    onDelete,
    clickable = true
}: ProductCardProps) {
    const { language, t } = useApp()
    const navigate = useNavigate()
    const category = getCategory(product.category)

    const timeAgo = formatDistanceToNow(new Date(product.created_at), {
        addSuffix: true,
        locale: language === 'hi' ? hi : undefined
    })

    // Get first image from array (or undefined)
    const firstImage = product.image_urls?.length > 0 ? product.image_urls[0] : null
    const imageCount = product.image_urls?.length || 0

    const handleCardClick = () => {
        if (clickable) {
            navigate(`/product/${product.id}`)
        }
    }

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (product.seller?.phone) {
            window.open(`tel:${product.seller.phone}`, '_self')
        }
        onCall?.()
    }

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (product.seller?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मुझे आपका ${product.name} (${product.quantity}) चाहिए।`
                : `Hi! I'm interested in your ${product.name} (${product.quantity}).`
            window.open(`https://wa.me/91${product.seller.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
        onWhatsApp?.()
    }

    const handleMarkSold = (e: React.MouseEvent) => {
        e.stopPropagation()
        onMarkSold?.()
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete?.()
    }

    return (
        <div
            className={`product-card ${clickable ? 'clickable' : ''}`}
            onClick={handleCardClick}
        >
            {/* Category & Name */}
            <div className="product-header">
                {firstImage ? (
                    <div className="product-image-container">
                        <img
                            src={firstImage}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                        />
                        {imageCount > 1 && (
                            <span className="product-image-count">+{imageCount - 1}</span>
                        )}
                    </div>
                ) : (
                    <span className="product-icon" style={{ background: `${category?.color}20` }}>
                        {category?.icon || '📦'}
                    </span>
                )}
                <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-category">
                        {language === 'hi' ? category?.hi : category?.en}
                    </div>
                </div>
                {product.status === 'sold' && (
                    <span className="badge badge-pending">{language === 'hi' ? 'बिक गया' : 'Sold'}</span>
                )}
            </div>

            {/* Quantity & Price */}
            <div className="product-details">
                <div className="product-quantity">
                    <span className="icon">📦</span>
                    <span>{product.quantity}</span>
                </div>
                <div className="product-price">
                    ₹{product.price}
                </div>
            </div>

            {/* Seller info */}
            <div className="product-seller">
                <div className="seller-info">
                    <span className="icon">👤</span>
                    <span>{product.seller?.name || (language === 'hi' ? 'विक्रेता' : 'Seller')}</span>
                </div>
                {product.location && (
                    <div className="seller-location">
                        <span className="icon">📍</span>
                        <span>{product.location}</span>
                    </div>
                )}
                <div className="product-time">{timeAgo}</div>
            </div>

            {/* Tap hint for images */}
            {imageCount > 0 && clickable && (
                <div className="product-tap-hint">
                    {language === 'hi' ? '👆 फोटो देखने के लिए टैप करें' : '👆 Tap to view photos'}
                </div>
            )}

            {/* Action buttons */}
            {showActions && product.status === 'available' && product.seller?.phone && (
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

            {/* Owner actions (for My Products page) */}
            {onMarkSold && onDelete && product.status === 'available' && (
                <div className="product-actions">
                    <button
                        className="btn btn-outline"
                        onClick={handleMarkSold}
                        style={{ flex: 1 }}
                    >
                        ✓ {t('mark_sold')}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        style={{ flex: 0, padding: '12px 16px' }}
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    )
}
