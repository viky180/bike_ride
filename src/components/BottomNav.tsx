import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function BottomNav() {
    const { t } = useApp()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav className="bottom-nav">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <span className="icon">🏠</span>
                <span>{t('app_name').split(' ')[0]}</span>
            </Link>
            <Link to="/find" className={`nav-item ${isActive('/find') ? 'active' : ''}`}>
                <span className="icon">🔍</span>
                <span>{t('find_ride')}</span>
            </Link>
            <Link to="/produce" className={`nav-item ${isActive('/produce') || isActive('/sell') || isActive('/my-products') ? 'active' : ''}`}>
                <span className="icon">🥬</span>
                <span>{t('produce')}</span>
            </Link>
            <Link to="/my-rides" className={`nav-item ${isActive('/my-rides') ? 'active' : ''}`}>
                <span className="icon">📋</span>
                <span>{t('my_rides')}</span>
            </Link>
        </nav>
    )
}
