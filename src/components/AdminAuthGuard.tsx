/**
 * AdminAuthGuard Component
 * 
 * Route protection component that ensures only verified admins
 * can access protected admin pages. Handles:
 * - Authentication state checking
 * - Admin role verification
 * - Session validation
 * - Session expiry warnings
 */

import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdmin } from '../hooks/useAdmin'
import { formatSessionTime } from '../lib/adminConfig'

interface AdminAuthGuardProps {
    children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isAuthLoading } = useAuth()
    const {
        isAdmin,
        isVerified,
        isLoading,
        timeUntilExpiry,
        isSessionWarning,
        clearAdminSession,
        updateActivity
    } = useAdmin()
    const [showExpiryWarning, setShowExpiryWarning] = useState(false)

    // Track user activity to extend session
    useEffect(() => {
        if (!isVerified) return

        const handleActivity = () => {
            updateActivity()
        }

        // Update session on user activity
        window.addEventListener('click', handleActivity)
        window.addEventListener('keypress', handleActivity)

        return () => {
            window.removeEventListener('click', handleActivity)
            window.removeEventListener('keypress', handleActivity)
        }
    }, [isVerified, updateActivity])

    // Handle session warning display
    useEffect(() => {
        setShowExpiryWarning(isSessionWarning)
    }, [isSessionWarning])

    // Handle session expiry
    useEffect(() => {
        if (timeUntilExpiry === 0 && isVerified) {
            clearAdminSession()
            navigate('/admin', { replace: true })
        }
    }, [timeUntilExpiry, isVerified, clearAdminSession, navigate])

    // Loading state
    if (isAuthLoading || isLoading) {
        return (
            <div className="app">
                <div className="page" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        padding: 40,
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: 48,
                            marginBottom: 16,
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            🔐
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: 16 }}>
                            Verifying admin access...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Not logged in at all
    if (!user) {
        // Store intended destination for redirect after login
        const returnPath = location.pathname
        navigate('/login', { state: { returnTo: returnPath }, replace: true })
        return null
    }

    // Logged in but not an admin
    if (!isAdmin) {
        return (
            <div className="app">
                <div className="page" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                    padding: 24
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        padding: 40,
                        textAlign: 'center',
                        maxWidth: 400
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
                        <h2 style={{ color: '#fecaca', marginBottom: 12, fontSize: 24 }}>
                            Access Denied
                        </h2>
                        <p style={{ color: '#fca5a5', marginBottom: 24 }}>
                            You don't have permission to access the admin panel.
                            This area is restricted to authorized administrators only.
                        </p>
                        <button
                            onClick={() => navigate('/', { replace: true })}
                            style={{
                                padding: '12px 32px',
                                background: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: 8,
                                color: 'white',
                                fontSize: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ← Go Back Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Admin but session not verified (needs re-authentication)
    if (!isVerified) {
        // Will show admin verification UI in the parent component
        return null
    }

    // Verified admin - show content with session warning if needed
    return (
        <>
            {/* Session Expiry Warning Banner */}
            {showExpiryWarning && timeUntilExpiry !== null && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 12,
                    zIndex: 9999,
                    fontSize: 14,
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <span>⚠️</span>
                    <span>
                        Session expiring in {formatSessionTime(timeUntilExpiry)}.
                        Your activity will extend the session.
                    </span>
                </div>
            )}

            {/* Admin Content */}
            <div style={{ paddingTop: showExpiryWarning ? 44 : 0 }}>
                {children}
            </div>
        </>
    )
}
