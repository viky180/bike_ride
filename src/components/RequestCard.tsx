import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ProductRequest } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { getDefaultImageForProduct } from '../lib/defaultImages'
import { formatDistanceToNow } from 'date-fns'
import { hi } from 'date-fns/locale'
import { ReportButton } from './ReportButton'

interface RequestCardProps {
    request: ProductRequest
    showDelete?: boolean
    onDelete?: () => void
}

export function RequestCard({ request, showDelete, onDelete }: RequestCardProps) {
    const { language } = useApp()
    const [expanded, setExpanded] = useState(false)
    const category = getCategory(request.category)

    const timeAgo = formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: language === 'hi' ? hi : undefined
    })

    // Get default image for the requested product
    const defaultImage = getDefaultImageForProduct(request.category, request.product_name)

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (request.buyer?.phone) {
            window.open(`tel:${request.buyer.phone}`, '_self')
        }
    }

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (request.buyer?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मेरे पास ${request.product_name} है। क्या आप अभी भी खरीदना चाहते हैं?`
                : `Hi! I have ${request.product_name} available. Are you still looking to buy?`
            window.open(`https://wa.me/91${request.buyer.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const handleShareWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation()
        const message = language === 'hi'
            ? `🔍 कोई "${request.product_name}" खोज रहा है!\n\n📦 मात्रा: ${request.quantity || 'उल्लेख नहीं'}\n💰 बजट: ${request.expected_price ? `₹${request.expected_price}` : 'उल्लेख नहीं'}\n📍 स्थान: ${request.location || 'उल्लेख नहीं'}\n\nअगर आपके पास है तो संपर्क करें!`
            : `🔍 Someone is looking for "${request.product_name}"!\n\n📦 Quantity: ${request.quantity || 'Not specified'}\n💰 Budget: ${request.expected_price ? `₹${request.expected_price}` : 'Not specified'}\n📍 Location: ${request.location || 'Not specified'}\n\nContact if you have it!`
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            style={{
                background: '#ffffff',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            className="request-card-modern"
        >
            {/* Image Section */}
            <div style={{
                position: 'relative',
                aspectRatio: '1/1',
                background: category?.color ? `${category.color}15` : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {defaultImage ? (
                    <img
                        src={defaultImage}
                        alt={request.product_name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        loading="lazy"
                    />
                ) : (
                    <span style={{ fontSize: 48, opacity: 0.7 }}>
                        {category?.icon || '📦'}
                    </span>
                )}

                {/* "Looking For" Badge */}
                <span style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    padding: '2px 6px',
                    borderRadius: 8,
                    background: '#fef3c7',
                    color: '#d97706',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    🔍 {language === 'hi' ? 'चाहिए' : 'WANTED'}
                </span>

                {/* Time badge */}
                <span style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    padding: '2px 6px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    fontSize: 8,
                    fontWeight: 500,
                }}>
                    {timeAgo}
                </span>

                {/* WhatsApp Share Button - Top Right Corner */}
                <button
                    onClick={handleShareWhatsApp}
                    style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 6px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#25D366',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37, 211, 102, 0.4)',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span style={{ fontSize: 7, fontWeight: 600, marginTop: 1 }}>
                        {language === 'hi' ? 'शेयर' : 'Share'}
                    </span>
                </button>
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
                    {request.product_name}
                </h3>

                {/* Quantity & Price Info */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    marginBottom: 4,
                    fontSize: 10,
                    color: '#64748b'
                }}>
                    {request.quantity && (
                        <span style={{
                            background: '#f1f5f9',
                            padding: '1px 4px',
                            borderRadius: 4
                        }}>
                            📦 {request.quantity}
                        </span>
                    )}
                    {request.expected_price && (
                        <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#059669',
                        }}>
                            💰 ₹{request.expected_price}
                        </span>
                    )}
                </div>

                {/* Location */}
                {request.location && (
                    <div style={{
                        fontSize: 9,
                        color: '#94a3b8',
                        marginBottom: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        📍 {request.location}
                    </div>
                )}

                {/* Contact button - always visible */}
                {request.buyer?.phone && (
                    <button
                        onClick={handleCall}
                        style={{
                            width: '100%',
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
                        📞 {language === 'hi' ? 'संपर्क करें' : 'Contact'}
                    </button>
                )}
            </div>

            {/* Expanded: Additional Contact Options */}
            {expanded && request.buyer && (
                <div style={{
                    padding: '8px',
                    borderTop: '1px solid #f1f5f9',
                    background: '#fafafa'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 8,
                        fontSize: 12,
                        color: '#475569'
                    }}>
                        <span>👤</span>
                        <span style={{ fontWeight: 500 }}>{request.buyer.name}</span>
                    </div>
                    <button
                        onClick={handleWhatsApp}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#25D366',
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                        }}
                    >
                        💬 WhatsApp
                    </button>
                    {/* Report Button */}
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <ReportButton
                            targetType="request"
                            targetId={request.id}
                            targetName={request.product_name}
                            compact
                        />
                        {showDelete && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (window.confirm(language === 'hi' ? 'क्या आप इस अनुरोध को हटाना चाहते हैं?' : 'Delete this request?')) {
                                        onDelete()
                                    }
                                }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                🗑️ {language === 'hi' ? 'हटाएं' : 'Delete'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Hover effect CSS */}
            <style>{`
                .request-card-modern:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
                }
                .request-card-modern:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    )
}
