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

    // Produce Mode navigation items - 5 items with Sell prominent in center
    const produceNavItems = [
        { path: '/', icon: '🏠', label: language === 'hi' ? 'होम' : 'Home', exact: true },
        { path: '/request', icon: '🔔', label: language === 'hi' ? 'मांग' : 'Request' },
        { path: '/sell', icon: '📦', label: language === 'hi' ? 'बेचें' : 'Sell', prominent: true },
        { path: '/demand', icon: '📋', label: language === 'hi' ? 'ज़रूरत' : 'Demand' },
        { path: '/my-products', icon: '🏷️', label: language === 'hi' ? 'मेरा' : 'My Items' },
    ]

    const navItems = mode === 'produce' ? produceNavItems : rideNavItems

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${item.exact ? location.pathname === item.path ? 'active' : '' : isActive(item.path) ? 'active' : ''} ${'prominent' in item && item.prominent ? 'nav-item-prominent' : ''}`}
                    style={'prominent' in item && item.prominent ? {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: 16,
                        transform: 'translateY(-8px)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        minWidth: 70
                    } : undefined}
                >
                    <span className="icon" style={'prominent' in item && item.prominent ? { fontSize: 28 } : undefined}>{item.icon}</span>
                    <span style={'prominent' in item && item.prominent ? { fontWeight: 700 } : undefined}>{item.label}</span>
                </Link>
            ))}
        </nav>
    )
}
