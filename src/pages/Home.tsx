import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

export function HomePage() {
    const { t, user } = useApp()

    return (
        <div className="app">
            <Header />

            <div className="page">
                {/* Welcome message */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏍️</div>
                    <h1 style={{ fontSize: 24, marginBottom: 8 }}>
                        {user?.name ? `नमस्ते, ${user.name}!` : t('app_name')}
                    </h1>
                    <p className="text-light">{t('app_tagline')}</p>
                </div>

                {/* Main action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Link to="/post" className="btn btn-primary btn-large">
                        <span className="btn-icon">🏍️</span>
                        <span>{t('offer_ride')}</span>
                    </Link>

                    <Link to="/find" className="btn btn-outline btn-large">
                        <span className="btn-icon">🙋</span>
                        <span>{t('find_ride')}</span>
                    </Link>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
