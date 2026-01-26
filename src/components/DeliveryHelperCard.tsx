import { useApp } from '../context/AppContext'
import { DeliveryHelper, VehicleType, DeliveryCapability } from '../lib/supabase'
import { DeliveryDisclaimer } from './DeliveryDisclaimer'

interface DeliveryHelperCardProps {
    helper: DeliveryHelper
    showDisclaimer?: boolean
}

// Vehicle icons
const VEHICLE_ICONS: Record<VehicleType, string> = {
    walk: '🚶',
    cycle: '🚲',
    bike: '🏍️',
    auto: '🛺',
    tractor: '🚜',
    van: '🚐'
}

// Capability icons
const CAPABILITY_ICONS: Record<DeliveryCapability, string> = {
    groceries: '🛒',
    dairy: '🥛',
    grains: '🌾',
    stationery: '✏️',
    books: '📚',
    small_parcels: '📦',
    furniture: '🪑'
}

export function DeliveryHelperCard({ helper, showDisclaimer = false }: DeliveryHelperCardProps) {
    const { language, t } = useApp()

    const getVehicleLabel = (vehicle: VehicleType) => {
        const labels: Record<VehicleType, { en: string; hi: string }> = {
            walk: { en: 'Walk', hi: 'पैदल' },
            cycle: { en: 'Cycle', hi: 'साइकिल' },
            bike: { en: 'Bike', hi: 'बाइक' },
            auto: { en: 'Auto', hi: 'ऑटो' },
            tractor: { en: 'Tractor', hi: 'ट्रैक्टर' },
            van: { en: 'Van', hi: 'वैन' }
        }
        return language === 'hi' ? labels[vehicle].hi : labels[vehicle].en
    }

    const getCapabilityLabel = (cap: DeliveryCapability) => {
        const labels: Record<DeliveryCapability, { en: string; hi: string }> = {
            groceries: { en: 'Groceries', hi: 'किराना' },
            dairy: { en: 'Milk/Dairy', hi: 'दूध/डेयरी' },
            grains: { en: 'Grains', hi: 'अनाज' },
            stationery: { en: 'Stationery', hi: 'स्टेशनरी' },
            books: { en: 'Books', hi: 'किताबें' },
            small_parcels: { en: 'Small Parcels', hi: 'छोटे पार्सल' },
            furniture: { en: 'Furniture', hi: 'फर्नीचर' }
        }
        return language === 'hi' ? labels[cap].hi : labels[cap].en
    }

    const getAvailabilityLabel = () => {
        const labels: Record<string, { en: string; hi: string }> = {
            morning: { en: 'Morning', hi: 'सुबह' },
            evening: { en: 'Evening', hi: 'शाम' },
            anytime: { en: 'Anytime', hi: 'कभी भी' }
        }
        const label = labels[helper.availability_time]
        const baseLabel = language === 'hi' ? label.hi : label.en
        return helper.availability_hours
            ? `${baseLabel} (${helper.availability_hours})`
            : baseLabel
    }

    const handleCall = () => {
        window.location.href = `tel:+91${helper.phone}`
    }

    const hasRates = helper.rate_same_village || helper.rate_nearby_village || helper.rate_far_village

    return (
        <div style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 16px 12px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderBottom: '1px solid #e0f2fe'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Vehicle Icon */}
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {VEHICLE_ICONS[helper.vehicle_type]}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 600,
                            fontSize: 16,
                            color: '#1f2937'
                        }}>
                            {helper.user?.name || (language === 'hi' ? 'सहायक' : 'Helper')}
                        </div>
                        <div style={{
                            fontSize: 13,
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 2
                        }}>
                            <span>📍</span>
                            <span>{helper.home_village}</span>
                            <span style={{ margin: '0 4px' }}>•</span>
                            <span>{getVehicleLabel(helper.vehicle_type)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: 16 }}>
                {/* Service Villages */}
                {helper.service_villages.length > 1 && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginBottom: 4
                        }}>
                            {language === 'hi' ? 'सेवा क्षेत्र' : 'Service Area'}
                        </div>
                        <div style={{
                            fontSize: 13,
                            color: '#1f2937'
                        }}>
                            {helper.service_villages.join(' • ')}
                        </div>
                    </div>
                )}

                {/* Availability */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 4
                    }}>
                        {t('availability')}
                    </div>
                    <div style={{
                        fontSize: 13,
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <span>🕐</span>
                        <span>{getAvailabilityLabel()}</span>
                    </div>
                </div>

                {/* Capabilities */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6
                    }}>
                        {language === 'hi' ? 'क्या पहुँचा सकते हैं' : 'Can deliver'}
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6
                    }}>
                        {helper.capabilities.map(cap => (
                            <span
                                key={cap}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    background: '#f3f4f6',
                                    fontSize: 12,
                                    color: '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                <span>{CAPABILITY_ICONS[cap]}</span>
                                <span>{getCapabilityLabel(cap)}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Rate Slabs */}
                {hasRates && (
                    <div style={{
                        background: '#f9fafb',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12
                    }}>
                        <div style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>{t('rate_slabs')}</span>
                            <span style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600
                            }}>
                                {language === 'hi' ? 'लगभग' : 'Approx.'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {helper.rate_same_village && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>{t('rate_same_village')}</span>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>₹{helper.rate_same_village}</span>
                                </div>
                            )}
                            {helper.rate_nearby_village && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>{t('rate_nearby_village')}</span>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>₹{helper.rate_nearby_village}</span>
                                </div>
                            )}
                            {helper.rate_far_village && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>{t('rate_far_village')}</span>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>₹{helper.rate_far_village}</span>
                                </div>
                            )}
                        </div>
                        <div style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: '#9ca3af',
                            fontStyle: 'italic'
                        }}>
                            {t('rate_may_vary')}
                        </div>
                    </div>
                )}

                {/* Disclaimer (compact) */}
                {showDisclaimer && (
                    <div style={{ marginBottom: 12 }}>
                        <DeliveryDisclaimer compact />
                    </div>
                )}

                {/* CALL Button */}
                <button
                    onClick={handleCall}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <span style={{ fontSize: 18 }}>📞</span>
                    <span>{t('call')}</span>
                </button>
            </div>
        </div>
    )
}
