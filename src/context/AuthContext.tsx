import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth, signOutUser } from '../lib/firebase'
import { supabase, isSupabaseConfigured, User } from '../lib/supabase'

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
    const [user, setUser] = useState<User | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    // Listen for Firebase auth state changes
    useEffect(() => {
        if (!auth) {
            setIsAuthLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser)

            if (fbUser && isSupabaseConfigured) {
                // Try to fetch user from Supabase by phone number
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
                        }
                    } catch (error) {
                        // User not found in Supabase - will need to create profile
                        console.log('User not found in Supabase, needs to create profile')
                    }
                }
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
