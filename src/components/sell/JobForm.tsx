import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { getPopularProducts, PopularProduct } from '../../lib/popularProducts'
import { CATEGORIES } from '../../lib/categories'
import { CategoryBadge } from './CategoryBadge'

interface JobFormProps {
    onBack: () => void
    onSubmit: (data: JobFormData) => Promise<void>
    loading: boolean
}

export interface JobFormData {
    jobType: string
    salary: string
    jobLocation: string
    candidatesFrom: string[]
    allIndia: boolean
    sellerPhone: string
    whatsappEnabled: boolean
}

// Location scope options
const LOCATION_SCOPES = [
    { id: 'state', en: 'State', hi: 'राज्य' },
    { id: 'district', en: 'District', hi: 'जिला' },
    { id: 'city', en: 'City', hi: 'शहर' },
    { id: 'village', en: 'Village', hi: 'गाँव' },
    { id: 'pincode', en: 'Pincode', hi: 'पिनकोड' },
]

export function JobForm({ onBack, onSubmit, loading }: JobFormProps) {
    const { language } = useApp()
    const { user } = useAuth()

    const [jobType, setJobType] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [salary, setSalary] = useState('')
    const [jobLocation, setJobLocation] = useState('')
    const [allIndia, setAllIndia] = useState(false)
    const [candidatesFrom, setCandidatesFrom] = useState<string[]>([])
    const [locationInput, setLocationInput] = useState('')
    const [selectedScope, setSelectedScope] = useState('state')
    const [sellerPhone, setSellerPhone] = useState(user?.phone || '')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)

    const selectedCat = CATEGORIES.find(c => c.id === 'jobs')
    const popularJobs = getPopularProducts('jobs')

    const handleSelectJob = (product: PopularProduct) => {
        setJobType(language === 'hi' ? product.hi : product.name)
        setShowCustomInput(false)
    }

    const handleAddLocation = () => {
        if (locationInput.trim()) {
            const scope = LOCATION_SCOPES.find(s => s.id === selectedScope)
            const label = `${scope?.en || selectedScope}: ${locationInput.trim()}`
            if (!candidatesFrom.includes(label)) {
                setCandidatesFrom([...candidatesFrom, label])
            }
            setLocationInput('')
        }
    }

    const handleRemoveLocation = (loc: string) => {
        setCandidatesFrom(candidatesFrom.filter(l => l !== loc))
    }

    const handleSubmit = () => {
        onSubmit({
            jobType,
            salary,
            jobLocation,
            candidatesFrom,
            allIndia,
            sellerPhone,
            whatsappEnabled
        })
    }

    const canSubmit = jobType.trim() && salary.trim() && sellerPhone.trim()

    return (
        <>
            <CategoryBadge
                icon={selectedCat?.icon || '💼'}
                labelHi="नौकरी पोस्ट करें"
                labelEn="Post a Job"
                onChangeClick={onBack}
            />

            {/* Job type selector */}
            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'किस पद के लिए भर्ती?' : 'Hiring for which position?'}
                </label>

                <div className="popular-products-grid">
                    {popularJobs.map(job => (
                        <button
                            key={job.name}
                            className={`popular-product-btn ${jobType === (language === 'hi' ? job.hi : job.name) ? 'selected' : ''}`}
                            onClick={() => handleSelectJob(job)}
                        >
                            <span className="icon">{job.icon}</span>
                            <span className="name">{language === 'hi' ? job.hi : job.name}</span>
                        </button>
                    ))}

                    <button
                        className={`popular-product-btn ${showCustomInput ? 'selected' : ''}`}
                        onClick={() => setShowCustomInput(true)}
                    >
                        <span className="icon">✏️</span>
                        <span className="name">{language === 'hi' ? 'अन्य' : 'Other'}</span>
                    </button>
                </div>

                {showCustomInput && (
                    <input
                        type="text"
                        className="form-input"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        placeholder={language === 'hi' ? 'पद का नाम लिखें...' : 'Type job title...'}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '18px',
                            borderRadius: '12px',
                            border: '2px solid var(--color-primary)',
                            marginTop: '12px'
                        }}
                    />
                )}
            </div>

            {/* Show remaining fields only if job type is selected */}
            {jobType && (
                <>
                    {/* Salary offered */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'वेतन (Salary)' : 'Salary Offered'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder={language === 'hi' ? '₹500/दिन, ₹15000/महीना...' : '₹500/day, ₹15000/month...'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Job location */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'काम की जगह' : 'Job Location'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={jobLocation}
                            onChange={(e) => setJobLocation(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: रामपुर गाँव, दिल्ली...' : 'e.g., Rampur Village, Delhi...'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Candidates from - Location filter */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'उम्मीदवार कहाँ से चाहिए?' : 'Candidates from where?'}
                        </label>

                        {/* All India checkbox */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px',
                            background: allIndia ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                            borderRadius: 8,
                            marginBottom: 12,
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={allIndia}
                                onChange={(e) => setAllIndia(e.target.checked)}
                                style={{ width: 20, height: 20 }}
                            />
                            <span style={{ fontWeight: 600 }}>
                                🇮🇳 {language === 'hi' ? 'पूरे भारत से' : 'All India'}
                            </span>
                        </label>

                        {/* Location scope selector + input */}
                        {!allIndia && (
                            <>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                    {LOCATION_SCOPES.map(scope => (
                                        <button
                                            key={scope.id}
                                            onClick={() => setSelectedScope(scope.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 20,
                                                border: selectedScope === scope.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                background: selectedScope === scope.id ? 'var(--color-primary-light)' : 'transparent',
                                                fontWeight: selectedScope === scope.id ? 600 : 400,
                                                fontSize: 14
                                            }}
                                        >
                                            {language === 'hi' ? scope.hi : scope.en}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                                        placeholder={language === 'hi' ? 'जोड़ने के लिए लिखें...' : 'Type to add...'}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    />
                                    <button
                                        onClick={handleAddLocation}
                                        style={{
                                            padding: '12px 20px',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontWeight: 600
                                        }}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Added locations chips */}
                                {candidatesFrom.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                        {candidatesFrom.map(loc => (
                                            <span
                                                key={loc}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '6px 12px',
                                                    background: 'var(--color-bg-secondary)',
                                                    borderRadius: 20,
                                                    fontSize: 14
                                                }}
                                            >
                                                📍 {loc}
                                                <button
                                                    onClick={() => handleRemoveLocation(loc)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        fontSize: 16,
                                                        color: 'var(--color-text-light)'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Contact Phone */}
                    <div className="form-group">
                        <label className="form-label">
                            {language === 'hi' ? 'संपर्क नंबर *' : 'Contact Number *'}
                        </label>
                        <input
                            type="tel"
                            className="form-input"
                            value={sellerPhone}
                            onChange={(e) => setSellerPhone(e.target.value)}
                            placeholder={language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)'
                            }}
                        />
                    </div>

                    {/* WhatsApp Contact */}
                    <div className="form-group">
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '16px',
                                background: whatsappEnabled ? '#dcfce7' : 'var(--color-bg)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: whatsappEnabled ? '#22c55e' : 'var(--color-border)'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={whatsappEnabled}
                                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                                style={{ width: 24, height: 24 }}
                            />
                            <span style={{ fontSize: 24 }}>💬</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}
                            </span>
                        </label>
                    </div>

                    {/* Submit button */}
                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                    >
                        {loading
                            ? (language === 'hi' ? 'पोस्ट हो रहा है...' : 'Posting...')
                            : (language === 'hi' ? '📤 नौकरी पोस्ट करें' : '📤 Post Job')
                        }
                    </button>
                </>
            )}
        </>
    )
}
