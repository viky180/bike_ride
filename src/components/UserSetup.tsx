import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { AppIcon } from './AppIcon'

interface UserSetupProps {
    onComplete: () => void
}

export function UserSetup({ onComplete }: UserSetupProps) {
    const { t, setUser } = useApp()
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !phone.trim()) return

        setLoading(true)
        try {
            // Check if user exists
            const { data: existing } = await supabase
                .from('users')
                .select('*')
                .eq('phone', phone.trim())
                .single()

            if (existing) {
                setUser({
                    id: existing.id,
                    phone: existing.phone,
                    name: existing.name,
                    is_driver: existing.is_driver
                })
            } else {
                // Create new user
                const { data, error } = await supabase
                    .from('users')
                    .insert({
                        name: name.trim(),
                        phone: phone.trim(),
                        is_driver: false
                    })
                    .select()
                    .single()

                if (error) throw error

                setUser({
                    id: data.id,
                    phone: data.phone,
                    name: data.name,
                    is_driver: data.is_driver
                })
            }

            onComplete()
        } catch (error) {
            console.error('Error setting up user:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}><AppIcon size={80} /></div>
                <h1 style={{ fontSize: 28, marginBottom: 8 }}>{t('app_name')}</h1>
                <p className="text-light">{t('app_tagline')}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">{t('enter_name')}</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('enter_name')}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t('enter_phone')}</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="9876543210"
                        pattern="[0-9]{10}"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !name.trim() || !phone.trim()}
                >
                    {loading ? t('loading') : t('save')}
                </button>
            </form>
        </div>
    )
}
