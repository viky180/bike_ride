import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase, Ride } from '../lib/supabase'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { DestinationTabs } from '../components/DestinationSelector'
import { RideCard } from '../components/RideCard'

// Simple offline cache hook
function useOfflineCache() {
    const CACHE_KEY = 'gramin_sawari_rides_cache'

    const cacheRides = (rides: Ride[]) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rides, timestamp: Date.now() }))
        } catch (e) {
            console.warn('Failed to cache rides:', e)
        }
    }

    const getCachedRides = (): Ride[] | null => {
        try {
            const stored = localStorage.getItem(CACHE_KEY)
            if (!stored) return null
            const data = JSON.parse(stored)
            // Cache expires after 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) return null
            return data.rides
        } catch {
            return null
        }
    }

    return { cacheRides, getCachedRides }
}

export function FindRidePage() {
    const { t, user, showToast, isOnline } = useApp()
    const { cacheRides, getCachedRides } = useOfflineCache()

    const [rides, setRides] = useState<Ride[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string | null>(null)
    const [requestingId, setRequestingId] = useState<string | null>(null)

    useEffect(() => {
        fetchRides()
    }, [])

    const fetchRides = async () => {
        setLoading(true)
        try {
            if (!isOnline) {
                const cached = getCachedRides()
                if (cached) {
                    setRides(cached)
                }
                setLoading(false)
                return
            }

            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('rides')
                .select(`
          *,
          driver:users!driver_id(id, name, phone)
        `)
                .eq('status', 'open')
                .gt('departure_time', now)
                .gt('available_seats', 0)
                .order('departure_time', { ascending: true })

            if (error) throw error

            const ridesData = (data || []) as Ride[]
            setRides(ridesData)
            cacheRides(ridesData)
        } catch (error) {
            console.error('Error fetching rides:', error)
            // Try cache on error
            const cached = getCachedRides()
            if (cached) setRides(cached)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestRide = async (rideId: string) => {
        if (!user) return

        setRequestingId(rideId)
        try {
            // Check if already booked
            const { data: existing } = await supabase
                .from('bookings')
                .select('id')
                .eq('ride_id', rideId)
                .eq('rider_id', user.id)
                .single()

            if (existing) {
                showToast(t('ride_requested'))
                return
            }

            const { error } = await supabase
                .from('bookings')
                .insert({
                    ride_id: rideId,
                    rider_id: user.id,
                    status: 'pending'
                })

            if (error) throw error

            showToast(t('ride_requested'))
            fetchRides() // Refresh list
        } catch (error) {
            console.error('Error requesting ride:', error)
        } finally {
            setRequestingId(null)
        }
    }

    const filteredRides = filter
        ? rides.filter(r => r.destination === filter)
        : rides

    return (
        <div className="app">
            <Header title={t('find_ride')} showBack />

            <div className="page">
                {/* Destination filter tabs */}
                <DestinationTabs
                    selected={filter}
                    onSelect={setFilter}
                />

                {/* Loading state */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredRides.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">🔍</div>
                        <p>{t('no_rides')}</p>
                    </div>
                )}

                {/* Ride list */}
                {!loading && filteredRides.map(ride => (
                    <RideCard
                        key={ride.id}
                        ride={ride}
                        onAction={() => handleRequestRide(ride.id)}
                        actionLabel={t('request_ride')}
                        actionDisabled={requestingId === ride.id || ride.driver_id === user?.id}
                    />
                ))}
            </div>

            <BottomNav />
        </div>
    )
}
