import { initializeApp } from 'firebase/app'
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    Auth,
    User as FirebaseUser
} from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// reCAPTCHA v3 site key for App Check
const RECAPTCHA_V3_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY

// Check if Firebase is configured
export const isFirebaseConfigured = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
)

if (!isFirebaseConfigured && import.meta.env.DEV) {
    console.warn('Firebase not configured. Please add VITE_FIREBASE_* variables to .env file.')
}

// Initialize Firebase
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

// Initialize App Check with reCAPTCHA v3 (production only)
if (app && RECAPTCHA_V3_SITE_KEY && !import.meta.env.DEV) {
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
            // Auto-refresh token
            isTokenAutoRefreshEnabled: true
        })
        console.log('Firebase App Check initialized with reCAPTCHA v3')
    } catch (error) {
        console.error('Failed to initialize App Check:', error)
    }
} else if (app && !RECAPTCHA_V3_SITE_KEY) {
    console.warn('VITE_RECAPTCHA_V3_SITE_KEY not set. App Check not initialized.')
} else if (app && import.meta.env.DEV) {
    console.log('App Check is disabled for development. Enable it for production.')
}

export const auth: Auth | null = app ? getAuth(app) : null

// Set language to user's browser preference
if (auth) {
    auth.useDeviceLanguage()
}

// Setup invisible reCAPTCHA verifier
export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
    if (!auth) return null

    return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved
        },
        'expired-callback': () => {
            // Reset if expired
            console.log('reCAPTCHA expired')
        }
    })
}

// Send OTP to phone number
export async function sendOTP(
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult | null> {
    if (!auth) {
        console.error('Firebase auth not initialized')
        return null
    }

    // Ensure phone number has country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
        return confirmationResult
    } catch (error) {
        console.error('Error sending OTP:', error)
        throw error
    }
}

// Verify OTP code
export async function verifyOTP(
    confirmationResult: ConfirmationResult,
    code: string
): Promise<FirebaseUser> {
    try {
        const result = await confirmationResult.confirm(code)
        return result.user
    } catch (error) {
        console.error('Error verifying OTP:', error)
        throw error
    }
}

// Sign out
export async function signOutUser(): Promise<void> {
    if (!auth) return

    try {
        await auth.signOut()
    } catch (error) {
        console.error('Error signing out:', error)
        throw error
    }
}

// Export types
export type { FirebaseUser, ConfirmationResult, RecaptchaVerifier }
