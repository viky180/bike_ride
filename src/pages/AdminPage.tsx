import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Header } from '../components/Header'
import { CATEGORIES } from '../lib/categories'
import { POPULAR_PRODUCTS } from '../lib/popularProducts'
import {
    getAllDefaultImages,
    getAllSubcategoryImages,
    setDefaultImage,
    setSubcategoryImage,
    removeDefaultImage,
    removeSubcategoryImage
} from '../lib/defaultImages'
import { ProductCategory } from '../lib/supabase'

export function AdminPage() {
    const { language } = useApp()
    const navigate = useNavigate()
    const [defaultImages, setDefaultImages] = useState(getAllDefaultImages())
    const [subcategoryImages, setSubcategoryImagesState] = useState(getAllSubcategoryImages())
    const [uploading, setUploading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('subcategories')
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('vegetables')
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    const handleCategoryImageUpload = async (category: ProductCategory, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(category)
        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            setDefaultImage(category, base64)
            setDefaultImages(prev => ({ ...prev, [category]: base64 }))
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
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            setSubcategoryImage(name, base64)
            setSubcategoryImagesState(prev => ({ ...prev, [name.toLowerCase()]: base64 }))
            setUploading(null)
        }
        reader.readAsDataURL(file)
        if (fileInputRefs.current[name]) fileInputRefs.current[name]!.value = ''
    }

    const handleRemoveCategoryImage = (category: ProductCategory) => {
        removeDefaultImage(category)
        setDefaultImages(prev => {
            const updated = { ...prev }
            delete updated[category]
            return updated
        })
    }

    const handleRemoveSubcategoryImage = (name: string) => {
        removeSubcategoryImage(name)
        setSubcategoryImagesState(prev => {
            const updated = { ...prev }
            delete updated[name.toLowerCase()]
            return updated
        })
    }

    const subcategories = POPULAR_PRODUCTS[selectedCategory] || []

    return (
        <div className="app">
            <Header
                title={language === 'hi' ? '⚙️ एडमिन पैनल' : '⚙️ Admin Panel'}
                showBack
                onBack={() => navigate('/')}
            />

            <div className="page" style={{ paddingBottom: 100 }}>
                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button
                        onClick={() => setActiveTab('subcategories')}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: activeTab === 'subcategories' ? '#10b981' : '#f3f4f6',
                            color: activeTab === 'subcategories' ? 'white' : '#374151',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {language === 'hi' ? 'उप-श्रेणियाँ' : 'Sub-Categories'}
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: activeTab === 'categories' ? '#10b981' : '#f3f4f6',
                            color: activeTab === 'categories' ? 'white' : '#374151',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {language === 'hi' ? 'मुख्य श्रेणियाँ' : 'Main Categories'}
                    </button>
                </div>

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
            </div>
        </div>
    )
}
