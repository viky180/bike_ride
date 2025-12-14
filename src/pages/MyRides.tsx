import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase, Ride, Booking } from '../lib/supabase'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { RideCard } from '../components/RideCard'
import { getDestination } from '../lib/destinations'
import { format } from 'date-fns'

interface RideWithBookings extends Ride {
    bookings?: (Booking & { rider?: { id: string; name: string; phone: string } })[]
}

export function MyRidesPage() {
    const { t, user, language, showToast } = useApp()

    const [myRides, setMyRides] = useState<RideWithBookings[]>([])
    const [myBookings, setMyBookings] = useState<(Booking & { ride?: Ride })[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'posted' | 'booked'>('posted')

    useEffect(() => {
        if (user) fetchData()
    }, [user])

    const fetchData = async () => {
        if (!user) return
        setLoading(true)

        try {
            // Fetch rides I've posted with their bookings
            const { data: rides } = await supabase
                .from('rides')
                .select(`
          *,
          bookings(
            id,
            status,
            rider:users!rider_id(id, name, phone)
          )
        `)
                .eq('driver_id', user.id)
                .order('departure_time', { ascending: false })

            if (rides) setMyRides(rides as RideWithBookings[])

            // Fetch rides I've booked
            const { data: bookings } = await supabase
                .from('bookings')
                .select(`
          *,
          ride:rides(
            *,
            driver:users!driver_id(id, name, phone)
          )
        `)
                .eq('rider_id', user.id)
                .order('created_at', { ascending: false })

            if (bookings) setMyBookings(bookings as (Booking & { ride?: Ride })[])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBookingAction = async (bookingId: string, action: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: action })
                .eq('id', bookingId)

            if (error) throw error

            showToast(action === 'accepted' ? t('accepted') : t('rejected'))
            fetchData()
        } catch (error) {
            console.error('Error updating booking:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'badge-pending', label: t('pending') },
            accepted: { class: 'badge-accepted', label: t('accepted') },
            rejected: { class: 'badge-rejected', label: t('rejected') }
        }
        return statusMap[status] || statusMap.pending
    }

    return (
        <div className="app">
            <Header title={t('my_rides')} showBack />

            <div className="page">
                {/* Tab switcher */}
                <div className="date-buttons mb-lg">
                    <button
                        className={tab === 'posted' ? 'selected' : ''}
                        onClick={() => setTab('posted')}
                    >
                        {t('rides_you_posted')}
                    </button>
                    <button
                        className={tab === 'booked' ? 'selected' : ''}
                        onClick={() => setTab('booked')}
                    >
                        {t('your_bookings')}
                    </button>
                </div>

                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Posted rides tab */}
                {!loading && tab === 'posted' && (
                    <>
                        {myRides.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">🏍️</div>
                                <p>{t('no_rides')}</p>
                            </div>
                        ) : (
                            myRides.map(ride => {
                                const destination = getDestination(ride.destination)
                                const pendingBookings = ride.bookings?.filter(b => b.status === 'pending') || []

                                return (
                                    <div key={ride.id} className="card" style={{ marginBottom: 16 }}>
                                        {/* Ride info */}
                                        <div className="ride-header">
                                            <span className="ride-destination-icon">{destination?.icon}</span>
                                            <span className="ride-destination-name">
                                                {language === 'hi' ? destination?.hi : destination?.en}
                                            </span>
                                            <span className={`badge badge-${ride.status === 'open' ? 'accepted' : 'pending'}`}>
                                                {ride.status}
                                            </span>
                                        </div>

                                        <div className="ride-details">
                                            <div className="ride-detail">
                                                <span className="icon">🕐</span>
                                                <span>{format(new Date(ride.departure_time), 'dd/MM h:mm a')}</span>
                                            </div>
                                            <div className="ride-detail">
                                                <span className="icon">💺</span>
                                                <span>{ride.available_seats} {t('seats_left')}</span>
                                            </div>
                                            <span className="ride-price">₹{ride.cost_per_seat}</span>
                                        </div>

                                        {/* Booking requests */}
                                        {pendingBookings.length > 0 && (
                                            <div style={{ marginTop: 16 }}>
                                                <h4 style={{ marginBottom: 12 }}>{t('ride_requests')}</h4>
                                                {pendingBookings.map(booking => (
                                                    <div key={booking.id} className="rider-info">
                                                        <div className="rider-avatar">👤</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="rider-name">{booking.rider?.name}</div>
                                                            <div className="rider-phone">{booking.rider?.phone}</div>
                                                        </div>
                                                        <div className="btn-row" style={{ flex: 0 }}>
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleBookingAction(booking.id, 'accepted')}
                                                                style={{ width: 'auto', padding: '8px 16px' }}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleBookingAction(booking.id, 'rejected')}
                                                                style={{ width: 'auto', padding: '8px 16px' }}
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Accepted riders */}
                                        {ride.bookings?.filter(b => b.status === 'accepted').map(booking => (
                                            <div key={booking.id} className="rider-info">
                                                <div className="rider-avatar">✓</div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="rider-name">{booking.rider?.name}</div>
                                                    <div className="rider-phone">{booking.rider?.phone}</div>
                                                </div>
                                                <span className="badge badge-accepted">{t('accepted')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })
                        )}
                    </>
                )}

                {/* Booked rides tab */}
                {!loading && tab === 'booked' && (
                    <>
                        {myBookings.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">📋</div>
                                <p>{t('no_requests')}</p>
                            </div>
                        ) : (
                            myBookings.map(booking => {
                                if (!booking.ride) return null
                                const status = getStatusBadge(booking.status)

                                return (
                                    <div key={booking.id} style={{ marginBottom: 16 }}>
                                        <RideCard ride={booking.ride} />
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--color-bg)',
                                            borderRadius: '0 0 12px 12px',
                                            marginTop: -8
                                        }}>
                                            <span className={`badge ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
