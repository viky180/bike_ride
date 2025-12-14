import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function BottomNav() {
    const { t } = useApp()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="bottom-nav">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <span className="icon">🏠</span>
                <span>{t('app_name').split(' ')[0]}</span>
            </Link>
            <Link to="/find" className={`nav-item ${isActive('/find') ? 'active' : ''}`}>
                <span className="icon">🔍</span>
                <span>{t('find_ride')}</span>
            </Link>
            <Link to="/my-rides" className={`nav-item ${isActive('/my-rides') ? 'active' : ''}`}>
                <span className="icon">📋</span>
                <span>{t('my_rides')}</span>
            </Link>
        </nav>
    )
}
