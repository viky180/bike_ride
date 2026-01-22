/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Supabase Configuration
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string

    // Firebase Configuration
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string

    // reCAPTCHA Configuration
    readonly VITE_RECAPTCHA_V3_SITE_KEY: string

    // Admin Configuration
    readonly VITE_ADMIN_PHONES: string

    // Dev mode flag
    readonly DEV: boolean
    readonly PROD: boolean
    readonly MODE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
