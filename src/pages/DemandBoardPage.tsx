import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductRequest, ProductCategory } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { RequestCard } from '../components/RequestCard'

export function DemandBoardPage() {
    const { t, language } = useApp()

    const [requests, setRequests] = useState<ProductRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('product_requests')
                .select(`
                    *,
                    buyer:users!buyer_id(id, name, phone)
                `)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests((data || []) as ProductRequest[])
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRequests = selectedCategory
        ? requests.filter(r => r.category === selectedCategory)
        : requests

    return (
        <div className="app">
            <Header title={t('demand_board')} showBack />

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

                {/* Info banner */}
                <div className="demand-info-banner">
                    <span>📢</span>
                    <span>{language === 'hi' ? 'ये लोग उत्पाद ढूंढ रहे हैं। संपर्क करें!' : 'These people are looking for products. Contact them!'}</span>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredRequests.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <p>{t('no_demands')}</p>
                    </div>
                )}

                {/* Requests grid */}
                {!loading && filteredRequests.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 12,
                        marginTop: 8
                    }}>
                        {filteredRequests.map(request => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                    </div>
                )}

                {/* FAB to add request */}
                <Link to="/request" className="fab">
                    <span>+</span>
                </Link>
            </div>

            <BottomNav />
        </div>
    )
}
