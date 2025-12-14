import { useApp } from '../context/AppContext'
import { useNavigate, useLocation } from 'react-router-dom'

interface HeaderProps {
    title?: string
    showBack?: boolean
}

export function Header({ title, showBack = false }: HeaderProps) {
    const { language, setLanguage, t } = useApp()
    const navigate = useNavigate()
    const location = useLocation()

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    return (
        <header className="header">
            {showBack ? (
                <button className="header-back" onClick={handleBack} aria-label={t('back')}>
                    ←
                </button>
            ) : (
                <div className="header-title">{title || t('app_name')}</div>
            )}

            {showBack && <div className="header-title">{title}</div>}

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
        </header>
    )
}
