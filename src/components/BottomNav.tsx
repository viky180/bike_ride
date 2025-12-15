import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function BottomNav() {
    const { t, mode, language } = useApp()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

    // Bike Ride Mode navigation items
    const rideNavItems = [
        { path: '/', icon: '🏠', label: language === 'hi' ? 'होम' : 'Home', exact: true },
        { path: '/find', icon: '🔍', label: t('find_ride') },
        { path: '/post', icon: '🏍️', label: t('offer_ride') },
        { path: '/my-rides', icon: '📋', label: t('my_rides') },
    ]

    // Produce Mode navigation items
    const produceNavItems = [
        { path: '/', icon: '🏠', label: language === 'hi' ? 'होम' : 'Home', exact: true },
        { path: '/produce', icon: '🛒', label: language === 'hi' ? 'खरीदें' : 'Buy' },
        { path: '/sell', icon: '📦', label: t('sell_produce') },
        { path: '/my-products', icon: '🏷️', label: t('my_products') },
    ]

    const navItems = mode === 'produce' ? produceNavItems : rideNavItems

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${item.exact ? location.pathname === item.path ? 'active' : '' : isActive(item.path) ? 'active' : ''}`}
                >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    )
}
