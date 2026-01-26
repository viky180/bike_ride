import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase, DeliveryHelper } from '../lib/supabase'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { DeliveryHelperCard } from '../components/DeliveryHelperCard'
import { DeliveryDisclaimer } from '../components/DeliveryDisclaimer'
import { DeliveryDisclaimerModal } from '../components/DeliveryDisclaimerModal'

export function DeliveryHelpPage() {
    const { language, t } = useApp()
    const { user } = useAuth()

    const [helpers, setHelpers] = useState<DeliveryHelper[]>([])
    const [loading, setLoading] = useState(true)
    const [villageFilter, setVillageFilter] = useState('')
    const [userIsHelper, setUserIsHelper] = useState(false)

    useEffect(() => {
        fetchHelpers()
        if (user) {
            checkIfUserIsHelper()
        }
    }, [user])

    const fetchHelpers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('delivery_helpers')
                .select(`
                    *,
                    user:users!user_id(id, name, phone)
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setHelpers((data || []) as DeliveryHelper[])
        } catch (error) {
            console.error('Error fetching helpers:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkIfUserIsHelper = async () => {
        if (!user) return
        try {
            const { data } = await supabase
                .from('delivery_helpers')
                .select('id')
                .eq('user_id', user.id)
                .single()

            setUserIsHelper(!!data)
        } catch {
            setUserIsHelper(false)
        }
    }

    // Filter helpers by village (matches home_village or service_villages)
    const getFilteredHelpers = () => {
        if (!villageFilter.trim()) return helpers

        const searchTerm = villageFilter.toLowerCase().trim()
        return helpers.filter(helper => {
            const homeMatch = helper.home_village.toLowerCase().includes(searchTerm)
            const serviceMatch = helper.service_villages.some(v =>
                v.toLowerCase().includes(searchTerm)
            )
            return homeMatch || serviceMatch
        })
    }

    const filteredHelpers = getFilteredHelpers()

    return (
        <div className="app">
            <Header
                title={t('delivery_help')}
                showBack
            />

            <div className="page" style={{ paddingBottom: 100 }}>
                {/* First-use disclaimer modal */}
                <DeliveryDisclaimerModal />

                {/* Disclaimer at top */}
                <DeliveryDisclaimer />

                {/* Register/Edit Registration Banner */}
                <Link
                    to="/delivery-help/register"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        borderRadius: 12,
                        marginBottom: 16,
                        color: 'white',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>🚚</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>
                                {userIsHelper
                                    ? t('edit_registration')
                                    : t('register_helper')
                                }
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.9 }}>
                                {language === 'hi'
                                    ? 'अपने गाँव में डिलीवरी करें और कमाएं'
                                    : 'Deliver in your village and earn'}
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: 20 }}>→</span>
                </Link>

                {/* Village Search */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 16
                }}>
                    <div style={{
                        flex: 1,
                        position: 'relative'
                    }}>
                        <span style={{
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 16
                        }}>🔍</span>
                        <input
                            type="text"
                            value={villageFilter}
                            onChange={(e) => setVillageFilter(e.target.value)}
                            placeholder={language === 'hi' ? 'गाँव खोजें...' : 'Search village...'}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                fontSize: 15,
                                borderRadius: 10,
                                border: '2px solid #e5e7eb',
                                background: 'white'
                            }}
                        />
                        {villageFilter && (
                            <button
                                onClick={() => setVillageFilter('')}
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Results count */}
                {villageFilter && (
                    <div style={{
                        fontSize: 13,
                        color: '#6b7280',
                        marginBottom: 12
                    }}>
                        {filteredHelpers.length} {language === 'hi' ? 'सहायक मिले' : 'helpers found'}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredHelpers.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: '#6b7280'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
                        <p>{t('no_helpers')}</p>
                        {villageFilter && (
                            <button
                                onClick={() => setVillageFilter('')}
                                style={{
                                    marginTop: 12,
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {language === 'hi' ? 'सभी देखें' : 'Show all'}
                            </button>
                        )}
                    </div>
                )}

                {/* Helper cards */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    {!loading && filteredHelpers.map(helper => (
                        <DeliveryHelperCard
                            key={helper.id}
                            helper={helper}
                            showDisclaimer={false}
                        />
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
