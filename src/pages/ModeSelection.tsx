import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function ModeSelection() {
    const { language, setMode, setLanguage } = useApp()
    const navigate = useNavigate()

    const handleSelectMode = (mode: 'ride' | 'produce') => {
        setMode(mode)
        navigate('/')
    }

    return (
        <div className="mode-selection-page">
            {/* Language toggle in top right */}
            <div className="mode-selection-header">
                <div className="lang-toggle">
                    <button
                        className={language === 'hi' ? 'active' : ''}
                        onClick={() => setLanguage('hi')}
                    >
                        हि
                    </button>
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        En
                    </button>
                </div>
            </div>

            {/* Welcome message */}
            <div className="mode-selection-welcome">
                <h1>
                    {language === 'hi' ? 'ग्रामीण सवारी में आपका स्वागत है!' : 'Welcome to Gramin Sawari!'}
                </h1>
                <p>
                    {language === 'hi' ? 'आप क्या करना चाहते हैं?' : 'What would you like to do?'}
                </p>
            </div>

            {/* Mode Cards */}
            <div className="mode-selection-cards">
                {/* Bike Ride Sharing - Temporarily Deactivated */}
                <button
                    className="mode-card ride-mode disabled"
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}
                >
                    <div className="coming-soon-badge" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(238, 90, 90, 0.3)'
                    }}>
                        {language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}
                    </div>
                    <div className="mode-card-icon">🏍️</div>
                    <div className="mode-card-content">
                        <div className="mode-card-title">
                            {language === 'hi' ? 'बाइक सवारी साझाकरण' : 'Bike Ride Sharing'}
                        </div>
                        <div className="mode-card-subtitle">
                            {language === 'hi' ? 'सवारी खोजें या पोस्ट करें' : 'Find or post rides'}
                        </div>
                    </div>
                    <span className="mode-card-arrow" style={{ opacity: 0.3 }}>→</span>
                </button>

                {/* Buy & Sell Online - Active */}
                <button
                    className="mode-card produce-mode"
                    onClick={() => handleSelectMode('produce')}
                >
                    <div className="mode-card-icon">🛍️</div>
                    <div className="mode-card-content">
                        <div className="mode-card-title">
                            {language === 'hi' ? 'ऑनलाइन खरीदें और बेचें' : 'Buy & Sell Online'}
                        </div>
                        <div className="mode-card-subtitle">
                            {language === 'hi' ? 'उत्पाद खरीदें या बेचें' : 'Buy or sell products'}
                        </div>
                    </div>
                    <span className="mode-card-arrow">→</span>
                </button>
            </div>
        </div>
    )
}
