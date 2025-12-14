import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getStoredLanguage, setStoredLanguage, t, TranslationKey } from '../lib/i18n'
import { StoredUser, getStoredUser, setStoredUser as saveUser } from '../lib/storage'

interface AppContextType {
    // Language
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string

    // User
    user: StoredUser | null
    setUser: (user: StoredUser) => void

    // Online status
    isOnline: boolean

    // Toast
    showToast: (message: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getStoredLanguage())
    const [user, setUserState] = useState<StoredUser | null>(getStoredUser())
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        setStoredLanguage(lang)
    }

    const setUser = (newUser: StoredUser) => {
        setUserState(newUser)
        saveUser(newUser)
    }

    const translate = (key: TranslationKey) => t(key, language)

    const showToast = (message: string) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000)
    }

    return (
        <AppContext.Provider value={{
            language,
            setLanguage,
            t: translate,
            user,
            setUser,
            isOnline,
            showToast
        }}>
            {children}
            {!isOnline && (
                <div className="offline-banner">
                    {translate('offline')}
                </div>
            )}
            {toast && (
                <div className="toast">{toast}</div>
            )}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}
