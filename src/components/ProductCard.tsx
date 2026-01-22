import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Product } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { getDefaultImageForProduct } from '../lib/defaultImages'

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
    onMarkSold,
    onDelete,
    clickable = true
}: ProductCardProps) {
    const { language, t } = useApp()
    const navigate = useNavigate()
    const category = getCategory(product.category)

    // Get first image from array, fallback to default sub-category or category image
    const productImage = product.image_urls?.length > 0 ? product.image_urls[0] : null
    const defaultImage = getDefaultImageForProduct(product.category, product.name)
    const firstImage = productImage || defaultImage

    // Determine condition based on category (agriculture = fresh, others = could be used)
    const isAgriCategory = ['vegetables', 'fruits', 'grains', 'dairy', 'livestock'].includes(product.category)
    const conditionLabel = isAgriCategory
        ? (language === 'hi' ? 'ताज़ा' : 'Fresh')
        : (language === 'hi' ? 'नया' : 'New')

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

    // Note: WhatsApp is handled on the detail page now

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
            onClick={handleCardClick}
            style={{
                background: '#ffffff',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            className="product-card-modern"
        >
            {/* Image Section */}
            <div style={{
                position: 'relative',
                aspectRatio: '1/1',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {firstImage ? (
                    <img
                        src={firstImage}
                        alt={product.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        loading="lazy"
                    />
                ) : (
                    <span style={{ fontSize: 32, opacity: 0.5 }}>
                        {category?.icon || '📦'}
                    </span>
                )}

                {/* Condition Badge */}
                <span style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    padding: '2px 6px',
                    borderRadius: 8,
                    background: isAgriCategory ? '#dcfce7' : '#dbeafe',
                    color: isAgriCategory ? '#16a34a' : '#1d4ed8',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 0.2
                }}>
                    {conditionLabel}
                </span>

                {/* Sold badge */}
                {product.status === 'sold' && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{
                            padding: '8px 16px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 14
                        }}>
                            {language === 'hi' ? 'बिक गया' : 'SOLD'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div style={{ padding: 8 }}>
                {/* Product Name */}
                <h3 style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#1f2937',
                    marginBottom: 2,
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.name}
                </h3>

                {/* Price or Discount for pharmacy */}
                {product.category === 'pharmacy' && product.discount_percent ? (
                    <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#dc2626',
                        background: '#fef2f2',
                        padding: '1px 4px',
                        borderRadius: 4,
                    }}>
                        {product.discount_percent}% OFF
                    </span>
                ) : (
                    <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#059669',
                    }}>
                        ₹{product.price}
                    </span>
                )}

                {/* Call button for all products */}
                {product.seller?.phone && product.status === 'available' && (
                    <button
                        onClick={handleCall}
                        style={{
                            width: '100%',
                            marginTop: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#22c55e',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3
                        }}
                    >
                        📞 {language === 'hi' ? 'कॉल करें' : 'Call'}
                    </button>
                )}
            </div>

            {/* Owner actions (for My Products page) */}
            {onMarkSold && onDelete && product.status === 'available' && (
                <div style={{ display: 'flex', gap: 8, padding: 8 }}>
                    {/* Edit Photos button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/edit-product/${product.id}`)
                        }}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '2px solid #dbeafe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        📷
                    </button>
                    <button
                        onClick={handleMarkSold}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '2px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        ✓ {t('mark_sold')}
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: 13,
                            cursor: 'pointer'
                        }}
                    >
                        🗑️
                    </button>
                </div>
            )}

            {/* Hover effect CSS */}
            <style>{`
                .product-card-modern:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
                }
                .product-card-modern:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    )
}
