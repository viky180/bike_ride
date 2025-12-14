import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

export function HomePage() {
    const { t, user, language } = useApp()

    return (
        <div className="app">
            <Header />

            <div className="page">
                {/* Welcome message */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, marginBottom: 8 }}>
                        {user?.name ? `नमस्ते, ${user.name}!` : t('app_name')}
                    </h1>
                    <p className="text-light">{language === 'hi' ? 'आप क्या करना चाहते हैं?' : 'What would you like to do?'}</p>
                </div>

                {/* Two main choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Bike Booking Section */}
                    <Link to="/find" className="home-section-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <div className="home-section-icon">🏍️</div>
                        <div className="home-section-content">
                            <div className="home-section-title">
                                {language === 'hi' ? 'बाइक सवारी' : 'Bike Ride'}
                            </div>
                            <div className="home-section-subtitle">
                                {language === 'hi' ? 'सवारी खोजें या दें' : 'Find or offer a ride'}
                            </div>
                        </div>
                        <span className="home-section-arrow">→</span>
                    </Link>

                    {/* Buy/Sell Produce Section */}
                    <Link to="/produce" className="home-section-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <div className="home-section-icon">🥬</div>
                        <div className="home-section-content">
                            <div className="home-section-title">
                                {language === 'hi' ? 'उपज खरीदें/बेचें' : 'Buy/Sell Produce'}
                            </div>
                            <div className="home-section-subtitle">
                                {language === 'hi' ? 'सब्ज़ी, फल, अनाज बेचें' : 'Vegetables, fruits, grains'}
                            </div>
                        </div>
                        <span className="home-section-arrow">→</span>
                    </Link>
                </div>

                {/* Quick actions */}
                <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-light)' }}>
                        {language === 'hi' ? 'जल्दी करें' : 'Quick Actions'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <Link to="/post" className="quick-action-btn">
                            <span>🏍️</span>
                            <span>{t('offer_ride')}</span>
                        </Link>
                        <Link to="/sell" className="quick-action-btn">
                            <span>📦</span>
                            <span>{t('sell_produce')}</span>
                        </Link>
                        <Link to="/my-rides" className="quick-action-btn">
                            <span>�</span>
                            <span>{t('my_rides')}</span>
                        </Link>
                        <Link to="/my-products" className="quick-action-btn">
                            <span>🏷️</span>
                            <span>{t('my_products')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
