import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase, VehicleType, AvailabilityTime, DeliveryCapability, DeliveryHelper } from '../lib/supabase'
import { Header } from '../components/Header'
import { DeliveryDisclaimer } from '../components/DeliveryDisclaimer'

// Vehicle options with icons
const VEHICLE_OPTIONS: { id: VehicleType; icon: string; en: string; hi: string }[] = [
    { id: 'walk', icon: '🚶', en: 'Walk', hi: 'पैदल' },
    { id: 'cycle', icon: '🚲', en: 'Cycle', hi: 'साइकिल' },
    { id: 'bike', icon: '🏍️', en: 'Bike', hi: 'बाइक' },
    { id: 'auto', icon: '🛺', en: 'Auto', hi: 'ऑटो' },
    { id: 'tractor', icon: '🚜', en: 'Tractor', hi: 'ट्रैक्टर' },
    { id: 'van', icon: '🚐', en: 'Van', hi: 'वैन' }
]

// Availability options
const AVAILABILITY_OPTIONS: { id: AvailabilityTime; icon: string; en: string; hi: string }[] = [
    { id: 'morning', icon: '🌅', en: 'Morning', hi: 'सुबह' },
    { id: 'evening', icon: '🌆', en: 'Evening', hi: 'शाम' },
    { id: 'anytime', icon: '🕐', en: 'Anytime', hi: 'कभी भी' }
]

// Capability options (furniture is OFF by default)
const CAPABILITY_OPTIONS: { id: DeliveryCapability; icon: string; en: string; hi: string; defaultOn: boolean }[] = [
    { id: 'groceries', icon: '🛒', en: 'Groceries', hi: 'किराना', defaultOn: true },
    { id: 'dairy', icon: '🥛', en: 'Milk/Dairy', hi: 'दूध/डेयरी', defaultOn: true },
    { id: 'grains', icon: '🌾', en: 'Grains', hi: 'अनाज', defaultOn: true },
    { id: 'stationery', icon: '✏️', en: 'Stationery', hi: 'स्टेशनरी', defaultOn: true },
    { id: 'books', icon: '📚', en: 'Books', hi: 'किताबें', defaultOn: true },
    { id: 'small_parcels', icon: '📦', en: 'Small Parcels', hi: 'छोटे पार्सल', defaultOn: true },
    { id: 'furniture', icon: '🪑', en: 'Furniture', hi: 'फर्नीचर', defaultOn: false }
]

