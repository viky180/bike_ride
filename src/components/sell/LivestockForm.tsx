import { useState } from 'react'
import { LIVESTOCK_ITEMS, URGENCY_OPTIONS, SELLING_TYPE_OPTIONS, LACTATION_OPTIONS, LivestockItem } from '../../lib/sellFormConstants'
import { CategoryBadge } from './CategoryBadge'
import { ItemSelector } from './ItemSelector'
import { Disclaimer } from './Disclaimer'
import { ImageUpload } from '../ImageUpload'
import { PincodeInput } from '../PincodeInput'

interface LivestockFormProps {
    onBack: () => void
    onSubmit: (data: LivestockFormData) => Promise<void>
    loading: boolean
}

export interface LivestockFormData {
    name: string
    selectedIcon: string
    sellingUrgency: string
    sellingType: string
    lactationStage: string
    milkYield: string
    defects: string
    price: string
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
    imageFiles: File[]
    imagePreviews: string[]
}

export function LivestockForm({ onBack, onSubmit, loading }: LivestockFormProps) {

    const [livestockItem, setLivestockItem] = useState<string>('')
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [sellingUrgency, setSellingUrgency] = useState('')
    const [sellingType, setSellingType] = useState('')
    const [lactationStage, setLactationStage] = useState('')
    const [milkYield, setMilkYield] = useState('')
    const [defects, setDefects] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleSelectItem = (item: LivestockItem) => {
        setLivestockItem(item.id)
        setName(item.hi)
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
            name, selectedIcon, sellingUrgency, sellingType, lactationStage, milkYield, defects,
            price, location, pincode, sellerPhone, whatsappEnabled, imageFiles, imagePreviews
        })
    }

    const showDetails = livestockItem && (livestockItem !== 'other' || name.trim())
    const canSubmit = name.trim() && price && sellerPhone.trim()
    const isDairyAnimal = livestockItem === 'cow' || livestockItem === 'buffalo'

    return (
        <>
            <CategoryBadge icon="🐄" labelHi="पशु बेचें" labelEn="Sell Livestock" onChangeClick={onBack} />

            {/* Animal Type Selection */}
            <div className="form-group">
                <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>
                    🐄 कौन सा पशु बेचना है?
                </label>
                <ItemSelector
                    items={LIVESTOCK_ITEMS}
                    selectedId={livestockItem}
                    onSelect={handleSelectItem}
                    showCustomInput={showCustomInput}
                    customInputValue={name}
                    onCustomInputChange={setName}
                    customInputPlaceholder={{ hi: 'पशु का नाम लिखें...', en: 'Type animal name...' }}
                    itemStyle={{ padding: '16px', minHeight: 80 }}
                />
            </div>

            {showDetails && (
                <>
                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>💰 रेट (₹) *</label>
                        <small style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-light)' }}>
                            सही रेट डालें, उससे ज़्यादा ग्राहक कॉल करते हैं
                        </small>
                        <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="जैसे: ₹40,000"
                            style={{ width: '100%', padding: '20px', fontSize: '24px', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                        <button type="button" style={{ marginTop: 12, width: '100%', padding: '14px', borderRadius: 12, border: '2px dashed #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onClick={() => alert('जल्द आ रहा है!')}>₹ इस पशु का सही रेट जानें</button>
                    </div>

                    {/* Selling Urgency */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>⏰ कितने दिन में बेचना है?</label>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {URGENCY_OPTIONS.map(opt => (
                                <button key={opt.id} type="button" onClick={() => setSellingUrgency(opt.id)}
                                    style={{
                                        flex: 1, minWidth: 100, padding: '14px 16px', borderRadius: 25, border: 'none',
                                        background: sellingUrgency === opt.id ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#f1f5f9',
                                        color: sellingUrgency === opt.id ? 'white' : '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer'
                                    }}>
                                    {opt.hi}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selling Type */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>🏠 कैसा पशु बेचना चाहते हो?</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {SELLING_TYPE_OPTIONS.map(opt => (
                                <button key={opt.id} type="button" onClick={() => setSellingType(opt.id)}
                                    style={{
                                        flex: 1, padding: '16px', borderRadius: 12, border: sellingType === opt.id ? '2px solid #22c55e' : '2px solid #e2e8f0',
                                        background: sellingType === opt.id ? '#dcfce7' : 'white', color: sellingType === opt.id ? '#166534' : '#475569', fontSize: 16, fontWeight: 600, cursor: 'pointer'
                                    }}>
                                    {opt.hi}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>📸 वीडियो या फोटो डालें *</label>
                        <small style={{ display: 'block', marginBottom: 12, color: 'var(--color-text-light)' }}>अच्छी फोटो डालने पर जल्दी बिकती है</small>
                        <ImageUpload onImagesChange={handleImagesChange} currentPreviews={imagePreviews} maxImages={5} />
                    </div>

                    {/* Lactation Stage (dairy animals) */}
                    {isDairyAnimal && (
                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>🍼 कौन सा ब्यांत?</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {LACTATION_OPTIONS.map(opt => (
                                    <button key={opt.id} type="button" onClick={() => setLactationStage(opt.id)}
                                        style={{
                                            flex: 1, minWidth: 80, padding: '12px 16px', borderRadius: 25, border: 'none',
                                            background: lactationStage === opt.id ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#f1f5f9',
                                            color: lactationStage === opt.id ? 'white' : '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer'
                                        }}>
                                        {opt.hi}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milk Yield (dairy animals that have calved) */}
                    {isDairyAnimal && lactationStage && lactationStage !== 'none' && (
                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>🥛 अभी का दूध (प्रति-दिन) *</label>
                            <small style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-light)' }}>आज के 2 समय का कुल दूध</small>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <input type="number" className="form-input" value={milkYield} onChange={(e) => setMilkYield(e.target.value)} placeholder="जैसे: 10"
                                    style={{ flex: 1, padding: '16px', fontSize: '20px', fontWeight: 600, borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-light)' }}>लीटर</span>
                            </div>
                        </div>
                    )}

                    {/* Additional Details */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>📝 अन्य विवरण</label>
                        <textarea className="form-input" value={defects} onChange={(e) => setDefects(e.target.value)} placeholder="जैसे: 3 साल की, बहुत शांत, टीके लगे हुए..." rows={3}
                            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', border: '2px solid var(--color-border)', resize: 'vertical' }} />
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>📍 पता/गाँव</label>
                        <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="जैसे: रामपुर गाँव, ब्लॉक..."
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    <PincodeInput value={pincode} onChange={setPincode} required />

                    {/* Seller Phone */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontSize: 18, fontWeight: 600 }}>📞 संपर्क नंबर *</label>
                        <input type="tel" className="form-input" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} placeholder="10 अंकों का मोबाइल नंबर"
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* WhatsApp Contact */}
                    <div className="form-group">
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '16px',
                            background: whatsappEnabled ? '#dcfce7' : 'var(--color-bg)', borderRadius: '12px', cursor: 'pointer', border: '2px solid', borderColor: whatsappEnabled ? '#22c55e' : 'var(--color-border)'
                        }}>
                            <input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: 24 }}>💬</span>
                            <span style={{ fontWeight: 600 }}>WhatsApp पर संपर्क करें</span>
                        </label>
                    </div>

                    {/* Summary Card */}
                    <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 40 }}>{selectedIcon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 20 }}>{name}</div>
                                {sellingType && <div style={{ color: '#92400e', fontSize: 14 }}>{SELLING_TYPE_OPTIONS.find(t => t.id === sellingType)?.hi}</div>}
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>₹{price || '0'}</div>
                        </div>
                        {milkYield && <div style={{ color: '#1d4ed8', fontWeight: 600 }}>🥛 दूध: {milkYield} लीटर/दिन</div>}
                        {location && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>📍 {location}</div>}
                        {sellerPhone && <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}><span>📞 {sellerPhone}</span>{whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}</div>}
                    </div>

                    <Disclaimer />

                    <button className="btn btn-success" onClick={handleSubmit} disabled={loading || !canSubmit} style={{ fontSize: 18, padding: '18px 24px' }}>
                        {loading ? 'पोस्ट हो रहा है...' : '📤 विज्ञापन पोस्ट करें'}
                    </button>
                </>
            )}
        </>
    )
}
