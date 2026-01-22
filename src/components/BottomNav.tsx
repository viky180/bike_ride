import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// SVG Icon Components matching the category icon style
const HomeIcon = ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="url(#homeGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
)

const RequestIcon = ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="reqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <path d="M12 2C10.3431 2 9 3.34315 9 5V6H15V5C15 3.34315 13.6569 2 12 2Z" fill="url(#reqGrad)" />
        <path d="M6 6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6H6Z" fill="url(#reqGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <circle cx="12" cy="13" r="2" fill="white" />
    </svg>
)

const SellIcon = ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#ffffff" : "#10b981"} />
                <stop offset="100%" stopColor={active ? "#f0fdf4" : "#059669"} />
            </linearGradient>
        </defs>
        <rect x="4" y="6" width="16" height="14" rx="2" fill="url(#sellGrad)" stroke={active ? "white" : "#059669"} strokeWidth="1.5" />
        <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke={active ? "white" : "#059669"} strokeWidth="1.5" />
        <line x1="12" y1="10" x2="12" y2="16" stroke={active ? "#10b981" : "white"} strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="13" x2="15" y2="13" stroke={active ? "#10b981" : "white"} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const MyAccountIcon = ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="myAccountGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <circle cx="12" cy="8" r="4" fill="url(#myAccountGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <path d="M4 20C4 16.6863 7.13401 14 11 14H13C16.866 14 20 16.6863 20 20" fill="url(#myAccountGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

// Bike ride mode icons
const SearchIcon = ({ active }: { active?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <circle cx="11" cy="11" r="7" fill="url(#searchGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <line x1="16" y1="16" x2="21" y2="21" stroke={active ? "#059669" : "#64748b"} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const BikeIcon = ({ active }: { active?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <circle cx="5.5" cy="17.5" r="3" fill="url(#bikeGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <circle cx="18.5" cy="17.5" r="3" fill="url(#bikeGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <path d="M12 17.5L8 8H14L16 12H18.5" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 17.5L8 8" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

const ListIcon = ({ active }: { active?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="listGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
                <stop offset="100%" stopColor={active ? "#059669" : "#64748b"} />
            </linearGradient>
        </defs>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="url(#listGrad)" stroke={active ? "#059669" : "#64748b"} strokeWidth="1.5" />
        <line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="15" x2="12" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

import { useScrollDirection } from '../hooks/useScrollDirection'

export function BottomNav() {
    const { t, mode, language } = useApp()
    const location = useLocation()
    const scrollDirection = useScrollDirection()

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav className={`bottom-nav ${scrollDirection === 'down' ? 'hidden' : ''}`}>

            {mode === 'produce' ? (
                <>
                    <Link
                        to="/"
                        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <span className="icon"><HomeIcon active={location.pathname === '/'} /></span>
                        <span>{language === 'hi' ? 'होम' : 'Home'}</span>
                    </Link>
                    <Link
                        to="/request"
                        className={`nav-item ${isActive('/request') ? 'active' : ''}`}
                    >
                        <span className="icon"><RequestIcon active={isActive('/request')} /></span>
                        <span>{language === 'hi' ? 'मांग' : 'Request'}</span>
                    </Link>
                    <Link
                        to="/sell"
                        className={`nav-item nav-item-prominent ${isActive('/sell') ? 'active' : ''}`}
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            borderRadius: 12,
                            transform: 'translateY(-4px)',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            minWidth: 60,
                            padding: '8px 4px'
                        }}
                    >
                        <span className="icon"><SellIcon active={true} /></span>
                        <span style={{ fontWeight: 600, fontSize: 11 }}>{language === 'hi' ? 'बेचें' : 'Sell'}</span>
                    </Link>
                    <Link
                        to="/my-account"
                        className={`nav-item ${isActive('/my-account') ? 'active' : ''}`}
                    >
                        <span className="icon"><MyAccountIcon active={isActive('/my-account')} /></span>
                        <span>{language === 'hi' ? 'खाता' : 'Account'}</span>
                    </Link>
                </>
            ) : (
                <>
                    <Link
                        to="/"
                        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <span className="icon"><HomeIcon active={location.pathname === '/'} /></span>
                        <span>{language === 'hi' ? 'होम' : 'Home'}</span>
                    </Link>
                    <Link
                        to="/find"
                        className={`nav-item ${isActive('/find') ? 'active' : ''}`}
                    >
                        <span className="icon"><SearchIcon active={isActive('/find')} /></span>
                        <span>{t('find_ride')}</span>
                    </Link>
                    <Link
                        to="/post"
                        className={`nav-item ${isActive('/post') ? 'active' : ''}`}
                    >
                        <span className="icon"><BikeIcon active={isActive('/post')} /></span>
                        <span>{t('offer_ride')}</span>
                    </Link>
                    <Link
                        to="/my-rides"
                        className={`nav-item ${isActive('/my-rides') ? 'active' : ''}`}
                    >
                        <span className="icon"><ListIcon active={isActive('/my-rides')} /></span>
                        <span>{t('my_rides')}</span>
                    </Link>
                </>
            )}
        </nav>
    )
}
