import { useApp } from '../context/AppContext'
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
}

export function ProductCard({
    product,
    onCall,
    onWhatsApp,
    showActions = true,
    onMarkSold,
    onDelete
}: ProductCardProps) {
    const { language, t } = useApp()
    const category = getCategory(product.category)

    const timeAgo = formatDistanceToNow(new Date(product.created_at), {
        addSuffix: true,
        locale: language === 'hi' ? hi : undefined
    })

    const handleCall = () => {
        if (product.seller?.phone) {
            window.open(`tel:${product.seller.phone}`, '_self')
        }
        onCall?.()
    }

    const handleWhatsApp = () => {
        if (product.seller?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मुझे आपका ${product.name} (${product.quantity}) चाहिए।`
                : `Hi! I'm interested in your ${product.name} (${product.quantity}).`
            window.open(`https://wa.me/91${product.seller.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
        onWhatsApp?.()
    }

    return (
        <div className="product-card">
            {/* Category & Name */}
            <div className="product-header">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                    />
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
                        onClick={onMarkSold}
                        style={{ flex: 1 }}
                    >
                        ✓ {t('mark_sold')}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={onDelete}
                        style={{ flex: 0, padding: '12px 16px' }}
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    )
}
