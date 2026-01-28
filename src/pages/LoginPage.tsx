import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { setupRecaptcha, sendOTP, verifyOTP, ConfirmationResult, RecaptchaVerifier, auth, signInWithGoogle } from '../lib/firebase'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AppIcon } from '../components/AppIcon'

type Step = 'phone' | 'otp' | 'name' | 'google_phone'

export function LoginPage() {
    const navigate = useNavigate()
    const { setUser } = useAuth()
    const { t } = useApp()

    const [step, setStep] = useState<Step>('phone')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(0)
    const [verifiedPhone, setVerifiedPhone] = useState('')
    const [googleUserName, setGoogleUserName] = useState('')
    const [googleFirebaseUid, setGoogleFirebaseUid] = useState('')
    const [googleLoginFailed, setGoogleLoginFailed] = useState(false)

    const confirmationResultRef = useRef<ConfirmationResult | null>(null)
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

    const normalizePhone = (value: string) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length >= 10) {
            return digits.slice(-10)
        }
        return ''
    }

    const canSendOtp = () => {
        const key = 'otp_send_history'
        const now = Date.now()
        const windowMs = 60 * 60 * 1000
        const cooldownMs = 60 * 1000
        const maxAttempts = 5

        let history: number[] = []
        try {
            history = JSON.parse(localStorage.getItem(key) || '[]')
        } catch (e) {
            history = []
        }

        history = history.filter((ts) => now - ts < windowMs)

        const lastAttempt = history.length ? history[history.length - 1] : 0
        if (now - lastAttempt < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - (now - lastAttempt)) / 1000)
            return { allowed: false, reason: `Please wait ${remaining}s before requesting another OTP.` }
        }

        if (history.length >= maxAttempts) {
            return { allowed: false, reason: 'Too many OTP requests. Please try again later.' }
        }

        history.push(now)
        localStorage.setItem(key, JSON.stringify(history))
        return { allowed: true }
    }

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear()
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        }
    }, [])

    const handleSendOTP = async () => {
        if (!phone || phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number')
            return
        }

        if (!auth) {
            setError('Firebase authentication is not configured.')
            return
        }

        const otpCheck = canSendOtp()
        if (!otpCheck.allowed) {
            setError(otpCheck.reason || 'Too many OTP requests. Please try again later.')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Clear any existing verifier before creating new one
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear()
                } catch (e) {
                    // Ignore
                }
                recaptchaVerifierRef.current = null
            }

            // Create a fresh reCAPTCHA verifier
            const verifier = setupRecaptcha('recaptcha-container')
            if (!verifier) {
                setError('Failed to initialize reCAPTCHA. Please refresh the page.')
                setLoading(false)
                return
            }
            recaptchaVerifierRef.current = verifier

            const result = await sendOTP(phone, verifier)
            if (result) {
                confirmationResultRef.current = result
                setStep('otp')
                setResendTimer(60)
            } else {
                setError('Failed to send OTP. Firebase auth may not be initialized.')
            }
        } catch (err: unknown) {
            console.error('Firebase OTP Error:', err)
            const error = err as { code?: string; message?: string }

            if (error.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format')
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.')
            } else if (error.code === 'auth/operation-not-allowed') {
                setError('Phone authentication is not enabled. Please enable it in Firebase Console.')
            } else if (error.code === 'auth/captcha-check-failed') {
                setError('reCAPTCHA verification failed. Please refresh the page.')
            } else if (error.code === 'auth/missing-phone-number') {
                setError('Please enter a valid phone number.')
            } else {
                // Show actual error message for debugging
                setError(`Error: ${error.message || error.code || 'Unknown error. Check console for details.'}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError('')
        setGoogleLoginFailed(false)

        try {
            const fbUser = await signInWithGoogle()
            if (!fbUser) {
                throw new Error('Google sign-in failed')
            }

            if (isSupabaseConfigured) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('firebase_uid', fbUser.uid)
                    .single()

                if (existingUser) {
                    setUser(existingUser)
                    navigate('/')
                    return
                }
            }

            const displayName = fbUser.displayName || ''
            const email = fbUser.email || ''
            setGoogleUserName(displayName || email || 'User')
            setGoogleFirebaseUid(fbUser.uid)
            setStep('google_phone')
        } catch (err: unknown) {
            console.error('Google sign-in error:', err)
            setGoogleLoginFailed(true)
            setError('Google login failed. Please use SMS login instead.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit OTP')
            return
        }

        if (!confirmationResultRef.current) {
            setError('Session expired. Please try again.')
            setStep('phone')
            return
        }

        setLoading(true)
        setError('')

        try {
            const fbUser = await verifyOTP(confirmationResultRef.current, otp)
            const verified = fbUser.phoneNumber ? normalizePhone(fbUser.phoneNumber) : ''
            if (!verified) {
                setError('Unable to verify phone number. Please try again.')
                setStep('phone')
                return
            }

            setVerifiedPhone(verified)
            setPhone(verified)

            // Check if user exists in Supabase
            if (isSupabaseConfigured) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('phone', verified)
                    .single()

                if (existingUser) {
                    // Existing user - set user and navigate home
                    setUser(existingUser)
                    navigate('/')
                } else {
                    // New user - need to collect name
                    setStep('name')
                }
            } else {
                // No Supabase - just navigate home
                navigate('/')
            }
        } catch (err: unknown) {
            const error = err as { code?: string }
            if (error.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP. Please check and try again.')
            } else if (error.code === 'auth/code-expired') {
                setError('OTP expired. Please request a new one.')
            } else {
                setError('Verification failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProfile = async () => {
        if (!name.trim()) {
            setError('Please enter your name')
            return
        }

        setLoading(true)
        setError('')

        try {
            const phoneToUse = verifiedPhone || phone
            if (!phoneToUse) {
                setError('Phone verification is required. Please try again.')
                setStep('phone')
                setLoading(false)
                return
            }

            const { data, error: dbError } = await supabase
                .from('users')
                .insert({
                    phone: phoneToUse,
                    name: name.trim(),
                    is_driver: false
                })
                .select()
                .single()

            if (dbError) throw dbError

            setUser(data)
            navigate('/')
        } catch (err) {
            console.error('Error creating profile:', err)
            setError('Failed to create profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateGoogleProfile = async () => {
        if (!phone || phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number')
            return
        }

        if (!isSupabaseConfigured) {
            navigate('/')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single()

            if (existingUser) {
                // Link Firebase UID to existing user if not already set
                if (!existingUser.firebase_uid && googleFirebaseUid) {
                    await supabase
                        .from('users')
                        .update({ firebase_uid: googleFirebaseUid })
                        .eq('id', existingUser.id)
                    existingUser.firebase_uid = googleFirebaseUid
                }
                setUser(existingUser)
                navigate('/')
                return
            }

            const { data, error: dbError } = await supabase
                .from('users')
                .insert({
                    phone,
                    name: googleUserName || name || 'User',
                    is_driver: false,
                    firebase_uid: googleFirebaseUid || null
                })
                .select()
                .single()

            if (dbError) throw dbError

            setUser(data)
            navigate('/')
        } catch (err) {
            console.error('Error creating Google profile:', err)
            setError('Failed to save contact number. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = () => {
        if (resendTimer > 0) return
        setOtp('')
        setError('')
        setStep('phone')
    }

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
            {/* App Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}><AppIcon size={80} /></div>
                <h1 style={{ fontSize: 28, marginBottom: 8 }}>{t('app_name')}</h1>
                <p className="text-light">{t('app_tagline')}</p>
            </div>

            {/* reCAPTCHA container (invisible) */}
            <div id="recaptcha-container"></div>

            {/* Error message */}
            {error && (
                <div style={{
                    background: 'var(--color-error-bg, #fee2e2)',
                    color: 'var(--color-error, #dc2626)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 14
                }}>
                    {error}
                </div>
            )}

            {/* Step 1: Phone Input */}
            {step === 'phone' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{ width: '100%', marginBottom: 12 }}
                    >
                        {loading ? '⏳ Signing in...' : '🔐 Continue with Google'}
                    </button>

                    {googleLoginFailed && (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setError('')}
                                style={{ width: '100%', marginBottom: 16 }}
                            >
                                📩 Use SMS login
                            </button>

                            <div className="form-group">
                                <label className="form-label">📱 {t('enter_phone')}</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 8,
                                        fontWeight: 600
                                    }}>
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="9876543210"
                                        style={{ flex: 1 }}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || phone.length !== 10}
                                style={{ width: '100%', marginTop: 16 }}
                            >
                                {loading ? '⏳ Sending...' : '📤 Send OTP'}
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                        style={{ width: '100%', marginTop: googleLoginFailed ? 12 : 16 }}
                    >
                        ← Continue as Guest
                    </button>
                </form>
            )}

            {/* Step 1b: Google Phone Capture */}
            {step === 'google_phone' && (
                <form onSubmit={(e) => { e.preventDefault(); handleCreateGoogleProfile(); }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ fontSize: 20, fontWeight: 600 }}>✅ Signed in</p>
                        <p style={{ color: 'var(--color-text-light)' }}>
                            Hi {googleUserName}! Please share your contact number.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">📱 Contact Number</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 8,
                                fontWeight: 600
                            }}>
                                +91
                            </div>
                            <input
                                type="tel"
                                className="form-input"
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                style={{ flex: 1 }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || phone.length !== 10}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {loading ? '⏳ Saving...' : '✓ Save Number'}
                    </button>
                </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ color: 'var(--color-text-light)' }}>
                            OTP sent to <strong>+91 {phone}</strong>
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔐 Enter OTP</label>
                        <input
                            type="text"
                            className="form-input"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            style={{
                                textAlign: 'center',
                                letterSpacing: '0.5em',
                                fontSize: 24,
                                fontWeight: 600
                            }}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || otp.length !== 6}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {loading ? '⏳ Verifying...' : '✓ Verify OTP'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                            style={{ flex: 1, marginRight: 8 }}
                        >
                            ← Change Number
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0}
                            style={{ flex: 1, marginLeft: 8 }}
                        >
                            {resendTimer > 0 ? `Resend (${resendTimer}s)` : '🔄 Resend OTP'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: Name Input (New Users) */}
            {step === 'name' && (
                <form onSubmit={(e) => { e.preventDefault(); handleCreateProfile(); }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ fontSize: 20, fontWeight: 600 }}>🎉 Welcome!</p>
                        <p style={{ color: 'var(--color-text-light)' }}>
                            Let's set up your profile
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">👤 {t('enter_name')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('enter_name')}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !name.trim()}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {loading ? '⏳ Creating...' : '✓ Create Profile'}
                    </button>
                </form>
            )}
        </div>
    )
}
