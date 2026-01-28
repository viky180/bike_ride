import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CategoryBadge } from './CategoryBadge'
import { ImageUpload } from '../ImageUpload'
import { PincodeInput } from '../PincodeInput'
import { searchMedicines } from '../../lib/medicines'
import { CATEGORIES } from '../../lib/categories'
import { useSellLocationDefaults } from '../../hooks/useSellLocationDefaults'
import { PrefilledLabel } from './PrefilledLabel'

interface PharmacyFormProps {
    onBack: () => void
    onSubmit: (data: PharmacyFormData) => Promise<void>
    loading: boolean
}

export interface PharmacyFormData {
    shopName: string
    medicines: string[]
    discountPercent: string
    location: string
    pincode: string
    imageFiles: File[]
    imagePreviews: string[]
    thumbnailIndex: number
}

export function PharmacyForm({ onBack, onSubmit, loading }: PharmacyFormProps) {
    const { t, language } = useApp()

    const [shopName, setShopName] = useState('')
    const [medicineInput, setMedicineInput] = useState('')
    const [selectedMedicines, setSelectedMedicines] = useState<string[]>([])
    const [medicineSuggestions, setMedicineSuggestions] = useState<{ name: string, hi: string }[]>([])
    const [discountPercent, setDiscountPercent] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [thumbnailIndex, setThumbnailIndex] = useState(0)

    const { source } = useSellLocationDefaults({
        location,
        setLocation,
        pincode,
        setPincode
    })

    // Pharmacy category details
    const pharmacyCat = CATEGORIES.find(c => c.id === 'pharmacy')

    const handleMedicineInput = (value: string) => {
        setMedicineInput(value)
        if (value.length > 1) {
            setMedicineSuggestions(searchMedicines(value))
        } else {
            setMedicineSuggestions([])
        }
    }

    const addMedicine = (name: string) => {
        if (!selectedMedicines.includes(name)) {
            setSelectedMedicines([...selectedMedicines, name])
        }
        setMedicineInput('')
        setMedicineSuggestions([])
    }

    const removeMedicine = (name: string) => {
        setSelectedMedicines(selectedMedicines.filter(m => m !== name))
    }

    const handleImagesChange = (files: File[], previews: string[]) => {
        setImageFiles(files)
        setImagePreviews(previews)
    }

    const handleThumbnailChange = (index: number) => {
        setThumbnailIndex(index)
    }

    const handleSubmit = () => {
        onSubmit({
            shopName,
            medicines: selectedMedicines,
            discountPercent,
            location,
            pincode,
            imageFiles,
            imagePreviews,
            thumbnailIndex
        })
    }

    const canSubmit = shopName.trim() && location.trim() && pincode.length === 6

    return (
        <>
            <CategoryBadge
                icon={pharmacyCat?.icon || '💊'}
                labelHi={pharmacyCat?.hi || 'दवाखाना'}
                labelEn={pharmacyCat?.en || 'Pharmacy'}
                onChangeClick={onBack}
            />

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'दुकान का नाम' : 'Shop Name'} <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder={language === 'hi' ? 'अपनी दुकान का नाम लिखें' : 'Enter your shop name'}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-border)'
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'उपलब्ध दवाइयाँ (वैकल्पिक)' : 'Available Medicines (Optional)'}
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        className="form-input"
                        value={medicineInput}
                        onChange={(e) => handleMedicineInput(e.target.value)}
                        placeholder={language === 'hi' ? 'दवाई खोजें...' : 'Search medicine...'}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)'
                        }}
                    />
                    {medicineSuggestions.length > 0 && (
                        <div className="suggestions-list" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            zIndex: 10,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            {medicineSuggestions.map((med) => (
                                <div
                                    key={med.name}
                                    onClick={() => addMedicine(med.name)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}
                                >
                                    <div>{med.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>{med.hi}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Medicines Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {selectedMedicines.map(med => (
                        <div key={med} style={{
                            background: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {med}
                            <button
                                onClick={() => removeMedicine(med)}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >×</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'छूट (वैकल्पिक)' : 'Discount (Optional)'}
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="e.g. 10, 20"
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-border)'
                    }}
                />
            </div>

            <ImageUpload
                onImagesChange={handleImagesChange}
                currentPreviews={imagePreviews}
                maxImages={3}
                thumbnailIndex={thumbnailIndex}
                onThumbnailChange={handleThumbnailChange}
            />

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'स्थान' : 'Location'} <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: मेन मार्किट, रामपुर' : 'e.g., Main Market, Rampur'}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '18px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-border)'
                    }}
                />
            </div>

            <PrefilledLabel source={source} />

            <PincodeInput value={pincode} onChange={setPincode} required />

            <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
            >
                {loading ? t('loading') : (language === 'hi' ? 'दुकान लिस्ट करें' : 'List Pharmacy')}
            </button>
        </>
    )
}
