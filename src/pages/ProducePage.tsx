import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, Product, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'

export function ProducePage() {
    const { t, language } = useApp()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:users!seller_id(id, name, phone)
                `)
                .eq('status', 'available')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts((data || []) as Product[])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory)
        : products

    return (
        <div className="app">
            <Header title={t('browse_produce')} />

            <div className="page">
                {/* Category filter */}
                <div className="category-tabs">
                    <button
                        className={`category-tab ${selectedCategory === null ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <span className="icon">🔍</span>
                        <span className="name">{t('all_categories')}</span>
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-tab ${selectedCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                borderColor: selectedCategory === cat.id ? cat.color : undefined,
                                background: selectedCategory === cat.id ? `${cat.color}15` : undefined
                            }}
                        >
                            <span className="icon">{cat.icon}</span>
                            <span className="name">{language === 'hi' ? cat.hi : cat.en}</span>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">🌾</div>
                        <p>{t('no_products')}</p>
                    </div>
                )}

                {/* Product grid */}
                <div className="product-grid">
                    {!loading && filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

                {/* Sell FAB */}
                <Link to="/sell" className="fab">
                    <span>+</span>
                </Link>
            </div>

            <BottomNav />
        </div>
    )
}
