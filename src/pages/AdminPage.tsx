/**
 * Secure Admin Page
 * 
 * Main admin panel with multi-section navigation, secure authentication,
 * and comprehensive management capabilities.
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useAdmin } from '../hooks/useAdmin'
import { AdminAuthGuard } from '../components/AdminAuthGuard'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { ProductManagement } from '../components/admin/ProductManagement'
import { UserManagement } from '../components/admin/UserManagement'
import { ReportManagement } from '../components/admin/ReportManagement'
import { Header } from '../components/Header'
import { CATEGORIES } from '../lib/categories'
import { POPULAR_PRODUCTS } from '../lib/popularProducts'
import { formatSessionTime } from '../lib/adminConfig'
import {
    getAllDefaultImages,
    getAllSubcategoryImages,
    setDefaultImage,
    setSubcategoryImage,
    removeDefaultImage,
    removeSubcategoryImage,
    loadDefaultImagesFromDB,
    isCacheLoaded
} from '../lib/defaultImages'
import { ProductCategory } from '../lib/supabase'

type AdminTab = 'dashboard' | 'products' | 'users' | 'reports' | 'categories' | 'subcategories'

function AdminVerifyScreen() {
    const { verifyAdminSession } = useAdmin()
    const { user } = useAuth()
    const [verifying, setVerifying] = useState(false)
    const navigate = useNavigate()

    const handleVerify = async () => {
        setVerifying(true)
        const success = await verifyAdminSession()
        setVerifying(false)

        if (!success) {
            alert('Failed to verify admin session')
        }
    }

    return (
        <div className="app">
            <div className="page" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: 24
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 20,
                    padding: 40,
                    textAlign: 'center',
                    maxWidth: 400,
                    width: '100%'
                }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
                    <h2 style={{ color: 'white', marginBottom: 8, fontSize: 24 }}>
                        Admin Verification Required
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: 24 }}>
                        Welcome back, <strong style={{ color: '#e2e8f0' }}>{user?.name}</strong>.
                        Please verify your identity to access the admin panel.
                    </p>

                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: 10,
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: verifying ? 'wait' : 'pointer',
                            opacity: verifying ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {verifying ? '⏳ Verifying...' : '✓ Verify & Continue'}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 10,
                            color: '#94a3b8',
                            fontSize: 14,
                            cursor: 'pointer',
                            marginTop: 12
                        }}
                    >
                        ← Go Back Home
                    </button>
                </div>
            </div>
        </div>
    )
}

function AdminPanelContent() {
    const { language } = useApp()
    const navigate = useNavigate()
    const { clearAdminSession, timeUntilExpiry, logAdminAction } = useAdmin()

    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
    const [defaultImages, setDefaultImagesState] = useState(getAllDefaultImages())
    const [subcategoryImages, setSubcategoryImagesState] = useState(getAllSubcategoryImages())
    const [uploading, setUploading] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('vegetables')
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    // Load images from database on mount
    useEffect(() => {
        const loadImages = async () => {
            if (!isCacheLoaded()) {
                await loadDefaultImagesFromDB()
            }
            setDefaultImagesState(getAllDefaultImages())
            setSubcategoryImagesState(getAllSubcategoryImages())
            setLoading(false)
        }
        loadImages()
    }, [])

    const handleLogout = async () => {
        await clearAdminSession()
        navigate('/')
    }

    const handleCategoryImageUpload = async (category: ProductCategory, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(category)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64 = event.target?.result as string
            const success = await setDefaultImage(category, base64)
            if (success) {
                setDefaultImagesState(prev => ({ ...prev, [category]: base64 }))
                await logAdminAction('upload_category_image', 'category', category, {})
            }
            setUploading(null)
        }
        reader.readAsDataURL(file)
        if (fileInputRefs.current[category]) fileInputRefs.current[category]!.value = ''
    }

    const handleSubcategoryImageUpload = async (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(name)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64 = event.target?.result as string
            const success = await setSubcategoryImage(name, base64)
            if (success) {
                setSubcategoryImagesState(prev => ({ ...prev, [name.toLowerCase()]: base64 }))
                await logAdminAction('upload_subcategory_image', 'subcategory', name, {})
            }
            setUploading(null)
        }
        reader.readAsDataURL(file)
        if (fileInputRefs.current[name]) fileInputRefs.current[name]!.value = ''
    }

    const handleRemoveCategoryImage = async (category: ProductCategory) => {
        const success = await removeDefaultImage(category)
        if (success) {
            setDefaultImagesState(prev => {
                const updated = { ...prev }
                delete updated[category]
                return updated
            })
            await logAdminAction('remove_category_image', 'category', category, {})
        }
    }

    const handleRemoveSubcategoryImage = async (name: string) => {
        const success = await removeSubcategoryImage(name)
        if (success) {
            setSubcategoryImagesState(prev => {
                const updated = { ...prev }
                delete updated[name.toLowerCase()]
                return updated
            })
            await logAdminAction('remove_subcategory_image', 'subcategory', name, {})
        }
    }

    const subcategories = POPULAR_PRODUCTS[selectedCategory] || []

    const tabs: { id: AdminTab; label: string; labelHi: string; icon: string }[] = [
        { id: 'dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: '📊' },
        { id: 'products', label: 'Products', labelHi: 'उत्पाद', icon: '📦' },
        { id: 'users', label: 'Users', labelHi: 'उपयोगकर्ता', icon: '👥' },
        { id: 'reports', label: 'Reports', labelHi: 'रिपोर्ट्स', icon: '🚩' },
        { id: 'subcategories', label: 'Sub-Cat', labelHi: 'उप-श्रेणी', icon: '🏷️' },
        { id: 'categories', label: 'Categories', labelHi: 'श्रेणियाँ', icon: '📁' },
    ]

    return (
        <div className="app">
            <Header
                title={language === 'hi' ? '🔐 एडमिन पैनल' : '🔐 Admin Panel'}
                showBack
                onBack={() => navigate('/')}
            />

            <div className="page" style={{ paddingBottom: 100 }}>
                {/* Session Info Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                    color: 'white'
                }}>
                    <div style={{ fontSize: 12 }}>
                        <span style={{ opacity: 0.7 }}>Session: </span>
                        <strong style={{ color: '#10b981' }}>
                            {timeUntilExpiry ? formatSessionTime(timeUntilExpiry) : 'Active'}
                        </strong>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 6,
                            color: '#fca5a5',
                            fontSize: 12,
                            cursor: 'pointer'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: 4,
                    overflowX: 'auto',
                    paddingBottom: 4,
                    marginBottom: 16
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: 'none',
                                background: activeTab === tab.id
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : '#f3f4f6',
                                color: activeTab === tab.id ? 'white' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: 11,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{language === 'hi' ? tab.labelHi : tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {loading && (activeTab === 'categories' || activeTab === 'subcategories') ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                        <p style={{ color: '#6b7280' }}>
                            {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && <AdminDashboard />}

                        {/* Products Tab */}
                        {activeTab === 'products' && <ProductManagement />}

                        {/* Users Tab */}
                        {activeTab === 'users' && <UserManagement />}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && <ReportManagement />}

                        {/* Sub-Categories Tab */}
                        {activeTab === 'subcategories' && (
                            <>
                                <div style={{
                                    background: '#dbeafe',
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 16
                                }}>
                                    <p style={{ fontSize: 12, color: '#1d4ed8' }}>
                                        {language === 'hi'
                                            ? 'गेहूँ, टमाटर, दूध जैसी वस्तुओं के लिए डिफ़ॉल्ट छवियाँ सेट करें।'
                                            : 'Set default images for items like Wheat, Tomato, Milk, etc.'}
                                    </p>
                                </div>

                                {/* Category Selector */}
                                <div style={{
                                    display: 'flex',
                                    gap: 6,
                                    overflowX: 'auto',
                                    paddingBottom: 12,
                                    marginBottom: 16
                                }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 20,
                                                border: selectedCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #e5e7eb',
                                                background: selectedCategory === cat.id ? `${cat.color}15` : 'white',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                color: selectedCategory === cat.id ? cat.color : '#6b7280'
                                            }}
                                        >
                                            {cat.icon} {language === 'hi' ? cat.hi : cat.en}
                                        </button>
                                    ))}
                                </div>

                                {/* Sub-category Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 12
                                }}>
                                    {subcategories.map(item => (
                                        <div
                                            key={item.name}
                                            style={{
                                                background: '#fff',
                                                borderRadius: 10,
                                                padding: 10,
                                                border: '1px solid #e5e7eb',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={el => fileInputRefs.current[item.name] = el}
                                                onChange={(e) => handleSubcategoryImageUpload(item.name, e)}
                                                style={{ display: 'none' }}
                                            />

                                            <div style={{ marginBottom: 6 }}>
                                                <span style={{ fontSize: 20 }}>{item.icon}</span>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>
                                                    {language === 'hi' ? item.hi : item.name}
                                                </div>
                                            </div>

                                            {subcategoryImages[item.name.toLowerCase()] ? (
                                                <div>
                                                    <img
                                                        src={subcategoryImages[item.name.toLowerCase()]}
                                                        alt={item.name}
                                                        style={{
                                                            width: '100%',
                                                            height: 50,
                                                            objectFit: 'cover',
                                                            borderRadius: 6,
                                                            marginBottom: 6
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button
                                                            onClick={() => fileInputRefs.current[item.name]?.click()}
                                                            style={{
                                                                flex: 1,
                                                                padding: '4px',
                                                                fontSize: 9,
                                                                borderRadius: 4,
                                                                border: 'none',
                                                                background: '#dbeafe',
                                                                color: '#1d4ed8',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📷
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveSubcategoryImage(item.name)}
                                                            style={{
                                                                padding: '4px 6px',
                                                                fontSize: 9,
                                                                borderRadius: 4,
                                                                border: 'none',
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRefs.current[item.name]?.click()}
                                                    disabled={uploading === item.name}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 6px',
                                                        border: '2px dashed #d1d5db',
                                                        borderRadius: 6,
                                                        background: '#f9fafb',
                                                        cursor: 'pointer',
                                                        color: '#6b7280',
                                                        fontSize: 10
                                                    }}
                                                >
                                                    {uploading === item.name ? '⏳' : '📷'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Main Categories Tab */}
                        {activeTab === 'categories' && (
                            <>
                                <div style={{
                                    background: '#fef3c7',
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 16
                                }}>
                                    <p style={{ fontSize: 12, color: '#92400e' }}>
                                        {language === 'hi'
                                            ? 'यह तब दिखेगा जब उप-श्रेणी छवि उपलब्ध नहीं है।'
                                            : 'These show when sub-category image is not available.'}
                                    </p>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 12
                                }}>
                                    {CATEGORIES.map(cat => (
                                        <div
                                            key={cat.id}
                                            style={{
                                                background: '#fff',
                                                borderRadius: 10,
                                                padding: 10,
                                                border: '1px solid #e5e7eb',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={el => fileInputRefs.current[cat.id] = el}
                                                onChange={(e) => handleCategoryImageUpload(cat.id, e)}
                                                style={{ display: 'none' }}
                                            />

                                            <div style={{ marginBottom: 6 }}>
                                                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>
                                                    {language === 'hi' ? cat.hi : cat.en}
                                                </div>
                                            </div>

                                            {defaultImages[cat.id] ? (
                                                <div>
                                                    <img
                                                        src={defaultImages[cat.id]}
                                                        alt={cat.en}
                                                        style={{
                                                            width: '100%',
                                                            height: 60,
                                                            objectFit: 'cover',
                                                            borderRadius: 6,
                                                            marginBottom: 6
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button
                                                            onClick={() => fileInputRefs.current[cat.id]?.click()}
                                                            style={{
                                                                flex: 1,
                                                                padding: '4px',
                                                                fontSize: 9,
                                                                borderRadius: 4,
                                                                border: 'none',
                                                                background: '#dbeafe',
                                                                color: '#1d4ed8',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {language === 'hi' ? 'बदलें' : 'Change'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveCategoryImage(cat.id)}
                                                            style={{
                                                                padding: '4px 6px',
                                                                fontSize: 9,
                                                                borderRadius: 4,
                                                                border: 'none',
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                                                    disabled={uploading === cat.id}
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 6px',
                                                        border: '2px dashed #d1d5db',
                                                        borderRadius: 6,
                                                        background: '#f9fafb',
                                                        cursor: 'pointer',
                                                        color: '#6b7280',
                                                        fontSize: 10
                                                    }}
                                                >
                                                    {uploading === cat.id ? '⏳' : '📷 Add'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export function AdminPage() {
    const { isVerified, isAdmin, isLoading } = useAdmin()
    const { user, isAuthLoading } = useAuth()

    // Show loading while checking auth
    if (isAuthLoading || isLoading) {
        return (
            <div className="app">
                <div className="page" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        padding: 40,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                        <p style={{ color: '#94a3b8' }}>Verifying access...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Show admin auth guard for non-admins or non-logged in users
    if (!user || !isAdmin) {
        return (
            <AdminAuthGuard>
                <AdminPanelContent />
            </AdminAuthGuard>
        )
    }

    // Admin but not verified - show verification screen
    if (!isVerified) {
        return <AdminVerifyScreen />
    }

    // Verified admin - show content wrapped in guard (for session management)
    return (
        <AdminAuthGuard>
            <AdminPanelContent />
        </AdminAuthGuard>
    )
}
