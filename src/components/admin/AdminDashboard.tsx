/**
 * Admin Dashboard Component
 * 
 * Main admin dashboard showing statistics, quick actions,
 * and recent activity. Part of the secure admin panel.
 */

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../hooks/useAdmin'
import { useApp } from '../../context/AppContext'

interface DashboardStats {
    totalProducts: number
    activeProducts: number
    totalUsers: number
    totalRequests: number
    activeRequests: number
    pendingReports: number
    recentLogins: number
}

interface RecentActivity {
    id: string
    action: string
    target_type: string | null
    details: Record<string, unknown>
    created_at: string
}

export function AdminDashboard() {
    const { language } = useApp()
    const { logAdminAction } = useAdmin()
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        activeProducts: 0,
        totalUsers: 0,
        totalRequests: 0,
        activeRequests: 0,
        pendingReports: 0,
        recentLogins: 0,
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
        logAdminAction('view_dashboard', null, null, {})
    }, [])

    const loadDashboardData = async () => {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        try {
            // Fetch counts in parallel
            const [
                productsResult,
                activeProductsResult,
                usersResult,
                requestsResult,
                activeRequestsResult,
                pendingReportsResult,
                activityResult
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('product_requests').select('*', { count: 'exact', head: true }),
                supabase.from('product_requests').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('product_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
            ])

            setStats({
                totalProducts: productsResult.count || 0,
                activeProducts: activeProductsResult.count || 0,
                totalUsers: usersResult.count || 0,
                totalRequests: requestsResult.count || 0,
                activeRequests: activeRequestsResult.count || 0,
                pendingReports: pendingReportsResult.count || 0,
                recentLogins: 0,
            })

            if (activityResult.data) {
                setRecentActivity(activityResult.data)
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'admin_login': return '🔓'
            case 'admin_logout': return '🔒'
            case 'view_dashboard': return '📊'
            case 'delete_product': return '🗑️'
            case 'edit_product': return '✏️'
            case 'view_users': return '👥'
            default: return '📝'
        }
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: '#6b7280' }}>
                    {language === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading dashboard...'}
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 24
            }}>
                {/* Total Products */}
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: 12,
                    padding: 16,
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalProducts}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                        {language === 'hi' ? 'कुल उत्पाद' : 'Total Products'}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                        {stats.activeProducts} {language === 'hi' ? 'सक्रिय' : 'active'}
                    </div>
                </div>

                {/* Total Users */}
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: 12,
                    padding: 16,
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalUsers}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                        {language === 'hi' ? 'कुल उपयोगकर्ता' : 'Total Users'}
                    </div>
                </div>

                {/* Total Requests */}
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: 12,
                    padding: 16,
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalRequests}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                        {language === 'hi' ? 'कुल अनुरोध' : 'Total Requests'}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                        {stats.activeRequests} {language === 'hi' ? 'सक्रिय' : 'active'}
                    </div>
                </div>

                {/* Pending Reports */}
                <div style={{
                    background: stats.pendingReports > 0
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    borderRadius: 12,
                    padding: 16,
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                        {stats.pendingReports > 0 ? stats.pendingReports : '✓'}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                        {language === 'hi' ? 'लंबित रिपोर्ट्स' : 'Pending Reports'}
                    </div>
                    {stats.pendingReports > 0 && (
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                            🚩 {language === 'hi' ? 'समीक्षा करें' : 'Needs review'}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: 600,
                    fontSize: 14
                }}>
                    📋 {language === 'hi' ? 'हाल की गतिविधि' : 'Recent Activity'}
                </div>

                {recentActivity.length > 0 ? (
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {recentActivity.map(activity => (
                            <div
                                key={activity.id}
                                style={{
                                    padding: '10px 16px',
                                    borderBottom: '1px solid #f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12
                                }}
                            >
                                <span style={{ fontSize: 18 }}>
                                    {getActionIcon(activity.action)}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                                        {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                    {activity.target_type && (
                                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                                            {activity.target_type}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                    {formatDate(activity.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
                        {language === 'hi' ? 'कोई हाल की गतिविधि नहीं' : 'No recent activity'}
                    </div>
                )}
            </div>
        </div>
    )
}
