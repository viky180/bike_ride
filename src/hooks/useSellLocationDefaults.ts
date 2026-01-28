import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getShopByUserId } from '../lib/supabase'
import { getStoredPincode } from '../lib/storage'

interface SellLocationDefaultsParams {
    location: string
    setLocation: (value: string) => void
    pincode: string
    setPincode: (value: string) => void
    // Optional phone auto-fill support
    phone?: string
    setPhone?: (value: string) => void
}

export type SellLocationSource = 'shop' | 'location' | null

export function useSellLocationDefaults({
    location,
    setLocation,
    pincode,
    setPincode,
    phone,
    setPhone
}: SellLocationDefaultsParams) {
    const { user } = useAuth()
    const locationRef = useRef(location)
    const pincodeRef = useRef(pincode)
    const phoneRef = useRef(phone)
    const [source, setSource] = useState<SellLocationSource>(null)

    useEffect(() => {
        locationRef.current = location
    }, [location])

    useEffect(() => {
        pincodeRef.current = pincode
    }, [pincode])

    useEffect(() => {
        phoneRef.current = phone
    }, [phone])

    useEffect(() => {
        if (!user) return

        const storedPincode = getStoredPincode()
        let isCancelled = false

        const applyDefaults = async () => {
            if (user.seller_type === 'shopkeeper') {
                const shop = await getShopByUserId(user.id)
                if (isCancelled) return

                if (shop) {
                    if (!locationRef.current && shop.location) {
                        setLocation(shop.location)
                    }

                    const preferredPincode = shop.pincode || storedPincode
                    if (!pincodeRef.current && preferredPincode) {
                        setPincode(preferredPincode)
                    }

                    // Auto-fill phone from shop owner
                    if (setPhone && !phoneRef.current && shop.owner?.phone) {
                        setPhone(shop.owner.phone)
                    }

                    setSource('shop')
                    return
                }
            }

            // Fallback: use user's phone if available
            if (setPhone && !phoneRef.current && user.phone) {
                setPhone(user.phone)
            }

            if (!pincodeRef.current && storedPincode) {
                setPincode(storedPincode)
            }
            setSource(storedPincode ? 'location' : null)
        }

        applyDefaults()

        return () => {
            isCancelled = true
        }
    }, [user?.id, user?.seller_type, user?.phone, setLocation, setPincode, setPhone])

    return { source }
}