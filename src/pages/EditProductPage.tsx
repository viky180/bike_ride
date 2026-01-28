import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import {
    supabase,
    Product,
    deleteImageFromStorage,
    uploadProductImage,
    updateProductImages
} from '../lib/supabase'
import { Header } from '../components/Header'
import { ProductPhotoManager } from '../components/ProductPhotoManager'

export function EditProductPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { language, showToast } = useApp()
    const { user } = useAuth()
    const { isAuthenticated, isAuthLoading } = useRequireAuth()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // State for photo management
    const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([])
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [deletedUrls, setDeletedUrls] = useState<string[]>([])
    const [thumbnailIndex, setThumbnailIndex] = useState(0)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthLoading, isAuthenticated, navigate])

    // Fetch product details
    useEffect(() => {
        if (id && user) {
            fetchProduct()
        }
    }, [id, user])

    const fetchProduct = async () => {
        if (!id || !user) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            // Check if user is the owner
            if (data.seller_id !== user.id) {
                showToast(language === 'hi'
                    ? '❌ आप इस उत्पाद को संपादित नहीं कर सकते'
                    : '❌ You cannot edit this product')
                navigate('/my-products')
                return
            }

            setProduct(data)
            setCurrentImageUrls(data.image_urls || [])
            setThumbnailIndex(data.thumbnail_index ?? 0)
        } catch (error) {
            console.error('Error fetching product:', error)
            showToast(language === 'hi' ? '❌ उत्पाद नहीं मिला' : '❌ Product not found')
            navigate('/my-products')
        } finally {
            setLoading(false)
        }
    }

    const handleImagesChange = (imageUrls: string[], files: File[], deleted: string[]) => {
        setCurrentImageUrls(imageUrls)
        setNewFiles(files)
        setDeletedUrls(deleted)
    }

    const handleThumbnailChange = (index: number) => {
        setThumbnailIndex(index)
    }

    const handleSave = async () => {
        if (!product || !user) return

        setSaving(true)
        try {
            // 1. Upload new images
            const uploadedUrls: string[] = []
            for (const file of newFiles) {
                const url = await uploadProductImage(user.id, file)
                if (url) {
                    uploadedUrls.push(url)
                } else {
                    showToast(language === 'hi'
                        ? '⚠️ कुछ फोटो अपलोड नहीं हुईं'
                        : '⚠️ Some photos failed to upload')
                }
            }

            // 2. Combine existing URLs with newly uploaded URLs
            const finalUrls = [...currentImageUrls, ...uploadedUrls]

            // 3. Update product in database (with ownership verification)
            const success = await updateProductImages(product.id, finalUrls, user.id, thumbnailIndex)
            if (!success) {
                throw new Error('Failed to update product')
            }

            // 4. Delete removed images from storage (do this after successful DB update)
            for (const url of deletedUrls) {
                await deleteImageFromStorage(url)
            }

            showToast(language === 'hi' ? '✅ फोटो अपडेट हो गई!' : '✅ Photos updated!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error saving photos:', error)
            showToast(language === 'hi'
                ? `❌ त्रुटि: ${error?.message}`
                : `❌ Error: ${error?.message}`)
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = newFiles.length > 0 || deletedUrls.length > 0 || thumbnailIndex !== (product?.thumbnail_index ?? 0)

    if (loading || isAuthLoading) {
        return (
            <div className="app">
                <Header
                    title={language === 'hi' ? 'फोटो संपादित करें' : 'Edit Photos'}
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

    if (!product) {
        return (
            <div className="app">
                <Header
                    title={language === 'hi' ? 'फोटो संपादित करें' : 'Edit Photos'}
                    showBack
                />
                <div className="page">
                    <div className="empty-state">
                        <div className="icon">❌</div>
                        <p>{language === 'hi' ? 'उत्पाद नहीं मिला' : 'Product not found'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Header
                title={language === 'hi' ? 'फोटो संपादित करें' : 'Edit Photos'}
                showBack
            />

            <div className="page">
                {/* Product Info */}
                <div className="card mb-lg">
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                        {product.name}
                    </h2>
                    <p style={{ color: 'var(--color-text-light)', fontSize: 14 }}>
                        {language === 'hi'
                            ? 'इस उत्पाद की फोटो जोड़ें या हटाएं'
                            : 'Add or remove photos for this product'}
                    </p>
                </div>

                {/* Photo Manager */}
                <div className="card mb-lg">
                    <ProductPhotoManager
                        existingImages={product.image_urls || []}
                        maxImages={5}
                        onImagesChange={handleImagesChange}
                        loading={saving}
                        thumbnailIndex={thumbnailIndex}
                        onThumbnailChange={handleThumbnailChange}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => navigate('/my-products')}
                        disabled={saving}
                        style={{
                            flex: 1,
                            background: 'var(--color-surface)',
                            border: '2px solid var(--color-border)',
                            color: 'var(--color-text)'
                        }}
                    >
                        {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        style={{ flex: 1 }}
                    >
                        {saving
                            ? (language === 'hi' ? '⏳ सेव हो रहा है...' : '⏳ Saving...')
                            : (language === 'hi' ? '💾 सेव करें' : '💾 Save Changes')}
                    </button>
                </div>

                {!hasChanges && (
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--color-text-light)',
                        fontSize: 13,
                        marginTop: 12
                    }}>
                        {language === 'hi'
                            ? 'कोई बदलाव नहीं किया गया'
                            : 'No changes made'}
                    </p>
                )}
            </div>
        </div>
    )
}
