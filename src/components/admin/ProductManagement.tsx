/**
 * Product Management Component
 * 
 * Admin interface for managing all products in the system.
 * Allows viewing, searching, editing, and deleting products.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured, Product, User } from '../../lib/supabase'
import { useAdmin } from '../../hooks/useAdmin'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../lib/categories'

interface ProductWithSeller extends Product {
    seller?: User
}

export function ProductManagement() {
    const navigate = useNavigate()
    const { language } = useApp()
    const { logAdminAction } = useAdmin()
    const [products, setProducts] = useState<ProductWithSeller[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        loadProducts()
        logAdminAction('view_product_management', null, null, {})
    }, [])

    const loadProducts = async () => {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, seller:users(*)')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error

            await logAdminAction('delete_product', 'product', productId, {
                deletedAt: new Date().toISOString()
            })

            setProducts(prev => prev.filter(p => p.id !== productId))
            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Failed to delete product')
        }
    }

    const handleStatusChange = async (productId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: newStatus })
                .eq('id', productId)

            if (error) throw error

            await logAdminAction('update_product_status', 'product', productId, {
                newStatus,
                updatedAt: new Date().toISOString()
            })

            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, status: newStatus as Product['status'] } : p
            ))
        } catch (error) {
            console.error('Error updating product status:', error)
            alert('Failed to update status')
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId)
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.seller?.phone?.includes(searchQuery)

        const matchesStatus = statusFilter === 'all' || product.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: '#6b7280' }}>Loading products...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Search and Filters */}
            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder={language === 'hi' ? '🔍 नाम या फोन से खोजें...' : '🔍 Search by name or phone...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        marginBottom: 10
                    }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontSize: 13
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontSize: 13
                        }}
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {language === 'hi' ? cat.hi : cat.en}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                {language === 'hi'
                    ? `${filteredProducts.length} उत्पाद मिले`
                    : `${filteredProducts.length} products found`}
            </div>

            {/* Products List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredProducts.map(product => {
                    const category = getCategoryInfo(product.category)

                    return (
                        <div
                            key={product.id}
                            style={{
                                background: 'white',
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', padding: 12, gap: 12 }}>
                                {/* Product Image */}
                                <div style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 8,
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    overflow: 'hidden'
                                }}>
                                    {product.image_urls?.[0] ? (
                                        <img
                                            src={product.image_urls[0]}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: 24 }}>{category?.icon || '📦'}</span>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                        {category?.icon} {language === 'hi' ? category?.hi : category?.en}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                                        {product.price}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    background: product.status === 'available' ? '#dcfce7'
                                        : product.status === 'sold' ? '#fee2e2' : '#fef3c7',
                                    color: product.status === 'available' ? '#166534'
                                        : product.status === 'sold' ? '#991b1b' : '#92400e',
                                    alignSelf: 'flex-start'
                                }}>
                                    {product.status.toUpperCase()}
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div style={{
                                padding: '8px 12px',
                                background: '#f9fafb',
                                borderTop: '1px solid #f3f4f6',
                                fontSize: 11,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{ color: '#6b7280' }}>Seller: </span>
                                    <strong>{product.seller?.name || 'Unknown'}</strong>
                                    <span style={{ color: '#9ca3af', marginLeft: 6 }}>
                                        ({product.seller?.phone})
                                    </span>
                                </div>
                                <div style={{ color: '#9ca3af' }}>
                                    {formatDate(product.created_at)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{
                                padding: '8px 12px',
                                borderTop: '1px solid #f3f4f6',
                                display: 'flex',
                                gap: 8
                            }}>
                                <button
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 12px',
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: 'pointer'
                                    }}
                                >
                                    👁️ View
                                </button>

                                <select
                                    value={product.status}
                                    onChange={e => handleStatusChange(product.id, e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        background: '#f3f4f6',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                    <option value="expired">Expired</option>
                                </select>

                                {deleteConfirm === product.id ? (
                                    <>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#e5e7eb',
                                                color: '#374151',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(product.id)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}

                {filteredProducts.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: '#9ca3af'
                    }}>
                        {language === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products found'}
                    </div>
                )}
            </div>
        </div>
    )
}
