import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { supabase, Product, deleteImageFromStorage, uploadProductImage, updateProductImages } from '../lib/supabase'
import { getCategory } from '../lib/categories'
import { formatDistanceToNow } from 'date-fns'
import { hi } from 'date-fns/locale'
import { Header } from '../components/Header'
import { ReportButton } from '../components/ReportButton'

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { language, t, showToast } = useApp()
    const { user } = useAuth()
    const { requireAuth } = useRequireAuth()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [showFullscreen, setShowFullscreen] = useState(false)

    // Image editing state
    const [isEditingImages, setIsEditingImages] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isDeletingImage, setIsDeletingImage] = useState(false)

    // Check if current user is the product owner
    const isOwner = user && product && user.id === product.seller_id

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
        // Check if user is authenticated before allowing call
        if (!requireAuth()) return

        if (product.seller?.phone) {
            window.open(`tel:${product.seller.phone}`, '_self')
        }
    }

    const handleWhatsApp = () => {
        // Check if user is authenticated before allowing WhatsApp
        if (!requireAuth()) return

        if (product.seller?.phone) {
            const message = language === 'hi'
                ? `नमस्ते! मुझे आपका ${product.name} (${product.quantity}) चाहिए।`
                : `Hi! I'm interested in your ${product.name} (${product.quantity}).`
            window.open(`https://wa.me/91${product.seller.phone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    const handleShareWhatsApp = () => {
        const productUrl = window.location.href
        const message = language === 'hi'
            ? `🛒 देखो मुझे यह मिला!\n\n📦 ${product.name}\n💰 ₹${product.price}\n📍 ${product.location || 'स्थान उपलब्ध नहीं'}\n\n👉 ${productUrl}`
            : `🛒 Check out this product!\n\n📦 ${product.name}\n💰 ₹${product.price}\n📍 ${product.location || 'Location not available'}\n\n👉 ${productUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Image management handlers
    const handleDeleteImage = async (imageUrl: string, index: number) => {
        if (!product || !id) return

        const confirmMsg = language === 'hi'
            ? 'क्या आप इस फोटो को हटाना चाहते हैं?'
            : 'Delete this image?'

        if (!window.confirm(confirmMsg)) return

        setIsDeletingImage(true)
        try {
            // Delete from storage
            await deleteImageFromStorage(imageUrl)

            // Update product with remaining images (with ownership verification)
            const newImageUrls = images.filter((_, i) => i !== index)
            const success = await updateProductImages(id, newImageUrls, user!.id)

            if (success) {
                // Update local state
                setProduct(prev => prev ? { ...prev, image_urls: newImageUrls } : null)
                // Adjust selected index if needed
                if (selectedImageIndex >= newImageUrls.length) {
                    setSelectedImageIndex(Math.max(0, newImageUrls.length - 1))
                }
                showToast(language === 'hi' ? 'फोटो हटा दी गई' : 'Image deleted')
            } else {
                showToast(language === 'hi' ? 'फोटो हटाने में त्रुटि' : 'Error deleting image')
            }
        } catch (error) {
            console.error('Error deleting image:', error)
            showToast(language === 'hi' ? 'फोटो हटाने में त्रुटि' : 'Error deleting image')
        } finally {
            setIsDeletingImage(false)
        }
    }

    const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!product || !user || !id) return

        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast(language === 'hi' ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please select an image file')
            return
        }

        // Check max images (limit to 5)
        if (images.length >= 5) {
            showToast(language === 'hi' ? 'अधिकतम 5 फोटो की अनुमति है' : 'Maximum 5 images allowed')
            return
        }

        setIsUploadingImage(true)
        try {
            const imageUrl = await uploadProductImage(user.id, file)

            if (imageUrl) {
                const newImageUrls = [...images, imageUrl]
                const success = await updateProductImages(id, newImageUrls, user.id)

                if (success) {
                    setProduct(prev => prev ? { ...prev, image_urls: newImageUrls } : null)
                    showToast(language === 'hi' ? 'फोटो जोड़ी गई' : 'Image added')
                } else {
                    showToast(language === 'hi' ? 'फोटो जोड़ने में त्रुटि' : 'Error adding image')
                }
            } else {
                showToast(language === 'hi' ? 'फोटो अपलोड में त्रुटि' : 'Error uploading image')
            }
        } catch (error) {
            console.error('Error adding image:', error)
            showToast(language === 'hi' ? 'फोटो जोड़ने में त्रुटि' : 'Error adding image')
        } finally {
            setIsUploadingImage(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="app">
            <Header title={language === 'hi' ? 'उत्पाद विवरण' : 'Product Details'} showBack />

            <div className="page" style={{ position: 'relative' }}>
                {/* WhatsApp Share Button - Top Right Corner */}
                <button
                    onClick={handleShareWhatsApp}
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        borderRadius: 12,
                        border: 'none',
                        background: '#25D366',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    className="whatsapp-share-btn"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>
                        {language === 'hi' ? 'शेयर' : 'Share'}
                    </span>
                </button>

                {/* Image Gallery */}
                {hasImages ? (
                    <div className="product-gallery">
                        <div
                            className="product-gallery-main"
                            onClick={() => !isEditingImages && setShowFullscreen(true)}
                        >
                            <img
                                src={images[selectedImageIndex]}
                                alt={`${product.name} - Photo ${selectedImageIndex + 1}`}
                            />
                            {images.length > 1 && !isEditingImages && (
                                <>
                                    <button className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
                                    <button className="gallery-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
                                </>
                            )}
                            <div className="gallery-counter">
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                            {!isEditingImages && (
                                <div className="gallery-zoom-hint">
                                    {language === 'hi' ? '🔍 बड़ा करने के लिए टैप करें' : '🔍 Tap to enlarge'}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails with delete option in edit mode */}
                        <div className="product-gallery-thumbs" style={{ flexWrap: 'wrap' }}>
                            {images.map((img, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <button
                                        className={`gallery-thumb ${index === selectedImageIndex ? 'active' : ''}`}
                                        onClick={() => setSelectedImageIndex(index)}
                                        disabled={isDeletingImage}
                                    >
                                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                                    </button>
                                    {/* Delete button overlay in edit mode */}
                                    {isEditingImages && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteImage(img, index)
                                            }}
                                            disabled={isDeletingImage}
                                            style={{
                                                position: 'absolute',
                                                top: -6,
                                                right: -6,
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                cursor: isDeletingImage ? 'wait' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                zIndex: 10
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Add Image button in edit mode */}
                            {isEditingImages && images.length < 5 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingImage}
                                    className="gallery-thumb"
                                    style={{
                                        background: '#f1f5f9',
                                        border: '2px dashed #94a3b8',
                                        cursor: isUploadingImage ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {isUploadingImage ? (
                                        <span style={{ fontSize: 16 }}>⏳</span>
                                    ) : (
                                        <span style={{ fontSize: 20, color: '#64748b' }}>+</span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Edit Images Button for Owner */}
                        {isOwner && (
                            <button
                                onClick={() => setIsEditingImages(!isEditingImages)}
                                style={{
                                    marginTop: 8,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: isEditingImages ? '#22c55e' : '#3b82f6',
                                    color: 'white',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    width: '100%'
                                }}
                            >
                                {isEditingImages ? (
                                    <>✓ {language === 'hi' ? 'संपादन समाप्त' : 'Done Editing'}</>
                                ) : (
                                    <>✏️ {language === 'hi' ? 'फोटो संपादित करें' : 'Edit Images'}</>
                                )}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="product-no-image">
                        <span className="icon">{category?.icon || '📦'}</span>
                        <span>{language === 'hi' ? 'कोई फोटो नहीं' : 'No photos'}</span>
                        {/* Add image button for owner when no images */}
                        {isOwner && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                style={{
                                    marginTop: 12,
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: isUploadingImage ? 'wait' : 'pointer'
                                }}
                            >
                                {isUploadingImage ? (
                                    <>{language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}</>
                                ) : (
                                    <>➕ {language === 'hi' ? 'फोटो जोड़ें' : 'Add Photo'}</>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Hidden file input for image upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAddImage}
                    style={{ display: 'none' }}
                />

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

                {/* Report Button */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                    <ReportButton
                        targetType="product"
                        targetId={product.id}
                        targetName={product.name}
                    />
                </div>
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
