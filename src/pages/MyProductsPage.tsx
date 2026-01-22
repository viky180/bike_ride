import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { supabase, Product } from '../lib/supabase'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'

export function MyProductsPage() {
    const { t, showToast } = useApp()
    const { user } = useAuth()
    const { isAuthenticated, isAuthLoading } = useRequireAuth()
    const navigate = useNavigate()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthLoading, isAuthenticated, navigate])

    useEffect(() => {
        if (user) fetchProducts()
    }, [user])

    const fetchProducts = async () => {
        if (!user) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:users!seller_id(id, name, phone)
                `)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts((data || []) as Product[])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkSold = async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'sold' })
                .eq('id', productId)

            if (error) throw error

            showToast(t('product_sold'))
            fetchProducts()
        } catch (error) {
            console.error('Error updating product:', error)
        }
    }

    const handleDelete = async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error

            showToast(t('product_deleted'))
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    return (
        <div className="app">
            <Header title={t('my_products')} showBack />

            <div className="page">
                {/* Loading */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && products.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">📦</div>
                        <p>{t('no_products')}</p>
                        <Link to="/sell" className="btn btn-primary" style={{ marginTop: 16 }}>
                            + {t('sell_produce')}
                        </Link>
                    </div>
                )}

                {/* Products list */}
                {!loading && products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        showActions={false}
                        onMarkSold={() => handleMarkSold(product.id)}
                        onDelete={() => handleDelete(product.id)}
                    />
                ))}

                {/* Sell FAB */}
                {products.length > 0 && (
                    <Link to="/sell" className="fab">
                        <span>+</span>
                    </Link>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
