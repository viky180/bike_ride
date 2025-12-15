import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ProductRequest } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { formatDistanceToNow } from 'date-fns'
import { hi } from 'date-fns/locale'

interface RequestCardProps {
    request: ProductRequest
}

export function RequestCard({ request }: RequestCardProps) {
    const { language, t } = useApp()
    const [expanded, setExpanded] = useState(false)
    const category = getCategory(request.category)

    const timeAgo = formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: language === 'hi' ? hi : undefined
    })

    const handleCall = () => {
        if (request.buyer?.phone) {
            window.open(`tel:${request.buyer.phone}`, '_self')
        }
    }

    const handleWhatsApp = () => {
        if (request.buyer?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मेरे पास ${request.product_name} है। क्या आप अभी भी खरीदना चाहते हैं?`
                : `Hi! I have ${request.product_name} available. Are you still looking to buy?`
            window.open(`https://wa.me/91${request.buyer.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    return (
        <div className="request-card" onClick={() => setExpanded(!expanded)}>
            {/* Header */}
            <div className="request-header">
                <span className="request-icon" style={{ background: `${category?.color}20` }}>
                    {category?.icon || '📦'}
                </span>
                <div className="request-info">
                    <div className="request-product">{request.product_name}</div>
                    <div className="request-meta">
                        {request.quantity && <span>📦 {request.quantity}</span>}
                        {request.expected_price && <span>💰 ₹{request.expected_price}</span>}
                    </div>
                </div>
            </div>

            {/* Location and time */}
            <div className="request-footer">
                {request.location && (
                    <span className="request-location">📍 {request.location}</span>
                )}
                <span className="request-time">{timeAgo}</span>
            </div>

            {/* Expanded: Contact buttons */}
            {expanded && request.buyer && (
                <div className="request-contact">
                    <div className="request-buyer">
                        <span>👤</span>
                        <span>{request.buyer.name}</span>
                    </div>
                    <div className="product-actions">
                        <button
                            className="btn btn-success"
                            onClick={(e) => { e.stopPropagation(); handleCall(); }}
                            style={{ flex: 1 }}
                        >
                            📞 {t('call')}
                        </button>
                        <button
                            className="btn btn-whatsapp"
                            onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
                            style={{ flex: 1 }}
                        >
                            💬 WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
