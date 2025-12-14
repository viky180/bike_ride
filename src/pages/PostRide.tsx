import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { Destination } from '../lib/destinations'
import { Header } from '../components/Header'
import { DestinationGrid } from '../components/DestinationSelector'
import { TimePicker } from '../components/TimePicker'
import { NumberSelector } from '../components/NumberSelector'

export function PostRidePage() {
    const { t, user, showToast } = useApp()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [destination, setDestination] = useState<Destination | null>(null)
    const [departureTime, setDepartureTime] = useState(() => {
        const now = new Date()
        now.setHours(now.getHours() + 1, 0, 0, 0)
        return now
    })
    const [seats, setSeats] = useState(1)
    const [price, setPrice] = useState(10)
    const [loading, setLoading] = useState(false)

    const handleSelectDestination = (dest: Destination) => {
        setDestination(dest)
        setStep(2)
    }

    const handleConfirmTime = () => {
        setStep(3)
    }

    const handleSubmit = async () => {
        if (!destination || !user) return

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
                    destination: destination.id,
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
                {/* Step 1: Select Destination */}
                {step === 1 && (
                    <>
                        <h2 className="section-title">{t('where_going')}</h2>
                        <DestinationGrid
                            selected={destination?.id || null}
                            onSelect={handleSelectDestination}
                        />
                    </>
                )}

                {/* Step 2: Select Time */}
                {step === 2 && (
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

                {/* Step 3: Seats & Price */}
                {step === 3 && (
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <span style={{ fontSize: 32 }}>{destination?.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: 20 }}>
                                    {destination?.hi}
                                </span>
                            </div>
                            <div className="text-light">
                                🕐 {departureTime.toLocaleString('hi-IN', {
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
                    {[1, 2, 3].map(s => (
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