export function RegisterDeliveryHelperPage() {
    const { language, t } = useApp()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [existingHelper, setExistingHelper] = useState<DeliveryHelper | null>(null)
    const [success, setSuccess] = useState(false)

    // Form state
    const [homeVillage, setHomeVillage] = useState('')
    const [serviceVillages, setServiceVillages] = useState<string[]>([])
    const [newVillage, setNewVillage] = useState('')
    const [vehicleType, setVehicleType] = useState<VehicleType>('bike')
    const [availabilityTime, setAvailabilityTime] = useState<AvailabilityTime>('anytime')
    const [availabilityHours, setAvailabilityHours] = useState('')
    const [capabilities, setCapabilities] = useState<DeliveryCapability[]>(
        CAPABILITY_OPTIONS.filter(c => c.defaultOn).map(c => c.id)
    )
    const [rateSameVillage, setRateSameVillage] = useState('')
    const [rateNearbyVillage, setRateNearbyVillage] = useState('')
    const [rateFarVillage, setRateFarVillage] = useState('')
    const [phone, setPhone] = useState('')

    // Load existing helper data if editing
    useEffect(() => {
        if (user) {
            setPhone(user.phone || '')
            loadExistingHelper()
        }
    }, [user])

    const loadExistingHelper = async () => {
        if (!user) return
        try {
            const { data } = await supabase
                .from('delivery_helpers')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (data) {
                const helper = data as DeliveryHelper
                setExistingHelper(helper)
                setHomeVillage(helper.home_village)
                setServiceVillages(helper.service_villages.filter(v => v !== helper.home_village))
                setVehicleType(helper.vehicle_type)
                setAvailabilityTime(helper.availability_time)
                setAvailabilityHours(helper.availability_hours || '')
                setCapabilities(helper.capabilities)
                setRateSameVillage(helper.rate_same_village?.toString() || '')
                setRateNearbyVillage(helper.rate_nearby_village?.toString() || '')
                setRateFarVillage(helper.rate_far_village?.toString() || '')
                setPhone(helper.phone)
            }
        } catch {
            // No existing helper
        }
    }

    const addServiceVillage = () => {
        const village = newVillage.trim()
        if (!village) return

        const allVillages = [homeVillage, ...serviceVillages]
        if (allVillages.length >= 5) {
            alert(language === 'hi' ? 'अधिकतम 5 गाँव' : 'Maximum 5 villages')
            return
        }
        if (allVillages.includes(village)) {
            alert(language === 'hi' ? 'यह गाँव पहले से है' : 'Village already added')
            return
        }

        setServiceVillages([...serviceVillages, village])
        setNewVillage('')
    }

    const removeServiceVillage = (village: string) => {
        setServiceVillages(serviceVillages.filter(v => v !== village))
    }

    const toggleCapability = (cap: DeliveryCapability) => {
        if (capabilities.includes(cap)) {
            setCapabilities(capabilities.filter(c => c !== cap))
        } else {
            setCapabilities([...capabilities, cap])
        }
    }

    const handleSubmit = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        if (!homeVillage.trim()) {
            alert(language === 'hi' ? 'घर का गाँव डालें' : 'Enter home village')
            return
        }

        if (!phone.trim()) {
            alert(language === 'hi' ? 'फ़ोन नंबर डालें' : 'Enter phone number')
            return
        }

        if (capabilities.length === 0) {
            alert(language === 'hi' ? 'कम से कम एक सामान चुनें' : 'Select at least one capability')
            return
        }

        setLoading(true)

        try {
            const allServiceVillages = [homeVillage, ...serviceVillages.filter(v => v !== homeVillage)]

            const helperData = {
                user_id: user.id,
                home_village: homeVillage.trim(),
                service_villages: allServiceVillages,
                vehicle_type: vehicleType,
                availability_time: availabilityTime,
                availability_hours: availabilityHours.trim() || null,
                capabilities,
                rate_same_village: rateSameVillage ? parseInt(rateSameVillage) : null,
                rate_nearby_village: rateNearbyVillage ? parseInt(rateNearbyVillage) : null,
                rate_far_village: rateFarVillage ? parseInt(rateFarVillage) : null,
                phone: phone.trim(),
                is_active: true,
                updated_at: new Date().toISOString()
            }

            if (existingHelper) {
                // Update existing
                const { error } = await supabase
                    .from('delivery_helpers')
                    .update(helperData)
                    .eq('id', existingHelper.id)

                if (error) throw error
            } else {
                // Create new
                const { error } = await supabase
                    .from('delivery_helpers')
                    .insert(helperData)

                if (error) throw error
            }

            setSuccess(true)
            setTimeout(() => {
                navigate('/delivery-help')
            }, 1500)
        } catch (error) {
            console.error('Error saving helper:', error)
            alert(language === 'hi' ? 'त्रुटि हुई। पुनः प्रयास करें।' : 'Error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Check if user is logged in
    if (!user) {
        return (
            <div className="app">
                <Header title={t('register_helper')} showBack />
                <div className="page" style={{ textAlign: 'center', paddingTop: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <p style={{ color: '#6b7280', marginBottom: 20 }}>
                        {language === 'hi' ? 'कृपया पहले लॉगिन करें' : 'Please login first'}
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        style={{ padding: '12px 24px' }}
                    >
                        {language === 'hi' ? 'लॉगिन करें' : 'Login'}
                    </button>
                </div>
            </div>
        )
    }

    // Success message
    if (success) {
        return (
            <div className="app">
                <Header title={t('register_helper')} />
                <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                    <h2 style={{ color: '#059669', marginBottom: 8 }}>
                        {existingHelper ? t('helper_updated') : t('helper_registered')}
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        {language === 'hi' ? 'आपकी प्रोफाइल सेव हो गई' : 'Your profile has been saved'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Header
                title={existingHelper ? t('edit_registration') : t('register_helper')}
                showBack
            />

            <div className="page" style={{ paddingBottom: 100 }}>
                {/* Disclaimer */}
                <DeliveryDisclaimer />

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Home Village */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {t('home_village')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={homeVillage}
                            onChange={(e) => setHomeVillage(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: रामपुर' : 'e.g., Rampur'}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 15,
                                borderRadius: 10,
                                border: '2px solid #e5e7eb',
                                background: 'white'
                            }}
                        />
                    </div>

                    {/* Service Villages */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {t('service_villages')}
                            <span style={{
                                fontWeight: 400,
                                fontSize: 12,
                                color: '#6b7280',
                                marginLeft: 8
                            }}>
                                ({t('max_villages')})
                            </span>
                        </label>

                        {/* Current villages */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: serviceVillages.length > 0 ? 12 : 0
                        }}>
                            {homeVillage && (
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: 20,
                                    background: '#dcfce7',
                                    color: '#166534',
                                    fontSize: 13,
                                    fontWeight: 500
                                }}>
                                    🏠 {homeVillage}
                                </span>
                            )}
                            {serviceVillages.map(village => (
                                <span
                                    key={village}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        fontSize: 13,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    {village}
                                    <button
                                        onClick={() => removeServiceVillage(village)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0369a1',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: 14
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Add village input */}
                        {(homeVillage ? serviceVillages.length + 1 : 0) < 5 && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    value={newVillage}
                                    onChange={(e) => setNewVillage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addServiceVillage()}
                                    placeholder={language === 'hi' ? 'अन्य गाँव जोड़ें' : 'Add another village'}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        fontSize: 14,
                                        borderRadius: 8,
                                        border: '2px solid #e5e7eb',
                                        background: 'white'
                                    }}
                                />
                                <button
                                    onClick={addServiceVillage}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#0ea5e9',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Vehicle Type */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {t('vehicle_type')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8
                        }}>
                            {VEHICLE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setVehicleType(opt.id)}
                                    style={{
                                        padding: '12px 8px',
                                        borderRadius: 10,
                                        border: vehicleType === opt.id
                                            ? '2px solid #0ea5e9'
                                            : '2px solid #e5e7eb',
                                        background: vehicleType === opt.id
                                            ? '#f0f9ff'
                                            : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    <span style={{ fontSize: 24 }}>{opt.icon}</span>
                                    <span style={{
                                        fontSize: 12,
                                        color: vehicleType === opt.id ? '#0369a1' : '#6b7280'
                                    }}>
                                        {language === 'hi' ? opt.hi : opt.en}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {t('availability')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8,
                            marginBottom: 12
                        }}>
                            {AVAILABILITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setAvailabilityTime(opt.id)}
                                    style={{
                                        padding: '12px 8px',
                                        borderRadius: 10,
                                        border: availabilityTime === opt.id
                                            ? '2px solid #10b981'
                                            : '2px solid #e5e7eb',
                                        background: availabilityTime === opt.id
                                            ? '#ecfdf5'
                                            : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                                    <span style={{
                                        fontSize: 12,
                                        color: availabilityTime === opt.id ? '#059669' : '#6b7280'
                                    }}>
                                        {language === 'hi' ? opt.hi : opt.en}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={availabilityHours}
                            onChange={(e) => setAvailabilityHours(e.target.value)}
                            placeholder={language === 'hi' ? 'समय जैसे: 9-12, 4-7' : 'Hours e.g., 9-12, 4-7'}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                fontSize: 14,
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                background: 'white'
                            }}
                        />
                    </div>

                    {/* Capabilities */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {t('capabilities')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8
                        }}>
                            {CAPABILITY_OPTIONS.map(opt => {
                                const selected = capabilities.includes(opt.id)
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleCapability(opt.id)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 20,
                                            border: selected
                                                ? '2px solid #10b981'
                                                : '2px solid #e5e7eb',
                                            background: selected
                                                ? '#ecfdf5'
                                                : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 13
                                        }}
                                    >
                                        <span>{opt.icon}</span>
                                        <span style={{
                                            color: selected ? '#059669' : '#6b7280'
                                        }}>
                                            {language === 'hi' ? opt.hi : opt.en}
                                        </span>
                                        {selected && <span>✓</span>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Rate Slabs */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 4,
                            color: '#374151'
                        }}>
                            {t('rate_slabs')}
                            <span style={{
                                marginLeft: 8,
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600
                            }}>
                                {language === 'hi' ? 'लगभग / Approx.' : 'Approx.'}
                            </span>
                        </label>
                        <div style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginBottom: 12
                        }}>
                            {t('rate_may_vary')}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                                    {t('rate_same_village')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ color: '#6b7280' }}>₹</span>
                                    <input
                                        type="number"
                                        value={rateSameVillage}
                                        onChange={(e) => setRateSameVillage(e.target.value)}
                                        placeholder="--"
                                        style={{
                                            width: 80,
                                            padding: '8px 12px',
                                            fontSize: 14,
                                            borderRadius: 8,
                                            border: '2px solid #e5e7eb',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                                    {t('rate_nearby_village')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ color: '#6b7280' }}>₹</span>
                                    <input
                                        type="number"
                                        value={rateNearbyVillage}
                                        onChange={(e) => setRateNearbyVillage(e.target.value)}
                                        placeholder="--"
                                        style={{
                                            width: 80,
                                            padding: '8px 12px',
                                            fontSize: 14,
                                            borderRadius: 8,
                                            border: '2px solid #e5e7eb',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                                    {t('rate_far_village')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ color: '#6b7280' }}>₹</span>
                                    <input
                                        type="number"
                                        value={rateFarVillage}
                                        onChange={(e) => setRateFarVillage(e.target.value)}
                                        placeholder="--"
                                        style={{
                                            width: 80,
                                            padding: '8px 12px',
                                            fontSize: 14,
                                            borderRadius: 8,
                                            border: '2px solid #e5e7eb',
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#374151'
                        }}>
                            {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                padding: '12px 14px',
                                background: '#f3f4f6',
                                borderRadius: '10px 0 0 10px',
                                border: '2px solid #e5e7eb',
                                borderRight: 'none',
                                color: '#6b7280'
                            }}>
                                +91
                            </span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                maxLength={10}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    fontSize: 15,
                                    borderRadius: '0 10px 10px 0',
                                    border: '2px solid #e5e7eb',
                                    background: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: loading
                                ? '#9ca3af'
                                : 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                            marginTop: 8
                        }}
                    >
                        {loading
                            ? (language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...')
                            : (existingHelper
                                ? (language === 'hi' ? 'अपडेट करें' : 'Update')
                                : (language === 'hi' ? 'पंजीकरण करें' : 'Register')
                            )
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}
