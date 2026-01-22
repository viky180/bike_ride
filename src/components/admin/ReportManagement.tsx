/**
 * Report Management Component
 * 
 * Admin interface for managing product and request reports.
 * Allows viewing, filtering, and taking action on reports.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured, ProductReport, Product, ProductRequest, User } from '../../lib/supabase'
import { useAdmin } from '../../hooks/useAdmin'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../lib/categories'

interface ReportWithDetails extends ProductReport {
    reporter?: User
    product?: Product
    request?: ProductRequest
}

const REPORT_REASONS: Record<string, { en: string; hi: string }> = {
    'illegal': { en: 'Illegal product', hi: 'अवैध उत्पाद' },
    'fraud': { en: 'Fraudulent listing', hi: 'धोखाधड़ी वाली लिस्टिंग' },
    'inappropriate': { en: 'Inappropriate content', hi: 'अनुचित सामग्री' },
    'spam': { en: 'Spam/duplicate', hi: 'स्पैम/डुप्लीकेट' },
    'other': { en: 'Other', hi: 'अन्य' }
}

export function ReportManagement() {
    const navigate = useNavigate()
    const { language } = useApp()
    const { logAdminAction } = useAdmin()
    const [reports, setReports] = useState<ReportWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('pending')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [actionConfirm, setActionConfirm] = useState<{ id: string; action: string } | null>(null)
    const [adminNotes, setAdminNotes] = useState<string>('')

    useEffect(() => {
        loadReports()
        logAdminAction('view_report_management', null, null, {})
    }, [])

    const loadReports = async () => {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('product_reports')
                .select(`
                    *,
                    reporter:users!reporter_id(id, name, phone)
                `)
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error

            // Fetch related products/requests for each report
            const reportsWithDetails: ReportWithDetails[] = []
            for (const report of (data || [])) {
                let product = undefined
                let request = undefined

                if (report.target_type === 'product') {
                    const { data: productData } = await supabase
                        .from('products')
                        .select('*, seller:users!seller_id(id, name, phone)')
                        .eq('id', report.target_id)
                        .single()
                    product = productData
                } else if (report.target_type === 'request') {
                    const { data: requestData } = await supabase
                        .from('product_requests')
                        .select('*, buyer:users!buyer_id(id, name, phone)')
                        .eq('id', report.target_id)
                        .single()
                    request = requestData
                }

                reportsWithDetails.push({
                    ...report,
                    product,
                    request
                })
            }

            setReports(reportsWithDetails)
        } catch (error) {
            console.error('Error loading reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (reportId: string, newStatus: string, deleteTarget: boolean = false) => {
        try {
            // Update report status
            const { error } = await supabase
                .from('product_reports')
                .update({
                    status: newStatus,
                    admin_notes: adminNotes || null,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', reportId)

            if (error) throw error

            // If actioned and deleteTarget is true, delete the product/request
            if (deleteTarget) {
                const report = reports.find(r => r.id === reportId)
                if (report) {
                    if (report.target_type === 'product') {
                        await supabase.from('products').delete().eq('id', report.target_id)
                    } else if (report.target_type === 'request') {
                        await supabase.from('product_requests').delete().eq('id', report.target_id)
                    }
                }
            }

            await logAdminAction('update_report_status', 'report', reportId, {
                newStatus,
                deleteTarget,
                adminNotes
            })

            // Refresh reports
            await loadReports()
            setActionConfirm(null)
            setAdminNotes('')
        } catch (error) {
            console.error('Error updating report:', error)
            alert('Failed to update report')
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId)
    }

    const getReasonLabel = (reasonId: string) => {
        const reason = REPORT_REASONS[reasonId]
        return reason ? (language === 'hi' ? reason.hi : reason.en) : reasonId
    }

    const filteredReports = reports.filter(report => {
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter
        const matchesType = typeFilter === 'all' || report.target_type === typeFilter
        return matchesStatus && matchesType
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            reviewed: { bg: '#dbeafe', color: '#1d4ed8' },
            dismissed: { bg: '#f3f4f6', color: '#6b7280' },
            actioned: { bg: '#dcfce7', color: '#166534' }
        }
        const style = styles[status] || styles.pending
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                background: style.bg,
                color: style.color,
                textTransform: 'uppercase'
            }}>
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: '#6b7280' }}>
                    {language === 'hi' ? 'रिपोर्ट्स लोड हो रही हैं...' : 'Loading reports...'}
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Filters */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontSize: 13
                        }}
                    >
                        <option value="all">{language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
                        <option value="pending">{language === 'hi' ? 'लंबित' : 'Pending'}</option>
                        <option value="reviewed">{language === 'hi' ? 'समीक्षित' : 'Reviewed'}</option>
                        <option value="dismissed">{language === 'hi' ? 'खारिज' : 'Dismissed'}</option>
                        <option value="actioned">{language === 'hi' ? 'कार्रवाई की गई' : 'Actioned'}</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontSize: 13
                        }}
                    >
                        <option value="all">{language === 'hi' ? 'सभी प्रकार' : 'All Types'}</option>
                        <option value="product">{language === 'hi' ? 'उत्पाद' : 'Products'}</option>
                        <option value="request">{language === 'hi' ? 'अनुरोध' : 'Requests'}</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                {language === 'hi'
                    ? `${filteredReports.length} रिपोर्ट्स मिलीं`
                    : `${filteredReports.length} reports found`}
            </div>

            {/* Reports List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredReports.map(report => {
                    const targetName = report.product?.name || report.request?.product_name || 'Unknown'
                    const category = getCategoryInfo(
                        report.product?.category || report.request?.category || ''
                    )

                    return (
                        <div
                            key={report.id}
                            style={{
                                background: 'white',
                                borderRadius: 10,
                                border: report.status === 'pending'
                                    ? '2px solid #fbbf24'
                                    : '1px solid #e5e7eb',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Report Header */}
                            <div style={{
                                padding: 12,
                                background: report.status === 'pending' ? '#fffbeb' : '#f9fafb',
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>🚩</span>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                                            {report.target_type === 'product'
                                                ? (language === 'hi' ? 'उत्पाद रिपोर्ट' : 'Product Report')
                                                : (language === 'hi' ? 'अनुरोध रिपोर्ट' : 'Request Report')}
                                        </div>
                                        <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                            {formatDate(report.created_at)}
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(report.status)}
                            </div>

                            {/* Target Info */}
                            <div style={{ padding: 12 }}>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                    <div style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 8,
                                        background: '#f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {report.product?.image_urls?.[0] ? (
                                            <img
                                                src={report.product.image_urls[0]}
                                                alt={targetName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: 20 }}>{category?.icon || '📦'}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                                            {targetName}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                                            {category?.icon} {language === 'hi' ? category?.hi : category?.en}
                                        </div>
                                        {report.product?.price && (
                                            <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                                                {report.product.price}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Report Reason */}
                                <div style={{
                                    background: '#fef2f2',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginBottom: 10
                                }}>
                                    <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 4 }}>
                                        {language === 'hi' ? 'कारण:' : 'Reason:'}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#dc2626' }}>
                                        {getReasonLabel(report.reason)}
                                    </div>
                                    {report.description && (
                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                                            "{report.description}"
                                        </div>
                                    )}
                                </div>

                                {/* Reporter Info */}
                                {report.reporter && (
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                                        <span>{language === 'hi' ? 'द्वारा रिपोर्ट:' : 'Reported by:'} </span>
                                        <strong>{report.reporter.name}</strong>
                                        <span style={{ marginLeft: 4 }}>({report.reporter.phone})</span>
                                    </div>
                                )}

                                {/* Admin Notes (if any) */}
                                {report.admin_notes && (
                                    <div style={{
                                        background: '#f0fdf4',
                                        borderRadius: 8,
                                        padding: 10,
                                        marginBottom: 10,
                                        fontSize: 12
                                    }}>
                                        <div style={{ color: '#166534', fontWeight: 600, marginBottom: 4 }}>
                                            Admin Notes:
                                        </div>
                                        <div style={{ color: '#15803d' }}>{report.admin_notes}</div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {report.status === 'pending' && (
                                <div style={{
                                    padding: 12,
                                    borderTop: '1px solid #f3f4f6',
                                    background: '#fafafa'
                                }}>
                                    {actionConfirm?.id === report.id ? (
                                        <div>
                                            <textarea
                                                placeholder={language === 'hi' ? 'एडमिन नोट्स (वैकल्पिक)' : 'Admin notes (optional)'}
                                                value={adminNotes}
                                                onChange={e => setAdminNotes(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: 8,
                                                    borderRadius: 6,
                                                    border: '1px solid #e5e7eb',
                                                    fontSize: 12,
                                                    marginBottom: 8,
                                                    resize: 'vertical',
                                                    minHeight: 60
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {actionConfirm.action === 'dismiss' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            background: '#6b7280',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            fontSize: 12,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {language === 'hi' ? 'खारिज करें' : 'Dismiss'}
                                                    </button>
                                                )}
                                                {actionConfirm.action === 'action' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'actioned', true)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            background: '#dc2626',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            fontSize: 12,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {language === 'hi' ? 'हटाएं' : 'Delete Target'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setActionConfirm(null)
                                                        setAdminNotes('')
                                                    }}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#e5e7eb',
                                                        color: '#374151',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontSize: 12,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => {
                                                    if (report.target_type === 'product' && report.product) {
                                                        navigate(`/product/${report.target_id}`)
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    background: '#eff6ff',
                                                    color: '#1d4ed8',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                👁️ {language === 'hi' ? 'देखें' : 'View'}
                                            </button>
                                            <button
                                                onClick={() => setActionConfirm({ id: report.id, action: 'dismiss' })}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    background: '#f3f4f6',
                                                    color: '#6b7280',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✗ {language === 'hi' ? 'खारिज' : 'Dismiss'}
                                            </button>
                                            <button
                                                onClick={() => setActionConfirm({ id: report.id, action: 'action' })}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}

                {filteredReports.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: '#9ca3af'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                        <p>{language === 'hi' ? 'कोई रिपोर्ट नहीं मिली' : 'No reports found'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
