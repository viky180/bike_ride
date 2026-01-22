import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to protect actions that require authentication.
 * Returns isAuthenticated status and a requireAuth function
 * that redirects to login if user is not authenticated.
 */
export function useRequireAuth() {
    const { firebaseUser, isAuthLoading } = useAuth()
    const navigate = useNavigate()

    const isAuthenticated = !!firebaseUser

    /**
     * Call this before performing protected actions.
     * Returns true if authenticated, false if redirected to login.
     */
    const requireAuth = (): boolean => {
        if (!isAuthenticated) {
            navigate('/login')
            return false
        }
        return true
    }

    return {
        isAuthenticated,
        isAuthLoading,
        requireAuth
    }
}
