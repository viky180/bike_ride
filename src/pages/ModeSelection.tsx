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
                <button
                    className="mode-card ride-mode"
                    onClick={() => handleSelectMode('ride')}
                >
                    <div className="mode-card-icon">🏍️</div>
                    <div className="mode-card-content">
                        <div className="mode-card-title">
                            {language === 'hi' ? 'बाइक सवारी' : 'Bike Ride'}
                        </div>
                        <div className="mode-card-subtitle">
                            {language === 'hi' ? 'सवारी खोजें या दें' : 'Find or offer rides'}
                        </div>
                    </div>
                    <span className="mode-card-arrow">→</span>
                </button>

                <button
                    className="mode-card produce-mode"
                    onClick={() => handleSelectMode('produce')}
                >
                    <div className="mode-card-icon">🥬</div>
                    <div className="mode-card-content">
                        <div className="mode-card-title">
                            {language === 'hi' ? 'उपज खरीदें/बेचें' : 'Buy / Sell Produce'}
                        </div>
                        <div className="mode-card-subtitle">
                            {language === 'hi' ? 'सब्ज़ी, फल, अनाज' : 'Local vegetables, fruits, grains'}
                        </div>
                    </div>
                    <span className="mode-card-arrow">→</span>
                </button>
            </div>
        </div>
    )
}
