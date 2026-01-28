import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { BOOKS_ITEMS, BooksItem, Condition } from '../../lib/sellFormConstants'
import { CategoryBadge } from './CategoryBadge'
import { ItemSelector } from './ItemSelector'
import { SellerContactInfo } from './SellerContactInfo'
import { Disclaimer } from './Disclaimer'
import { ImageUpload } from '../ImageUpload'
import { useSellLocationDefaults } from '../../hooks/useSellLocationDefaults'
import { PrefilledLabel } from './PrefilledLabel'

interface BooksFormProps {
    onBack: () => void
    onSubmit: (data: BooksFormData) => Promise<void>
    loading: boolean
}

export interface BooksFormData {
    name: string
    selectedIcon: string
    author: string
    subject: string
    classLevel: string
    publisher: string
    bookLanguage: string
    condition: Condition
    price: string
    location: string
    pincode: string
    sellerPhone: string
    whatsappEnabled: boolean
    imageFiles: File[]
    imagePreviews: string[]
    thumbnailIndex: number
}

export function BooksForm({ onBack, onSubmit, loading }: BooksFormProps) {
    const { t, language } = useApp()

    const [booksItem, setBooksItem] = useState<string>('')
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [author, setAuthor] = useState('')
    const [subject, setSubject] = useState('')
    const [classLevel, setClassLevel] = useState('')
    const [publisher, setPublisher] = useState('')
    const [bookLanguage, setBookLanguage] = useState('')
    const [condition, setCondition] = useState<Condition>('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [pincode, setPincode] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [thumbnailIndex, setThumbnailIndex] = useState(0)

    const { source } = useSellLocationDefaults({
        location,
        setLocation,
        pincode,
        setPincode,
        phone: sellerPhone,
        setPhone: setSellerPhone
    })

    const handleSelectItem = (item: BooksItem) => {
        setBooksItem(item.id)
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

    const handleThumbnailChange = (index: number) => {
        setThumbnailIndex(index)
    }

    const handleSubmit = () => {
        onSubmit({
            name, selectedIcon, author, subject, classLevel, publisher, bookLanguage, condition,
            price, location, pincode, sellerPhone, whatsappEnabled, imageFiles, imagePreviews, thumbnailIndex
        })
    }

    const showDetails = booksItem && (booksItem !== 'other' || name.trim())
    const canSubmit = name.trim() && condition && price && sellerPhone.trim()

    return (
        <>
            <CategoryBadge icon="📚" labelHi="पुस्तकें" labelEn="Books" onChangeClick={onBack} />

            <div className="form-group">
                <label className="form-label">
                    {language === 'hi' ? 'किस तरह की किताब?' : 'What type of book?'}
                </label>
                <ItemSelector
                    items={BOOKS_ITEMS}
                    selectedId={booksItem}
                    onSelect={handleSelectItem}
                    showCustomInput={showCustomInput}
                    customInputValue={name}
                    onCustomInputChange={setName}
                    customInputPlaceholder={{ hi: 'किताब का नाम लिखें...', en: 'Type book name...' }}
                />
            </div>

            {showDetails && (
                <>
                    {/* Book Title */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'किताब का नाम' : 'Book Title'}</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: Physics Class 12, Harry Potter...' : 'e.g., Physics Class 12, Harry Potter...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Author */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'लेखक का नाम' : 'Author Name'}</label>
                        <input type="text" className="form-input" value={author} onChange={(e) => setAuthor(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: R.D. Sharma, Premchand...' : 'e.g., R.D. Sharma, Premchand...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'विषय' : 'Subject'}</label>
                        <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: गणित, विज्ञान, हिंदी...' : 'e.g., Mathematics, Science, Hindi...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Class/Level */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'कक्षा/स्तर' : 'Class/Level'}</label>
                        <input type="text" className="form-input" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: 10वीं, 12वीं, B.A., SSC...' : 'e.g., 10th, 12th, B.A., SSC...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Publisher */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'प्रकाशक' : 'Publisher'}</label>
                        <input type="text" className="form-input" value={publisher} onChange={(e) => setPublisher(e.target.value)}
                            placeholder={language === 'hi' ? 'जैसे: NCERT, Arihant, S.Chand...' : 'e.g., NCERT, Arihant, S.Chand...'}
                            style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Language */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'भाषा' : 'Language'}</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['Hindi', 'English', 'Both'].map(lang => (
                                <button key={lang} type="button" className={`btn btn-sm ${bookLanguage === lang ? 'btn-primary' : 'btn-outline'}`} onClick={() => setBookLanguage(lang)}>
                                    {lang === 'Hindi' ? 'हिंदी' : lang === 'English' ? 'English' : 'दोनों/Both'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Condition */}
                    <div className="form-group">
                        <label className="form-label">{language === 'hi' ? 'स्थिति *' : 'Condition *'}</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCondition('new')} style={{ flex: 1 }}>
                                ✨ {language === 'hi' ? 'नई' : 'New'}
                            </button>
                            <button type="button" className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCondition('old')} style={{ flex: 1 }}>
                                📖 {language === 'hi' ? 'पुरानी' : 'Used'}
                            </button>
                        </div>
                    </div>

                    <ImageUpload onImagesChange={handleImagesChange} currentPreviews={imagePreviews} maxImages={3} thumbnailIndex={thumbnailIndex} onThumbnailChange={handleThumbnailChange} />

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">{t('enter_price')} *</label>
                        <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹"
                            style={{ width: '100%', padding: '16px', fontSize: '24px', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--color-border)' }} />
                    </div>

                    <PrefilledLabel source={source} />
                    <SellerContactInfo
                        location={location} onLocationChange={setLocation}
                        pincode={pincode} onPincodeChange={setPincode}
                        sellerPhone={sellerPhone} onSellerPhoneChange={setSellerPhone}
                        whatsappEnabled={whatsappEnabled} onWhatsappEnabledChange={setWhatsappEnabled}
                    />

                    {/* Summary Card */}
                    <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{name} {author && `- ${author}`}</div>
                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>{condition === 'new' ? '✨ नई/New' : '📖 पुरानी/Used'}</div>
                                {subject && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>📚 {subject} {classLevel && `| Class: ${classLevel}`}</div>}
                                {publisher && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>📝 {publisher}</div>}
                                {bookLanguage && <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>🌐 {bookLanguage}</div>}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>₹{price || '0'}</div>
                        </div>
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
