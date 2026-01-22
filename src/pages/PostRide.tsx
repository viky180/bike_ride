import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { TimePicker } from '../components/TimePicker'
import { NumberSelector } from '../components/NumberSelector'

export function PostRidePage() {
    const { t, showToast, language } = useApp()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [origin, setOrigin] = useState('')
    const [destination, setDestination] = useState('')
    const [departureTime, setDepartureTime] = useState(() => {
        const now = new Date()
        now.setHours(now.getHours() + 1, 0, 0, 0)
        return now
    })
    const [seats, setSeats] = useState(1)
    const [price, setPrice] = useState(10)
    const [loading, setLoading] = useState(false)

    const handleNextFromOrigin = () => {
        if (origin.trim()) {
            setStep(2)
        }
    }

    const handleNextFromDestination = () => {
        if (destination.trim()) {
            setStep(3)
        }
    }

    const handleConfirmTime = () => {
        setStep(4)
    }

    const handleSubmit = async () => {
        if (!origin.trim() || !destination.trim() || !user) return

        setLoading(true)
        try {
            // First, ensure user is marked as driver
            if (!user.is_driver) {
                await supabase
                    .from('users')
                    .update({ is_driver: true })
                    .eq('id', user.id)
            }

            const { error } = await supabase
                .from('rides')
                .insert({
                    driver_id: user.id,
                    origin: origin.trim(),
                    destination: destination.trim(),
                    departure_time: departureTime.toISOString(),
                    available_seats: seats,
                    cost_per_seat: price,
                    status: 'open'
                })

            if (error) throw error

            showToast(t('ride_posted'))
            navigate('/my-rides')
        } catch (error) {
            console.error('Error posting ride:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app">
            <Header title={t('offer_ride')} showBack />

            <div className="page">
                {/* Step 1: Enter Origin */}
                {step === 1 && (
                    <>
                        <h2 className="section-title">{t('where_from')}</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder={t('enter_origin')}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '18px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--color-border)',
                                    marginBottom: '16px'
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleNextFromOrigin}
                            disabled={!origin.trim()}
                        >
                            {t('confirm')} →
                        </button>
                    </>
                )}

                {/* Step 2: Enter Destination */}
                {step === 2 && (
                    <>
                        <h2 className="section-title">{t('where_going')}</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder={t('enter_destination')}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '18px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--color-border)',
                                    marginBottom: '16px'
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleNextFromDestination}
                            disabled={!destination.trim()}
                        >
                            {t('confirm')} →
                        </button>
                    </>
                )}

                {/* Step 3: Select Time */}
                {step === 3 && (
                    <>
                        <h2 className="section-title">{t('when_going')}</h2>
                        <div className="card mb-lg">
                            <TimePicker
                                value={departureTime}
                                onChange={setDepartureTime}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleConfirmTime}
                        >
                            {t('confirm')} →
                        </button>
                    </>
                )}

                {/* Step 4: Seats & Price */}
                {step === 4 && (
                    <>
                        <div className="form-group">
                            <label className="form-label">{t('how_many_seats')}</label>
                            <NumberSelector
                                value={seats}
                                min={1}
                                max={4}
                                onChange={setSeats}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('price_per_seat')}</label>
                            <NumberSelector
                                value={price}
                                min={5}
                                max={100}
                                step={5}
                                onChange={setPrice}
                                prefix="₹"
                            />
                        </div>

                        {/* Summary */}
                        <div className="card mb-lg">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 24 }}>📍</span>
                                <span style={{ fontWeight: 600, fontSize: 16 }}>{origin}</span>
                                <span style={{ fontSize: 18, color: 'var(--color-text-light)' }}>→</span>
                                <span style={{ fontSize: 24 }}>🏁</span>
                                <span style={{ fontWeight: 600, fontSize: 16 }}>{destination}</span>
                            </div>
                            <div className="text-light">
                                🕐 {departureTime.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div className="text-light">
                                💺 {seats} {t('seats_left')} • ₹{price} {t('price_per_seat')}
                            </div>
                        </div>

                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? t('loading') : t('post_ride')}
                        </button>
                    </>
                )}

                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: s === step ? 'var(--color-primary)' : 'var(--color-border)',
                                cursor: s < step ? 'pointer' : 'default'
                            }}
                            onClick={() => s < step && setStep(s)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
