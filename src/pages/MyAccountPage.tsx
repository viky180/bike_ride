import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { supabase, Product, ProductRequest } from '../lib/supabase'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { ProductCard } from '../components/ProductCard'
import { RequestCard } from '../components/RequestCard'

// Icons
const MyItemsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="myItemsIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" fill="url(#myItemsIconGrad)" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="7" r="1.5" fill="white" />
    </svg>
)

const LogoutIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,17 21,12 16,7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="12" x2="9" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

type TabType = 'menu' | 'my-items'

export function MyAccountPage() {
    const { language, showToast } = useApp()
    const { user, signOut } = useAuth()
    const { isAuthenticated, isAuthLoading } = useRequireAuth()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState<TabType>('menu')
    const [products, setProducts] = useState<Product[]>([])
    const [requests, setRequests] = useState<ProductRequest[]>([])
    const [loading, setLoading] = useState(false)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthLoading, isAuthenticated, navigate])

    // Fetch user's items when switching to My Items tab
    useEffect(() => {
        if (activeTab === 'my-items' && user) {
            fetchMyItems()
        }
    }, [activeTab, user])

    const fetchMyItems = async () => {
        if (!user) return
        setLoading(true)
        try {
            // Fetch products for sale
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:users!seller_id(id, name, phone)
                `)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })

            if (productsError) throw productsError
            setProducts((productsData || []) as Product[])

            // Fetch requested items
            const { data: requestsData, error: requestsError } = await supabase
                .from('product_requests')
                .select(`
                    *,
                    buyer:users!buyer_id(id, name, phone)
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false })

            if (requestsError) throw requestsError
            setRequests((requestsData || []) as ProductRequest[])
        } catch (error) {
            console.error('Error fetching my items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            showToast(language === 'hi' ? 'सफलतापूर्वक लॉगआउट हो गया' : 'Logged out successfully')
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
            showToast(language === 'hi' ? 'लॉगआउट में त्रुटि' : 'Error logging out')
        }
    }

    const handleMarkSold = async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'sold' })
                .eq('id', productId)

            if (error) throw error
            showToast(language === 'hi' ? 'उत्पाद बिक गया चिह्नित' : 'Product marked as sold')
            fetchMyItems()
        } catch (error) {
            console.error('Error updating product:', error)
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error
            showToast(language === 'hi' ? 'उत्पाद हटाया गया' : 'Product deleted')
            fetchMyItems()
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleDeleteRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('product_requests')
                .delete()
                .eq('id', requestId)

            if (error) throw error
            showToast(language === 'hi' ? 'अनुरोध हटाया गया' : 'Request deleted')
            fetchMyItems()
        } catch (error) {
            console.error('Error deleting request:', error)
        }
    }

    const renderMenu = () => (
        <div className="account-menu">
            <div className="user-info">
                <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <div className="user-details">
                    <h3>{user?.name || (language === 'hi' ? 'उपयोगकर्ता' : 'User')}</h3>
                    <p>{user?.phone || ''}</p>
                </div>
            </div>

            <div className="menu-items">
                <button
                    className="menu-item"
                    onClick={() => setActiveTab('my-items')}
                >
                    <span className="menu-icon"><MyItemsIcon /></span>
                    <span className="menu-text">
                        {language === 'hi' ? 'मेरी वस्तुएं' : 'My Items'}
                    </span>
                    <span className="menu-arrow">→</span>
                </button>

                {/* Shop Menu Item */}
                <button
                    className="menu-item"
                    onClick={() => navigate('/shop-settings')}
                >
                    <span className="menu-icon" style={{ fontSize: 20 }}>🏪</span>
                    <span className="menu-text">
                        {user?.seller_type === 'shopkeeper'
                            ? (language === 'hi' ? 'मेरी दुकान' : 'My Shop')
                            : (language === 'hi' ? 'दुकानदार बनें' : 'Become a Shopkeeper')
                        }
                    </span>
                    <span className="menu-arrow">→</span>
                </button>

                {/* Note for occasional sellers */}
                {user?.seller_type !== 'shopkeeper' && (
                    <div style={{
                        padding: '8px 16px',
                        marginTop: -8,
                        marginBottom: 8,
                        fontSize: 11,
                        color: '#64748b',
                        fontStyle: 'italic'
                    }}>
                        {language === 'hi'
                            ? '* केवल नियमित दुकानदारों के लिए। कभी-कभार बेचने वाले इसे छोड़ें।'
                            : '* Only for regular shopkeepers. Occasional sellers can skip this.'
                        }
                    </div>
                )}

                <button
                    className="menu-item logout"
                    onClick={handleLogout}
                >
                    <span className="menu-icon"><LogoutIcon /></span>
                    <span className="menu-text">
                        {language === 'hi' ? 'लॉगआउट' : 'Logout'}
                    </span>
                </button>
            </div>
        </div>
    )

    const renderMyItems = () => (
        <div className="my-items-section">
            <button
                className="back-to-menu"
                onClick={() => setActiveTab('menu')}
            >
                ← {language === 'hi' ? 'वापस' : 'Back'}
            </button>

            {loading ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* Products for Sale */}
                    <div className="items-category">
                        <h3 className="category-title">
                            📦 {language === 'hi' ? 'बिक्री के लिए' : 'Listed for Sale'} ({products.length})
                        </h3>
                        {products.length === 0 ? (
                            <div className="empty-state small">
                                <p>{language === 'hi' ? 'कोई उत्पाद नहीं' : 'No products listed'}</p>
                                <Link to="/sell" className="btn btn-primary btn-sm">
                                    + {language === 'hi' ? 'नया उत्पाद' : 'New Product'}
                                </Link>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    showActions={false}
                                    onMarkSold={() => handleMarkSold(product.id)}
                                    onDelete={() => handleDeleteProduct(product.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Requested Items */}
                    <div className="items-category" style={{ marginTop: 24 }}>
                        <h3 className="category-title">
                            🔍 {language === 'hi' ? 'अनुरोधित वस्तुएं' : 'Requested Items'} ({requests.length})
                        </h3>
                        {requests.length === 0 ? (
                            <div className="empty-state small">
                                <p>{language === 'hi' ? 'कोई अनुरोध नहीं' : 'No requests made'}</p>
                                <Link to="/request" className="btn btn-primary btn-sm">
                                    + {language === 'hi' ? 'नया अनुरोध' : 'New Request'}
                                </Link>
                            </div>
                        ) : (
                            requests.map(request => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    showDelete={true}
                                    onDelete={() => handleDeleteRequest(request.id)}
                                />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )

    return (
        <div className="app">
            <Header
                title={activeTab === 'menu'
                    ? (language === 'hi' ? 'मेरा खाता' : 'My Account')
                    : (language === 'hi' ? 'मेरी वस्तुएं' : 'My Items')
                }
                showBack={activeTab === 'my-items'}
                onBack={() => setActiveTab('menu')}
            />

            <div className="page my-account-page">
                {activeTab === 'menu' ? renderMenu() : renderMyItems()}
            </div>

            <BottomNav />
        </div>
    )
}
