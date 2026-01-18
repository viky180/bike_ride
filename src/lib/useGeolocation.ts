import { useState, useCallback } from 'react'

interface GeolocationState {
    pincode: string | null
    loading: boolean
    error: string | null
    permissionDenied: boolean
}

interface UseGeolocationReturn extends GeolocationState {
    detectLocation: () => Promise<void>
    clearError: () => void
}

// Reverse geocode coordinates to get pincode using Nominatim (OpenStreetMap)
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'GraminSawari/1.0'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Geocoding failed')
        }

        const data = await response.json()

        // Try to get postcode from address
        const postcode = data.address?.postcode

        if (postcode && /^\d{6}$/.test(postcode)) {
            return postcode
        }

        return null
    } catch (error) {
        console.error('Reverse geocoding error:', error)
        return null
    }
}

export function useGeolocation(): UseGeolocationReturn {
    const [state, setState] = useState<GeolocationState>({
        pincode: null,
        loading: false,
        error: null,
        permissionDenied: false
    })

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    const detectLocation = useCallback(async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
                loading: false
            }))
            return
        }

        setState(prev => ({ ...prev, loading: true, error: null, permissionDenied: false }))

        try {
            // Get current position
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false, // Use less accurate but faster method
                    timeout: 15000,
                    maximumAge: 300000 // Accept cached position up to 5 minutes old
                })
            })

            const { latitude, longitude } = position.coords

            // Reverse geocode to get pincode
            const pincode = await reverseGeocode(latitude, longitude)

            if (pincode) {
                setState({
                    pincode,
                    loading: false,
                    error: null,
                    permissionDenied: false
                })
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Could not detect pincode. Please enter manually.'
                }))
            }
        } catch (error: any) {
            let errorMessage = 'Failed to detect location'
            let permissionDenied = false

            if (error.code === 1) {
                // PERMISSION_DENIED
                errorMessage = 'Location permission denied. Please enter pincode manually.'
                permissionDenied = true
            } else if (error.code === 2) {
                // POSITION_UNAVAILABLE
                errorMessage = 'Location unavailable. Please enter pincode manually.'
            } else if (error.code === 3) {
                // TIMEOUT
                errorMessage = 'Location request timed out. Please try again or enter manually.'
            }

            setState({
                pincode: null,
                loading: false,
                error: errorMessage,
                permissionDenied
            })
        }
    }, [])

    return {
        ...state,
        detectLocation,
        clearError
    }
}
