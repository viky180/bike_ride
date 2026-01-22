/**
 * User Management Component
 * 
 * Admin interface for managing all users in the system.
 * Allows viewing user details and their products.
 */

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, User, Product } from '../../lib/supabase'
import { useAdmin } from '../../hooks/useAdmin'
import { useApp } from '../../context/AppContext'

interface UserWithProducts extends User {
    products_count?: number
}

export function UserManagement() {
    const { language } = useApp()
    const { logAdminAction } = useAdmin()
    const [users, setUsers] = useState<UserWithProducts[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [userProducts, setUserProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)

    useEffect(() => {
        loadUsers()
        logAdminAction('view_user_management', null, null, {})
    }, [])

    const loadUsers = async () => {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadUserProducts = async (userId: string) => {
        if (selectedUser === userId) {
            setSelectedUser(null)
            setUserProducts([])
            return
        }

        setSelectedUser(userId)
        setLoadingProducts(true)

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setUserProducts(data || [])

            await logAdminAction('view_user_products', 'user', userId, {
                productsCount: data?.length || 0
            })
        } catch (error) {
            console.error('Error loading user products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery)
        return matchesSearch
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
                <p style={{ color: '#6b7280' }}>Loading users...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Search */}
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
                        fontSize: 14
                    }}
                />
            </div>

            {/* Results Count */}
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                {language === 'hi'
                    ? `${filteredUsers.length} उपयोगकर्ता मिले`
                    : `${filteredUsers.length} users found`}
            </div>

            {/* Users List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        style={{
                            background: 'white',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden'
                        }}
                    >
                        {/* User Info */}
                        <div
                            onClick={() => loadUserProducts(user.id)}
                            style={{
                                padding: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer'
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: 18,
                                flexShrink: 0
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                    {user.name}
                                    {user.is_driver && (
                                        <span style={{
                                            marginLeft: 6,
                                            padding: '2px 6px',
                                            background: '#dbeafe',
                                            color: '#1d4ed8',
                                            borderRadius: 4,
                                            fontSize: 10
                                        }}>
                                            Driver
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>
                                    📱 {user.phone}
                                </div>
                            </div>

                            {/* Joined Date */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                    Joined
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>
                                    {formatDate(user.created_at)}
                                </div>
                            </div>

                            {/* Expand Icon */}
                            <div style={{
                                fontSize: 16,
                                color: '#9ca3af',
                                transform: selectedUser === user.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* User Products (Expandable) */}
                        {selectedUser === user.id && (
                            <div style={{
                                borderTop: '1px solid #f3f4f6',
                                background: '#f9fafb',
                                padding: 12
                            }}>
                                <div style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 10,
                                    color: '#374151'
                                }}>
                                    📦 {language === 'hi' ? 'उपयोगकर्ता के उत्पाद' : "User's Products"}
                                </div>

                                {loadingProducts ? (
                                    <div style={{ textAlign: 'center', padding: 16, color: '#9ca3af' }}>
                                        Loading products...
                                    </div>
                                ) : userProducts.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {userProducts.map(product => (
                                            <div
                                                key={product.id}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    border: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#10b981' }}>
                                                        {product.price}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '3px 6px',
                                                    borderRadius: 4,
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    background: product.status === 'available' ? '#dcfce7' : '#fee2e2',
                                                    color: product.status === 'available' ? '#166534' : '#991b1b'
                                                }}>
                                                    {product.status.toUpperCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 16, color: '#9ca3af' }}>
                                        {language === 'hi' ? 'कोई उत्पाद नहीं' : 'No products'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: '#9ca3af'
                    }}>
                        {language === 'hi' ? 'कोई उपयोगकर्ता नहीं मिला' : 'No users found'}
                    </div>
                )}
            </div>
        </div>
    )
}
