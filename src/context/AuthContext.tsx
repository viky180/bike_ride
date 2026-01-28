import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth, signOutUser } from '../lib/firebase'
import { supabase, isSupabaseConfigured, User } from '../lib/supabase'

const SUPABASE_USER_ID_KEY = 'junction_supabase_user_id'

interface AuthContextType {
    // Firebase auth state
    firebaseUser: FirebaseUser | null
    isAuthLoading: boolean

    // Supabase user data
    user: User | null

    // Auth actions
    signOut: () => Promise<void>
    setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
    const [user, setUserState] = useState<User | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    // Wrap setUser to also persist user ID
    const setUser = (newUser: User | null) => {
        setUserState(newUser)
        if (newUser?.id) {
            localStorage.setItem(SUPABASE_USER_ID_KEY, newUser.id)
        } else {
            localStorage.removeItem(SUPABASE_USER_ID_KEY)
        }
    }

    // Listen for Firebase auth state changes
    useEffect(() => {
        if (!auth) {
            setIsAuthLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser)

            if (fbUser && isSupabaseConfigured) {
                // Try to fetch user from Supabase by phone number first
                const phoneNumber = fbUser.phoneNumber?.replace('+91', '') || ''
                if (phoneNumber) {
                    try {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('phone', phoneNumber)
                            .single()

                        if (data) {
                            setUser(data)
                            setIsAuthLoading(false)
                            return
                        }
                    } catch (error) {
                        // User not found by phone
                    }
                }

                // For Google users (no phone in Firebase), try to fetch by Firebase UID
                const firebaseUid = fbUser.uid
                if (firebaseUid) {
                    try {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('firebase_uid', firebaseUid)
                            .single()

                        if (data) {
                            setUser(data)
                            setIsAuthLoading(false)
                            return
                        }
                    } catch (error) {
                        // User not found by Firebase UID
                        console.log('User not found in Supabase by Firebase UID')
                    }
                }

                // Fallback: try to fetch by stored user ID (for backwards compatibility)
                const storedUserId = localStorage.getItem(SUPABASE_USER_ID_KEY)
                if (storedUserId) {
                    try {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', storedUserId)
                            .single()

                        if (data) {
                            // If found by stored ID but missing firebase_uid, update it
                            if (!data.firebase_uid && firebaseUid) {
                                await supabase
                                    .from('users')
                                    .update({ firebase_uid: firebaseUid })
                                    .eq('id', data.id)
                                data.firebase_uid = firebaseUid
                            }
                            setUser(data)
                            setIsAuthLoading(false)
                            return
                        }
                    } catch (error) {
                        // User not found by ID
                        console.log('User not found in Supabase by stored ID')
                    }
                }

                // User not found - will need to create profile
                console.log('User not found in Supabase, needs to create profile')
            } else {
                setUser(null)
            }

            setIsAuthLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await signOutUser()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            firebaseUser,
            isAuthLoading,
            user,
            signOut: handleSignOut,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
