import { format, isToday, isTomorrow } from 'date-fns'
import { useApp } from '../context/AppContext'
import { Ride } from '../lib/supabase'

interface RideCardProps {
    ride: Ride
    onAction?: () => void
    actionLabel?: string
    actionDisabled?: boolean
    showStatus?: boolean
}

export function RideCard({
    ride,
    onAction,
    actionLabel,
    actionDisabled = false,
    showStatus = false
}: RideCardProps) {
    const { language, t } = useApp()

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const time = format(date, 'h:mm')
        const isPM = date.getHours() >= 12
        const ampm = language === 'hi' ? (isPM ? 'शाम' : 'सुबह') : (isPM ? 'PM' : 'AM')

        let dayStr = ''
        if (isToday(date)) {
            dayStr = language === 'hi' ? 'आज' : 'Today'
        } else if (isTomorrow(date)) {
            dayStr = language === 'hi' ? 'कल' : 'Tomorrow'
        } else {
            dayStr = format(date, 'dd/MM')
        }

        return `${dayStr} ${time} ${ampm}`
    }

    return (
        <div className="ride-card">
            {/* Origin → Destination header */}
            <div className="ride-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20 }}>📍</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {ride.origin || (language === 'hi' ? 'गाँव' : 'Village')}
                    </span>
                    <span style={{ fontSize: 16, color: 'var(--color-text-light)' }}>→</span>
                    <span style={{ fontSize: 20 }}>🏁</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-primary)' }}>
                        {ride.destination}
                    </span>
                    {showStatus && (
                        <span className={`badge badge-${ride.status === 'open' ? 'accepted' : ride.status}`}>
                            {ride.status}
                        </span>
                    )}
                </div>
            </div>

            <div className="ride-details">
                <div className="ride-detail">
                    <span className="icon">🕐</span>
                    <span>{formatTime(ride.departure_time)}</span>
                </div>
                <div className="ride-detail">
                    <span className="icon">👤</span>
                    <span>{ride.driver?.name || 'Driver'}</span>
                </div>
                <div className="ride-detail">
                    <span className="icon">💺</span>
                    <span>{ride.available_seats} {t('seats_left')}</span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="ride-price">{t('rupees')}{ride.cost_per_seat}</span>
                {onAction && actionLabel && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={onAction}
                        disabled={actionDisabled}
                        style={{ width: 'auto' }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}
