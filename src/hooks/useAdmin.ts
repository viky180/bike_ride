/**
 * useAdmin Hook
 * 
 * Custom hook for admin authentication state management.
 * Handles session verification, activity tracking, and audit logging.
 * 
 * SECURITY: Admin status is now determined by the `is_admin` column
 * in the database, NOT by a frontend phone whitelist.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminConfig } from '../lib/adminConfig'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AdminSession {
    isAdmin: boolean
    isVerified: boolean
    sessionExpiresAt: number | null
    lastActivity: number | null
}

interface UseAdminReturn extends AdminSession {
    isLoading: boolean
    verifyAdminSession: () => Promise<boolean>
    clearAdminSession: () => Promise<void>
    updateActivity: () => void
    logAdminAction: (
        action: string,
        targetType: string | null,
        targetId: string | null,
        details: Record<string, unknown>
    ) => Promise<void>
    timeUntilExpiry: number | null
    isSessionWarning: boolean
}

const ADMIN_SESSION_KEY = 'admin_session_v2'

export function useAdmin(): UseAdminReturn {
    const { user, firebaseUser } = useAuth()
    const [adminSession, setAdminSession] = useState<AdminSession>({
        isAdmin: false,
        isVerified: false,
        sessionExpiresAt: null,
        lastActivity: null,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
    const expiryIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Check admin status on mount and when user changes
    // SECURITY: Uses database is_admin flag instead of frontend phone check
    useEffect(() => {
        const checkAdminStatus = async () => {
            setIsLoading(true)

            if (!user || !firebaseUser) {
                setAdminSession({
                    isAdmin: false,
                    isVerified: false,
                    sessionExpiresAt: null,
                    lastActivity: null,
                })
                setIsLoading(false)
                return
            }

            // SECURITY: Check admin status from database, not frontend whitelist
            const isAdmin = user.is_admin === true

            if (isAdmin) {
                // Check for existing valid session in localStorage
                try {
                    const storedSession = localStorage.getItem(ADMIN_SESSION_KEY)
                    if (storedSession) {
                        const session = JSON.parse(storedSession)
                        const now = Date.now()

                        // Validate session: not expired and matches current user
                        if (
                            session.expiresAt > now &&
                            session.phone === user.phone &&
                            session.userId === user.id
                        ) {
                            setAdminSession({
                                isAdmin: true,
                                isVerified: true,
                                sessionExpiresAt: session.expiresAt,
                                lastActivity: session.lastActivity,
                            })
                            setIsLoading(false)
                            return
                        } else {
                            // Session expired or invalid, clear it
                            localStorage.removeItem(ADMIN_SESSION_KEY)
                        }
                    }
                } catch (error) {
                    console.error('Error parsing admin session:', error)
                    localStorage.removeItem(ADMIN_SESSION_KEY)
                }

                // Admin but no valid session - needs verification
                setAdminSession({
                    isAdmin: true,
                    isVerified: false,
                    sessionExpiresAt: null,
                    lastActivity: null,
                })
            } else {
                // Not an admin (based on database is_admin flag)
                setAdminSession({
                    isAdmin: false,
                    isVerified: false,
                    sessionExpiresAt: null,
                    lastActivity: null,
                })
            }

            setIsLoading(false)
        }

        checkAdminStatus()
    }, [user, firebaseUser])

    // Update time until expiry every second
    useEffect(() => {
        if (adminSession.sessionExpiresAt && adminSession.isVerified) {
            const updateExpiry = () => {
                const remaining = Math.max(0, adminSession.sessionExpiresAt! - Date.now())
                setTimeUntilExpiry(remaining)

                // Auto-logout when session expires
                if (remaining === 0) {
                    clearAdminSession()
                }
            }

            updateExpiry()
            expiryIntervalRef.current = setInterval(updateExpiry, 1000)

            return () => {
                if (expiryIntervalRef.current) {
                    clearInterval(expiryIntervalRef.current)
                }
            }
        } else {
            setTimeUntilExpiry(null)
        }
    }, [adminSession.sessionExpiresAt, adminSession.isVerified])

    // Log admin action to database
    const logAdminAction = useCallback(async (
        action: string,
        targetType: string | null,
        targetId: string | null,
        details: Record<string, unknown>
    ) => {
        if (!user || !isSupabaseConfigured) return

        try {
            await supabase.from('admin_audit_logs').insert({
                admin_id: user.id,
                action,
                target_type: targetType,
                target_id: targetId,
                details,
                user_agent: navigator.userAgent,
            })
        } catch (error) {
            console.error('Failed to log admin action:', error)
        }
    }, [user])

    // Verify and create admin session
    const verifyAdminSession = useCallback(async (): Promise<boolean> => {
        if (!user) return false

        // Double-check admin status from database before creating session
        if (!user.is_admin) {
            console.warn('User is not an admin in database')
            return false
        }

        const now = Date.now()
        const expiresAt = now + adminConfig.sessionDuration

        const session = {
            phone: user.phone,
            userId: user.id,
            expiresAt,
            lastActivity: now,
            createdAt: now,
        }

        try {
            // Store session in localStorage
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))

            // Log admin login
            await logAdminAction('admin_login', 'session', null, {
                loginTime: new Date(now).toISOString(),
                sessionDuration: adminConfig.sessionDuration,
            })

            setAdminSession({
                isAdmin: true,
                isVerified: true,
                sessionExpiresAt: expiresAt,
                lastActivity: now,
            })

            return true
        } catch (error) {
            console.error('Failed to create admin session:', error)
            return false
        }
    }, [user, logAdminAction])

    // Update activity timestamp (extends session on activity)
    const updateActivity = useCallback(() => {
        if (!adminSession.isVerified || !user) return

        const now = Date.now()
        const newExpiry = now + adminConfig.sessionDuration

        const session = {
            phone: user.phone,
            userId: user.id,
            expiresAt: newExpiry,
            lastActivity: now,
            createdAt: adminSession.lastActivity, // Keep original creation time
        }

        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))

        setAdminSession(prev => ({
            ...prev,
            sessionExpiresAt: newExpiry,
            lastActivity: now,
        }))
    }, [adminSession.isVerified, adminSession.lastActivity, user])

    // Clear admin session (logout)
    const clearAdminSession = useCallback(async () => {
        try {
            await logAdminAction('admin_logout', 'session', null, {
                logoutTime: new Date().toISOString(),
            })
        } catch (error) {
            console.error('Failed to log admin logout:', error)
        }

        localStorage.removeItem(ADMIN_SESSION_KEY)

        setAdminSession({
            isAdmin: adminSession.isAdmin, // Keep admin status, just clear verification
            isVerified: false,
            sessionExpiresAt: null,
            lastActivity: null,
        })

        setTimeUntilExpiry(null)
    }, [logAdminAction, adminSession.isAdmin])

    // Check if we're in warning period
    const isSessionWarning = timeUntilExpiry !== null &&
        timeUntilExpiry > 0 &&
        timeUntilExpiry < adminConfig.sessionWarning

    return {
        ...adminSession,
        isLoading,
        verifyAdminSession,
        clearAdminSession,
        updateActivity,
        logAdminAction,
        timeUntilExpiry,
        isSessionWarning,
    }
}
