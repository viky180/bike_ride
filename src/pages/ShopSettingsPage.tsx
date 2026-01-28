import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { Shop, ProductCategory, getShopByUserId, updateShop, createShop } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { Header } from '../components/Header'
import { PincodeInput } from '../components/PincodeInput'

export function ShopSettingsPage() {
    const navigate = useNavigate()
    const { language, t, showToast } = useApp()
    const { user, setUser } = useAuth()
    const { requireAuth } = useRequireAuth()

    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Form fields
    const [shopName, setShopName] = useState('')
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')

    useEffect(() => {
        if (!requireAuth()) return
        fetchShop()
    }, [user])

    const fetchShop = async () => {
        if (!user) return
        setLoading(true)
        try {
            const shopData = await getShopByUserId(user.id)
            if (shopData) {
                setShop(shopData)
                setShopName(shopData.shop_name)
                setCategory(shopData.category)
                setDescription(shopData.description || '')
                setLocation(shopData.location || '')
                setPincode(shopData.pincode || '')
            } else {
                // User doesn't have a shop yet, show create form
                setIsCreating(true)
            }
        } catch (error) {
            console.error('Error fetching shop:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user) return
        if (!shopName.trim()) {
            showToast(language === 'hi' ? 'दुकान का नाम आवश्यक है' : 'Shop name is required')
            return
        }

        setSaving(true)
        try {
            if (isCreating) {
                // Create new shop
                const newShop = await createShop(
                    user.id,
                    shopName.trim(),
                    user.phone,
                    description.trim() || undefined,
                    location.trim() || undefined,
                    pincode.trim() || undefined,
                    category || undefined
                )

                if (newShop) {
                    setShop(newShop)
                    setIsCreating(false)
                    // Update user context with new seller_type
                    if (user) {
                        setUser({ ...user, seller_type: 'shopkeeper' })
                    }
                    showToast(t('shop_created'))
                } else {
                    showToast(language === 'hi' ? 'दुकान बनाने में त्रुटि' : 'Error creating shop')
                }
            } else if (shop) {
                // Update existing shop
                const success = await updateShop(shop.id, user.id, {
                    shop_name: shopName.trim(),
                    category: category,
                    description: description.trim() || null,
                    location: location.trim() || null,
                    pincode: pincode.trim() || null
                })

                if (success) {
                    showToast(t('shop_updated'))
                    // Refetch to get updated data
                    await fetchShop()
                    setIsEditing(false) // Switch back to view mode
                } else {
                    showToast(language === 'hi' ? 'त्रुटि' : 'Error updating shop')
                }
            }
        } catch (error) {
            console.error('Error saving shop:', error)
            showToast(language === 'hi' ? 'त्रुटि' : 'Error')
        } finally {
            setSaving(false)
        }
    }

    const copyLink = () => {
        if (shop) {
            const shopUrl = `${window.location.origin}/shop/${shop.shop_slug}`
            navigator.clipboard.writeText(shopUrl)
            showToast(t('shop_link_copied'))
        }
    }

    const handleShareWhatsApp = () => {
        if (!shop) return
        const shopUrl = `${window.location.origin}/shop/${shop.shop_slug}`
        const message = language === 'hi'
            ? `🏪 ${shop.shop_name}\n📍 ${shop.location || 'स्थान'}\n\n👉 ${shopUrl}`
            : `🏪 ${shop.shop_name}\n📍 ${shop.location || 'Location'}\n\n👉 ${shopUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }

    if (loading) {
        return (
            <div className="app">
                <Header
                    title={language === 'hi' ? 'दुकान सेटिंग्स' : 'Shop Settings'}
                    showBack
                />
                <div className="page">
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Header
                title={isCreating
                    ? (language === 'hi' ? 'दुकान बनाएं' : 'Create Shop')
                    : (language === 'hi' ? 'दुकान सेटिंग्स' : 'Shop Settings')
                }
                showBack
            />

            <div className="page">
                {/* Info Banner for Create Mode */}
                {isCreating && (
                    <div className="card mb-lg" style={{
                        background: '#fef3c7',
                        borderColor: '#f59e0b'
                    }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>ℹ️</span>
                            <div>
                                <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
                                    {t('shopkeeper_note')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shop View Mode - Show saved information */}
                {shop && !isCreating && !isEditing && (
                    <div className="card mb-lg">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div className="section-title" style={{ margin: 0 }}>
                                🏪 {language === 'hi' ? 'दुकान की जानकारी' : 'Shop Information'}
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: '2px solid #3b82f6',
                                    background: 'white',
                                    color: '#3b82f6',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ✏️ {language === 'hi' ? 'संपादित करें' : 'Edit'}
                            </button>
                        </div>

                        {/* Shop Name */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                {t('shop_name')}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>
                                {shop.shop_name}
                            </div>
                        </div>

                        {/* Shop Category */}
                        {shop.category && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                    🏷️ {language === 'hi' ? 'दुकान श्रेणी' : 'Shop Category'}
                                </div>
                                <div style={{ fontSize: 14, color: '#1f2937' }}>
                                    {(() => {
                                        const cat = CATEGORIES.find(c => c.id === shop.category)
                                        return cat ? `${cat.icon} ${language === 'hi' ? cat.hi : cat.en}` : shop.category
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {shop.description && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                    {t('shop_description')}
                                </div>
                                <div style={{ fontSize: 14, color: '#1f2937' }}>
                                    {shop.description}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {shop.location && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                    📍 {t('your_location')}
                                </div>
                                <div style={{ fontSize: 14, color: '#1f2937' }}>
                                    {shop.location}
                                </div>
                            </div>
                        )}

                        {/* Pincode */}
                        {shop.pincode && (
                            <div style={{ marginBottom: 0 }}>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                    📮 {language === 'hi' ? 'पिनकोड' : 'Pincode'}
                                </div>
                                <div style={{ fontSize: 14, color: '#1f2937' }}>
                                    {shop.pincode}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Shop Form - Edit/Create Mode */}
                {(isCreating || isEditing) && (
                    <div className="card mb-lg">
                        <div className="section-title" style={{ marginBottom: 16 }}>
                            🏪 {isCreating ? t('create_shop') : t('edit_shop')}
                        </div>

                        {/* Shop Name */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6
                            }}>
                                {t('shop_name')} *
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder={language === 'hi' ? 'जैसे: रमेश किराना स्टोर' : 'e.g., Ramesh Grocery Store'}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '2px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Shop Category */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6
                            }}>
                                🏷️ {language === 'hi' ? 'दुकान श्रेणी' : 'Shop Category'}
                            </label>
                            <select
                                value={category || ''}
                                onChange={(e) => setCategory(e.target.value as ProductCategory || null)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '2px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">
                                    {language === 'hi' ? 'श्रेणी चुनें (वैकल्पिक)' : 'Select category (optional)'}
                                </option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {language === 'hi' ? cat.hi : cat.en}
                                    </option>
                                ))}
                            </select>
                            <p style={{
                                fontSize: 12,
                                color: '#6b7280',
                                marginTop: 4,
                                margin: '4px 0 0 0'
                            }}>
                                {language === 'hi'
                                    ? 'उत्पाद लिस्ट करते समय यह श्रेणी स्वतः चुनी जाएगी'
                                    : 'This category will be auto-selected when listing products'}
                            </p>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6
                            }}>
                                {t('shop_description')}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={language === 'hi' ? 'आपकी दुकान के बारे में कुछ बताएं...' : 'Tell something about your shop...'}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '2px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6
                            }}>
                                📍 {t('your_location')}
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={language === 'hi' ? 'गाँव/क्षेत्र का नाम' : 'Village/Area name'}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '2px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Pincode */}
                        <div style={{ marginBottom: 20 }}>
                            <PincodeInput
                                value={pincode}
                                onChange={setPincode}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        // Reset form to saved values
                                        if (shop) {
                                            setShopName(shop.shop_name)
                                            setCategory(shop.category)
                                            setDescription(shop.description || '')
                                            setLocation(shop.location || '')
                                            setPincode(shop.pincode || '')
                                        }
                                        setIsEditing(false)
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: 10,
                                        border: '2px solid #e2e8f0',
                                        background: 'white',
                                        color: '#475569',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving || !shopName.trim()}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    opacity: (saving || !shopName.trim()) ? 0.6 : 1
                                }}
                            >
                                {saving
                                    ? (language === 'hi' ? 'सहेज रहे हैं...' : 'Saving...')
                                    : (isCreating ? t('create_shop') : t('save'))
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Share Section - Only for existing shops */}
                {shop && !isCreating && (
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 12 }}>
                            🔗 {t('share_shop')}
                        </div>

                        {/* Shop Link Display */}
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            overflow: 'hidden'
                        }}>
                            <span style={{
                                flex: 1,
                                fontSize: 13,
                                color: '#3b82f6',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {window.location.origin}/shop/{shop.shop_slug}
                            </span>
                            <button
                                onClick={copyLink}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                📋 {language === 'hi' ? 'कॉपी' : 'Copy'}
                            </button>
                        </div>

                        {/* Share Buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleShareWhatsApp}
                                className="btn btn-whatsapp"
                                style={{ flex: 1 }}
                            >
                                💬 WhatsApp
                            </button>
                            <button
                                onClick={() => navigate(`/shop/${shop.shop_slug}`)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: 10,
                                    border: '2px solid #e2e8f0',
                                    background: 'white',
                                    color: '#475569',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                👁️ {t('view_shop')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
