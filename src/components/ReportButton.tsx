/**
 * Report Button Component
 * 
 * Allows users to report illegal or inappropriate products/requests.
 * Shows a modal with report reason selection and optional description.
 */

import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface ReportButtonProps {
    targetType: 'product' | 'request'
    targetId: string
    targetName: string
    compact?: boolean
}

const REPORT_REASONS = [
    { id: 'illegal', en: 'Illegal product', hi: 'अवैध उत्पाद' },
    { id: 'fraud', en: 'Fraudulent listing', hi: 'धोखाधड़ी वाली लिस्टिंग' },
    { id: 'inappropriate', en: 'Inappropriate content', hi: 'अनुचित सामग्री' },
    { id: 'spam', en: 'Spam/duplicate', hi: 'स्पैम/डुप्लीकेट' },
    { id: 'other', en: 'Other', hi: 'अन्य' }
]

export function ReportButton({ targetType, targetId, targetName, compact = false }: ReportButtonProps) {
    const { language } = useApp()
    const { user } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const [selectedReason, setSelectedReason] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError(language === 'hi' ? 'कृपया कारण चुनें' : 'Please select a reason')
            return
        }

        if (!isSupabaseConfigured) {
            setError('Database not configured')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('product_reports')
                .insert({
                    reporter_id: user?.id || null,
                    target_type: targetType,
                    target_id: targetId,
                    reason: selectedReason,
                    description: description.trim() || null,
                    status: 'pending'
                })

            if (insertError) throw insertError

            setSubmitted(true)
            setTimeout(() => {
                setShowModal(false)
                setSubmitted(false)
                setSelectedReason('')
                setDescription('')
            }, 2000)
        } catch (err) {
            console.error('Error submitting report:', err)
            setError(language === 'hi' ? 'रिपोर्ट सबमिट करने में विफल' : 'Failed to submit report')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setShowModal(false)
        setError('')
        setSelectedReason('')
        setDescription('')
    }

    return (
        <>
            {/* Report Button */}
            <button
                onClick={() => setShowModal(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: compact ? 0 : 6,
                    padding: compact ? '6px 10px' : '10px 16px',
                    borderRadius: compact ? 8 : 10,
                    border: 'none',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: compact ? 11 : 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                🚩 {!compact && (language === 'hi' ? 'रिपोर्ट' : 'Report')}
            </button>

            {/* Report Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 16
                    }}
                    onClick={handleClose}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 16,
                            width: '100%',
                            maxWidth: 360,
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                                🚩 {language === 'hi' ? 'रिपोर्ट करें' : 'Report'}
                            </h3>
                            <button
                                onClick={handleClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 20,
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: 4
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: 20 }}>
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                                    <p style={{ color: '#059669', fontWeight: 600 }}>
                                        {language === 'hi' ? 'रिपोर्ट सबमिट हो गई!' : 'Report submitted!'}
                                    </p>
                                    <p style={{ color: '#6b7280', fontSize: 13 }}>
                                        {language === 'hi'
                                            ? 'हम इसकी समीक्षा करेंगे।'
                                            : 'We will review it shortly.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Target Info */}
                                    <div style={{
                                        background: '#f9fafb',
                                        borderRadius: 10,
                                        padding: 12,
                                        marginBottom: 16
                                    }}>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                                            {language === 'hi'
                                                ? (targetType === 'product' ? 'उत्पाद:' : 'अनुरोध:')
                                                : (targetType === 'product' ? 'Product:' : 'Request:')}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                                            {targetName}
                                        </div>
                                    </div>

                                    {/* Reason Selection */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                            color: '#374151'
                                        }}>
                                            {language === 'hi' ? 'कारण चुनें *' : 'Select reason *'}
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {REPORT_REASONS.map(reason => (
                                                <button
                                                    key={reason.id}
                                                    onClick={() => setSelectedReason(reason.id)}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: 8,
                                                        border: selectedReason === reason.id
                                                            ? '2px solid #dc2626'
                                                            : '1px solid #e5e7eb',
                                                        background: selectedReason === reason.id
                                                            ? '#fef2f2'
                                                            : 'white',
                                                        color: selectedReason === reason.id
                                                            ? '#dc2626'
                                                            : '#374151',
                                                        fontSize: 13,
                                                        fontWeight: selectedReason === reason.id ? 600 : 400,
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {language === 'hi' ? reason.hi : reason.en}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description (Optional) */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                            color: '#374151'
                                        }}>
                                            {language === 'hi' ? 'विवरण (वैकल्पिक)' : 'Description (optional)'}
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder={language === 'hi'
                                                ? 'अधिक जानकारी दें...'
                                                : 'Provide more details...'}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: 8,
                                                border: '1px solid #e5e7eb',
                                                fontSize: 13,
                                                resize: 'vertical',
                                                minHeight: 80,
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div style={{
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            marginBottom: 16
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: 10,
                                            border: 'none',
                                            background: submitting
                                                ? '#fca5a5'
                                                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                            color: 'white',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: submitting ? 'wait' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {submitting
                                            ? (language === 'hi' ? '⏳ सबमिट हो रहा है...' : '⏳ Submitting...')
                                            : (language === 'hi' ? 'रिपोर्ट सबमिट करें' : 'Submit Report')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
