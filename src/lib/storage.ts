import { useState, useEffect } from 'react'
import { Ride } from './supabase'

const CACHE_KEY = 'gramin_sawari_rides_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

interface CachedData {
    rides: Ride[]
    timestamp: number
}

export function useOfflineCache() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const cacheRides = (rides: Ride[]) => {
        try {
            const data: CachedData = {
                rides,
                timestamp: Date.now()
            }
            localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        } catch (e) {
            console.warn('Failed to cache rides:', e)
        }
    }

    const getCachedRides = (): Ride[] | null => {
        try {
            const stored = localStorage.getItem(CACHE_KEY)
            if (!stored) return null

            const data: CachedData = JSON.parse(stored)

            // Check if cache is expired
            if (Date.now() - data.timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(CACHE_KEY)
                return null
            }

            return data.rides
        } catch (e) {
            console.warn('Failed to get cached rides:', e)
            return null
        }
    }

    return { isOnline, cacheRides, getCachedRides }
}

// User storage
const USER_KEY = 'gramin_sawari_user'

export interface StoredUser {
    id: string
    phone: string
    name: string
    is_driver: boolean
}

export function getStoredUser(): StoredUser | null {
    try {
        const stored = localStorage.getItem(USER_KEY)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

export function setStoredUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
    localStorage.removeItem(USER_KEY)
}

// App Mode storage
const MODE_KEY = 'gramin_sawari_mode'

export type AppMode = 'ride' | 'produce'

export function getStoredMode(): AppMode | null {
    try {
        const stored = localStorage.getItem(MODE_KEY)
        if (stored === 'ride' || stored === 'produce') {
            return stored
        }
        return null
    } catch {
        return null
    }
}

export function setStoredMode(mode: AppMode): void {
    localStorage.setItem(MODE_KEY, mode)
}
