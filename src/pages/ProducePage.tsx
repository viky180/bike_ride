import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, Product, ProductCategory } from '../lib/supabase'
import { HERO_CATEGORIES, STANDARD_CATEGORIES, CATEGORIES } from '../lib/categories'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'

export function ProducePage() {
    const { t, language } = useApp()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
    const [showProducts, setShowProducts] = useState(false)

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

    const handleCategoryClick = (categoryId: ProductCategory) => {
        setSelectedCategory(categoryId)
        setShowProducts(true)
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setShowProducts(false)
    }

    // Category browsing view (Zepto-inspired)
    if (!showProducts) {
        return (
            <div className="app">
                <Header title={t('browse_produce')} />

                <div className="page category-browse-page">
                    {/* Hero Section - Grocery & Essentials */}
                    <section className="category-section">
                        <h2 className="category-section-title">
                            {language === 'hi' ? 'ग्रोसरी और मुख्य ज़रूरतें' : 'Grocery & Essentials'}
                        </h2>
                        <div className="category-hero-grid">
                            {HERO_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className="category-hero-card"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                    }}
                                >
                                    <div className="category-hero-overlay">
                                        <span className="category-hero-name">
                                            {language === 'hi' ? cat.hi : cat.en}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Other Categories - 3 column grid */}
                    <section className="category-section">
                        <h2 className="category-section-title">
                            {language === 'hi' ? 'अन्य श्रेणियाँ' : 'Other Categories'}
                        </h2>
                        <div className="category-standard-grid">
                            {STANDARD_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className="category-standard-card"
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                    }}
                                >
                                    <div className="category-standard-overlay">
                                        <span className="category-standard-name">
                                            {language === 'hi' ? cat.hi : cat.en}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Request banner + Demand board link */}
                    <div className="produce-actions">
                        <Link to="/request" className="request-banner">
                            <span>🔍</span>
                            <span>{t('product_not_found')}</span>
                            <span className="arrow">→</span>
                        </Link>
                        <Link to="/demand" className="demand-link">
                            <span>📢</span>
                            <span>{t('demand_board')}</span>
                        </Link>
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

    // Product listing view (when category is selected)
    return (
        <div className="app">
            <Header title={t('browse_produce')} showBack onBack={handleBackToCategories} />

            <div className="page">
                {/* Category filter tabs */}
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

                {/* Back to categories link */}
                <button className="back-to-categories" onClick={handleBackToCategories}>
                    ← {language === 'hi' ? 'श्रेणियाँ देखें' : 'Browse Categories'}
                </button>

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
