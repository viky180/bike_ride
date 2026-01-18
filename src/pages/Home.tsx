import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

export function HomePage() {
    const { t, user, language, mode /* setMode - RIDE SHARING DEACTIVATED */ } = useApp()

    // RIDE SHARING DEACTIVATED: handleSwitchMode is unused while ride mode is disabled
    // const handleSwitchMode = () => {
    //     // Toggle to the other mode
    //     const newMode = mode === 'ride' ? 'produce' : 'ride'
    //     setMode(newMode)
    // }

    // Mode-specific content
    const isRideMode = mode === 'ride'

    const headerTitle = isRideMode
        ? (language === 'hi' ? '🏍️ बाइक सवारी' : '🏍️ Bike Rides')
        : (language === 'hi' ? '🛒 स्थानीय बाज़ार' : '🛒 Local Market')

    return (
        <div className="app">
            <Header title={headerTitle} />

            {/* Switch Mode Button - RIDE SHARING DEACTIVATED: Hidden until reactivated */}
            {/* <button
                className="switch-mode-btn"
                onClick={handleSwitchMode}
                title={language === 'hi' ? 'मोड बदलें' : 'Switch Mode'}
            >
                🔄
            </button> */}

            <div className="page">
                {/* Welcome message */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, marginBottom: 8 }}>
                        {user?.name ? `नमस्ते, ${user.name}!` : t('app_name')}
                    </h1>
                    <p className="text-light">
                        {isRideMode
                            ? (language === 'hi' ? 'कहाँ जाना है?' : 'Where do you want to go?')
                            : (language === 'hi' ? 'क्या खरीदना या बेचना है?' : 'What to buy or sell?')
                        }
                    </p>
                </div>

                {/* Primary action card based on mode */}
                {isRideMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Link to="/find" className="home-section-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <div className="home-section-icon">🔍</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सवारी खोजें' : 'Find a Ride'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'आज उपलब्ध सवारी देखें' : 'See available rides today'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>

                        <Link to="/post" className="home-section-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                            <div className="home-section-icon">🏍️</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सवारी दें' : 'Offer a Ride'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'अपनी यात्रा साझा करें' : 'Share your journey'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Link to="/produce" className="home-section-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                            <div className="home-section-icon">🛒</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सामान खरीदें' : 'Buy Items'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'किराने, इलेक्ट्रॉनिक्स, कपड़े और अधिक' : 'Grocery, electronics, clothes & more'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>

                        <Link to="/sell" className="home-section-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <div className="home-section-icon">�</div>
                            <div className="home-section-content">
                                <div className="home-section-title">
                                    {language === 'hi' ? 'सामान बेचें' : 'Sell Items'}
                                </div>
                                <div className="home-section-subtitle">
                                    {language === 'hi' ? 'कुछ भी बेचें - पुराना या नया' : 'Sell anything - old or new'}
                                </div>
                            </div>
                            <span className="home-section-arrow">→</span>
                        </Link>
                    </div>
                )}

                {/* Quick actions based on mode */}
                <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-light)' }}>
                        {language === 'hi' ? 'जल्दी करें' : 'Quick Actions'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {isRideMode ? (
                            <>
                                <Link to="/post" className="quick-action-btn">
                                    <span>🏍️</span>
                                    <span>{t('offer_ride')}</span>
                                </Link>
                                <Link to="/my-rides" className="quick-action-btn">
                                    <span>📋</span>
                                    <span>{t('my_rides')}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/sell" className="quick-action-btn">
                                    <span>�</span>
                                    <span>{language === 'hi' ? 'बेचें' : 'Sell'}</span>
                                </Link>
                                <Link to="/my-products" className="quick-action-btn">
                                    <span>🏷️</span>
                                    <span>{language === 'hi' ? 'मेरे आइटम' : 'My Items'}</span>
                                </Link>
                                <Link to="/request" className="quick-action-btn">
                                    <span>🔔</span>
                                    <span>{language === 'hi' ? 'मांग करें' : 'Request'}</span>
                                </Link>
                                <Link to="/demand" className="quick-action-btn">
                                    <span>📋</span>
                                    <span>{language === 'hi' ? 'ज़रूरत बोर्ड' : 'Demand Board'}</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
