import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { VEHICLES_ITEMS, FUEL_OPTIONS, VehiclesItem } from '../../lib/sellFormConstants'
import { CategoryBadge } from './CategoryBadge'
import { ItemSelector } from './ItemSelector'
import { SellerContactInfo } from './SellerContactInfo'
import { Disclaimer } from './Disclaimer'
import { ImageUpload } from '../ImageUpload'

interface VehiclesFormProps {
    onBack: () => void
    onSubmit: (data: VehiclesFormData) => Promise<void>
    loading: boolean
}

export interface VehiclesFormData {
    name: string
    selectedIcon: string
    companyName: string
    modelName: string
    vehicleYear: string
    kmDriven: string
    fuelType: string
    ownerCount: string
    hasRC: boolean | null
    hasInsurance: boolean | null
    defects: string
    price: string
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
    imageFiles: File[]
    imagePreviews: string[]
}

export function VehiclesForm({ onBack, onSubmit, loading }: VehiclesFormProps) {
    const { t, language } = useApp()

    const [vehiclesItem, setVehiclesItem] = useState<string>('')
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [companyName, setCompanyName] = useState('')
    const [modelName, setModelName] = useState('')
    const [vehicleYear, setVehicleYear] = useState('')
    const [kmDriven, setKmDriven] = useState('')
    const [fuelType, setFuelType] = useState('')
    const [ownerCount, setOwnerCount] = useState('')
    const [hasRC, setHasRC] = useState<boolean | null>(null)
    const [hasInsurance, setHasInsurance] = useState<boolean | null>(null)
    const [defects, setDefects] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleSelectItem = (item: VehiclesItem) => {
        setVehiclesItem(item.id)
        setName(language === 'hi' ? item.hi : item.en)
        setSelectedIcon(item.icon)
        if (item.id === 'other') {
            setShowCustomInput(true)
            setName('')
        } else {
            setShowCustomInput(false)
        }
    }

    const handleImagesChange = (files: File[], previews: string[]) => {
        setImageFiles(files)
        setImagePreviews(previews)
    }

    const handleSubmit = () => {
        onSubmit({
            name, selectedIcon, companyName, modelName, vehicleYear, kmDriven, fuelType, ownerCount,
            hasRC, hasInsurance, defects, price, location, pincode, sellerPhone, whatsappEnabled, imageFiles, imagePreviews
        })
    }

    const showDetails = vehiclesItem && (vehiclesItem !== 'other' || name.trim())
    const canSubmit = name.trim() && companyName.trim() && price && sellerPhone.trim()

    return (
        <>
            <CategoryBadge icon="🛵" labelHi="वाहन" labelEn="Vehicles" onChangeClick={onBack} />

            <div className="form-group">
                <label className="form-label">{language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}</label>
                <ItemSelector
                    items={VEHICLES_ITEMS}
                    selectedId={vehiclesItem}
                    onSelect={handleSelectItem}
                    showCustomInput={showCustomInput}
                    customInputValue={name}
                    onCustomInputChange={setName}
                    customInputPlaceholder={{ hi: 'वाहन का प्रकार लिखें...', en: 'Type vehicle type...' }}
                />
            </div>

            {showDetails && (
                <>
                    {/* Company/Brand */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कंपनी/ब्रांड *' : 'Company/Brand *'}</label>
                        <input type="text" className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: Hero, Honda, Maruti...' : 'e.g., Hero, Honda, Maruti...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Model Name */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'मॉडल (वैकल्पिक)' : 'Model (Optional)'}</label>
                        <input type="text" className="form-input" value={modelName} onChange={(e) => setModelName(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: Splendor Plus, Swift VXI...' : 'e.g., Splendor Plus, Swift VXI...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Year of Purchase */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'खरीदने का साल' : 'Year of Purchase'}</label>
                        <input type="number" className="form-input" value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: 2018, 2020...' : 'e.g., 2018, 2020...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* KM Driven */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कितना चला है? (KM)' : 'KM Driven'}</label>
                        <input type="number" className="form-input" value={kmDriven} onChange={(e) => setKmDriven(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: 15000' : 'e.g., 15000'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Fuel Type */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'ईंधन का प्रकार' : 'Fuel Type'}</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {FUEL_OPTIONS.map(f => (
                                <button key={f.id} type="button" className={`btn btn-sm ${fuelType === f.label ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFuelType(f.label)}>
                                    {f.icon} {f.label.split('/')[language === 'hi' ? 1 : 0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Owner Count */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कौन सा मालिक?' : 'Owner Number'}</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['1st', '2nd', '3rd', '4th+'].map(o => (
                                <button key={o} type="button" className={`btn btn-sm ${ownerCount === o ? 'btn-primary' : 'btn-outline'}`} onClick={() => setOwnerCount(o)} style={{ flex: 1 }}>
                                    {o}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'दस्तावेज़' : 'Documents'}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>📄 RC Available?</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" className={`btn btn-sm ${hasRC === true ? 'btn-success' : 'btn-outline'}`} onClick={() => setHasRC(true)}>Yes</button>
                                    <button type="button" className={`btn btn-sm ${hasRC === false ? 'btn-outline' : 'btn-outline'}`} onClick={() => setHasRC(false)}>No</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>🛡️ Insurance?</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" className={`btn btn-sm ${hasInsurance === true ? 'btn-success' : 'btn-outline'}`} onClick={() => setHasInsurance(true)}>Yes</button>
                                    <button type="button" className={`btn btn-sm ${hasInsurance === false ? 'btn-outline' : 'btn-outline'}`} onClick={() => setHasInsurance(false)}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Defects */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कोई खराबी/दोष?' : 'Any Defects/Issues?'}</label>
                        <textarea className="form-input" value={defects} onChange={(e) => setDefects(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: टायर पुराने हैं, इंजन में आवाज़...' : 'e.g., Tyres need replacement, Engine noise...'} rows={2}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)', resize: 'vertical' }} />
                    </div>

                    <ImageUpload onImagesChange={handleImagesChange} currentPreviews={imagePreviews} maxImages={5} />

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">{t('enter_price')} *</label>
                        <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹"
                            style={{ width: '100%', padding: '16px', fontSize: '24px', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    <SellerContactInfo location={location} onLocationChange={setLocation} pincode={pincode} onPincodeChange={setPincode}
                        sellerPhone={sellerPhone} onSellerPhoneChange={setSellerPhone} whatsappEnabled={whatsappEnabled} onWhatsappEnabledChange={setWhatsappEnabled} />

                    {/* Summary Card */}
                    <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{companyName} {name} {modelName}</div>
                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>{vehicleYear ? `${vehicleYear} • ` : ''}{kmDriven ? `${kmDriven} KM` : ''}</div>
                                {fuelType && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>⛽ {fuelType} {ownerCount && `• ${ownerCount} Owner`}</div>}
                                <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                                    {hasRC && <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✅ RC</span>}
                                    {hasInsurance && <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✅ Insurance</span>}
                                </div>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>₹{price || '0'}</div>
                        </div>
                        {defects && <div style={{ color: 'var(--color-warning)', marginBottom: 8 }}>⚠️ {defects}</div>}
                        {location && <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>}
                        {sellerPhone && <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}><span>📞 {sellerPhone}</span>{whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}</div>}
                    </div>

                    <Disclaimer />

                    <button className="btn btn-success" onClick={handleSubmit} disabled={loading || !canSubmit}>
                        {loading ? t('loading') : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                    </button>
                </>
            )}
        </>
    )
}
