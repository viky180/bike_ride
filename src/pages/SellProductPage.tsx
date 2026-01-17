import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductCategory } from '../lib/supabase'
import { HERO_CATEGORIES, STANDARD_CATEGORIES, CATEGORIES } from '../lib/categories'
import { getPopularProducts, PopularProduct } from '../lib/popularProducts'
import { Header } from '../components/Header'
import { ImageUpload } from '../components/ImageUpload'

// Electronics sub-items
const ELECTRONICS_ITEMS = [
    { id: 'phone', icon: '📱', en: 'Phone', hi: 'फोन' },
    { id: 'laptop', icon: '💻', en: 'Laptop', hi: 'लैपटॉप' },
    { id: 'ac', icon: '❄️', en: 'AC', hi: 'एसी' },
    { id: 'geyser', icon: '🚿', en: 'Geyser', hi: 'गीज़र' },
    { id: 'bulb', icon: '💡', en: 'Bulb/Light', hi: 'बल्ब/लाइट' },
    { id: 'earphone', icon: '🎧', en: 'Earphone', hi: 'ईयरफोन' },
    { id: 'mixer', icon: '🍹', en: 'Mixer/Grinder', hi: 'मिक्सर/ग्राइंडर' },
    { id: 'accessories', icon: '🔌', en: 'Mobile Accessories', hi: 'मोबाइल एसेसरीज़' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
]

// Clothes sub-items
const CLOTHES_ITEMS = [
    { id: 'shirt', icon: '👔', en: 'Shirt', hi: 'शर्ट' },
    { id: 'tshirt', icon: '👕', en: 'T-Shirt', hi: 'टी-शर्ट' },
    { id: 'pants', icon: '👖', en: 'Pants/Jeans', hi: 'पैंट/जींस' },
    { id: 'kurta', icon: '🥻', en: 'Kurta', hi: 'कुर्ता' },
    { id: 'saree', icon: '👗', en: 'Saree', hi: 'साड़ी' },
    { id: 'suit', icon: '🤵', en: 'Suit/Blazer', hi: 'सूट/ब्लेज़र' },
    { id: 'dress', icon: '👗', en: 'Dress', hi: 'ड्रेस' },
    { id: 'jacket', icon: '🧥', en: 'Jacket/Sweater', hi: 'जैकेट/स्वेटर' },
    { id: 'kids', icon: '🧒', en: 'Kids Wear', hi: 'बच्चों के कपड़े' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
]

// Size options for clothes
const SIZE_OPTIONS = [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
    { id: 'xxl', label: 'XXL' },
    { id: 'free', label: 'Free Size' },
]

// Books sub-items
const BOOKS_ITEMS = [
    { id: 'textbook', icon: '📖', en: 'Textbook', hi: 'पाठ्यपुस्तक' },
    { id: 'novel', icon: '📚', en: 'Novel/Story', hi: 'नॉवेल/कहानी' },
    { id: 'competitive', icon: '🏆', en: 'Competitive Exam', hi: 'प्रतियोगी परीक्षा' },
    { id: 'ncert', icon: '🏫', en: 'NCERT/CBSE', hi: 'NCERT/CBSE' },
    { id: 'reference', icon: '📑', en: 'Reference Book', hi: 'संदर्भ पुस्तक' },
    { id: 'religious', icon: '🙏', en: 'Religious', hi: 'धार्मिक' },
    { id: 'children', icon: '👶', en: 'Children Books', hi: 'बच्चों की किताबें' },
    { id: 'magazine', icon: '📰', en: 'Magazine/Comics', hi: 'मैगज़ीन/कॉमिक्स' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
]

// Vehicles sub-items
const VEHICLES_ITEMS = [
    { id: 'scooter', icon: '🛵', en: 'Scooter', hi: 'स्कूटर' },
    { id: 'motorcycle', icon: '🏍️', en: 'Motorcycle', hi: 'मोटरसाइकिल' },
    { id: 'bicycle', icon: '🚲', en: 'Bicycle', hi: 'साइकिल' },
    { id: 'car', icon: '🚗', en: 'Car', hi: 'कार' },
    { id: 'auto', icon: '🛺', en: 'Auto Rickshaw', hi: 'ऑटो रिक्शा' },
    { id: 'tractor', icon: '🚜', en: 'Tractor', hi: 'ट्रैक्टर' },
    { id: 'truck', icon: '🚚', en: 'Truck/Tempo', hi: 'ट्रक/टेंपो' },
    { id: 'electric', icon: '⚡', en: 'Electric Vehicle', hi: 'इलेक्ट्रिक वाहन' },
    { id: 'other', icon: '📦', en: 'Other', hi: 'अन्य' },
]

// Fuel type options
const FUEL_OPTIONS = [
    { id: 'petrol', label: 'Petrol/पेट्रोल', icon: '⛽' },
    { id: 'diesel', label: 'Diesel/डीज़ल', icon: '🛢️' },
    { id: 'electric', label: 'Electric/इलेक्ट्रिक', icon: '⚡' },
    { id: 'cng', label: 'CNG', icon: '💨' },
    { id: 'manual', label: 'Manual/मैनुअल', icon: '🚴' },
]

export function SellProductPage() {
    const { t, user, showToast, language } = useApp()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState<string>('')
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // Electronics-specific fields
    const [electronicsItem, setElectronicsItem] = useState<string>('')
    const [modelName, setModelName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [condition, setCondition] = useState<'new' | 'old' | ''>('')
    const [yearsUsed, setYearsUsed] = useState('')
    const [hasBill, setHasBill] = useState<boolean | null>(null)
    const [defects, setDefects] = useState('')
    const [sellerPhone, setSellerPhone] = useState('')
    const [whatsappEnabled, setWhatsappEnabled] = useState(true)

    // Clothes-specific fields
    const [clothesItem, setClothesItem] = useState<string>('')
    const [brand, setBrand] = useState('')
    const [size, setSize] = useState('')
    const [material, setMaterial] = useState('')
    const [color, setColor] = useState('')
    const [gender, setGender] = useState<'men' | 'women' | 'kids' | 'unisex' | ''>('')

    // Books-specific fields
    const [booksItem, setBooksItem] = useState<string>('')
    const [author, setAuthor] = useState('')
    const [publisher, setPublisher] = useState('')
    const [subject, setSubject] = useState('')
    const [classLevel, setClassLevel] = useState('')
    const [bookLanguage, setBookLanguage] = useState('')

    // Vehicles-specific fields
    const [vehiclesItem, setVehiclesItem] = useState<string>('')
    const [vehicleYear, setVehicleYear] = useState('')
    const [kmDriven, setKmDriven] = useState('')
    const [fuelType, setFuelType] = useState('')
    const [hasRC, setHasRC] = useState<boolean | null>(null)
    const [hasInsurance, setHasInsurance] = useState<boolean | null>(null)
    const [ownerCount, setOwnerCount] = useState('')

    const handleSelectCategory = (cat: ProductCategory) => {
        setCategory(cat)
        setName('')
        setSelectedIcon('')
        setShowCustomInput(false)
        // Reset electronics fields
        setElectronicsItem('')
        setModelName('')
        setCompanyName('')
        setCondition('')
        setYearsUsed('')
        setHasBill(null)
        setDefects('')
        // Reset clothes fields
        setClothesItem('')
        setBrand('')
        setSize('')
        setMaterial('')
        setColor('')
        setGender('')
        // Reset books fields
        setBooksItem('')
        setAuthor('')
        setPublisher('')
        setSubject('')
        setClassLevel('')
        setBookLanguage('')
        // Reset vehicles fields
        setVehiclesItem('')
        setVehicleYear('')
        setKmDriven('')
        setFuelType('')
        setHasRC(null)
        setHasInsurance(null)
        setOwnerCount('')
        setStep(2)
    }

    const handleSelectVehiclesItem = (item: typeof VEHICLES_ITEMS[0]) => {
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

    const handleSelectBooksItem = (item: typeof BOOKS_ITEMS[0]) => {
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

    const handleSelectClothesItem = (item: typeof CLOTHES_ITEMS[0]) => {
        setClothesItem(item.id)
        setName(language === 'hi' ? item.hi : item.en)
        setSelectedIcon(item.icon)
        if (item.id === 'other') {
            setShowCustomInput(true)
            setName('')
        } else {
            setShowCustomInput(false)
        }
    }

    const handleSelectElectronicsItem = (item: typeof ELECTRONICS_ITEMS[0]) => {
        setElectronicsItem(item.id)
        setName(language === 'hi' ? item.hi : item.en)
        setSelectedIcon(item.icon)
        if (item.id === 'other') {
            setShowCustomInput(true)
            setName('')
        } else {
            setShowCustomInput(false)
        }
    }

    const handleSelectProduct = (product: PopularProduct) => {
        setName(language === 'hi' ? product.hi : product.name)
        setSelectedIcon(product.icon)
        setShowCustomInput(false)
    }

    const handleCustomInput = () => {
        setShowCustomInput(true)
        setSelectedIcon('')
    }

    const handleImagesChange = (files: File[], previews: string[]) => {
        setImageFiles(files)
        setImagePreviews(previews)
    }

    const handleSubmit = async () => {
        if (!category || !name.trim() || !price || !user) return

        // Electronics validation
        if (category === 'electronics') {
            if (!companyName.trim() || !condition || !sellerPhone.trim()) {
                showToast(language === 'hi'
                    ? '⚠️ कृपया सभी आवश्यक जानकारी भरें'
                    : '⚠️ Please fill all required fields')
                return
            }
        } else if (category === 'clothes') {
            if (!condition || !size || !sellerPhone.trim()) {
                showToast(language === 'hi'
                    ? '⚠️ कृपया सभी आवश्यक जानकारी भरें'
                    : '⚠️ Please fill all required fields')
                return
            }
        } else if (category === 'books') {
            if (!condition || !sellerPhone.trim()) {
                showToast(language === 'hi'
                    ? '⚠️ कृपया सभी आवश्यक जानकारी भरें'
                    : '⚠️ Please fill all required fields')
                return
            }
        } else if (category === 'vehicles') {
            if (!companyName.trim() || !sellerPhone.trim()) {
                showToast(language === 'hi'
                    ? '⚠️ कृपया सभी आवश्यक जानकारी भरें'
                    : '⚠️ Please fill all required fields')
                return
            }
        } else {
            if (!quantity.trim()) return
        }

        setLoading(true)
        try {
            const imageUrls: string[] = []

            // Upload all images
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i]
                const fileExt = file.name.split('.').pop() || 'jpg'
                const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    console.error('Image upload error:', uploadError)
                    showToast(language === 'hi'
                        ? `⚠️ फोटो ${i + 1} अपलोड नहीं हुई`
                        : `⚠️ Photo ${i + 1} upload failed`)
                } else if (uploadData) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(uploadData.path)
                    imageUrls.push(publicUrl)
                }
            }

            // Build product name with details for electronics
            let productName = name.trim()
            let productQuantity = quantity.trim() || '1 piece'

            if (category === 'electronics') {
                productName = `${companyName} ${name}`.trim()
                if (modelName) productName += ` (${modelName})`

                // Build description as quantity field for electronics
                const details: string[] = []
                details.push(condition === 'new' ? 'नया/New' : `पुराना/Used ${yearsUsed ? `(${yearsUsed} साल)` : ''}`)
                if (hasBill) details.push('बिल उपलब्ध/Bill available')
                if (defects) details.push(`दोष/Defects: ${defects}`)
                details.push(`📞 ${sellerPhone}${whatsappEnabled ? ' (WhatsApp)' : ''}`)
                productQuantity = details.join(' | ')
            } else if (category === 'clothes') {
                productName = brand ? `${brand} ${name}`.trim() : name.trim()
                if (color) productName += ` - ${color}`

                // Build description for clothes
                const details: string[] = []
                details.push(`Size: ${size}`)
                if (gender) details.push(gender === 'men' ? 'पुरुष/Men' : gender === 'women' ? 'महिला/Women' : gender === 'kids' ? 'बच्चे/Kids' : 'Unisex')
                if (material) details.push(material)
                details.push(condition === 'new' ? 'नया/New' : 'पुराना/Used')
                details.push(`📞 ${sellerPhone}${whatsappEnabled ? ' (WhatsApp)' : ''}`)
                productQuantity = details.join(' | ')
            } else if (category === 'books') {
                productName = name.trim()
                if (author) productName += ` - ${author}`

                // Build description for books
                const details: string[] = []
                if (subject) details.push(subject)
                if (classLevel) details.push(`Class: ${classLevel}`)
                if (publisher) details.push(publisher)
                if (bookLanguage) details.push(bookLanguage)
                details.push(condition === 'new' ? 'नया/New' : 'पुराना/Used')
                details.push(`📞 ${sellerPhone}${whatsappEnabled ? ' (WhatsApp)' : ''}`)
                productQuantity = details.join(' | ')
            } else if (category === 'vehicles') {
                productName = `${companyName} ${name}`.trim()
                if (modelName) productName += ` ${modelName}`
                if (vehicleYear) productName += ` (${vehicleYear})`

                // Build description for vehicles
                const details: string[] = []
                if (kmDriven) details.push(`${kmDriven} KM`)
                if (fuelType) details.push(fuelType)
                if (ownerCount) details.push(`${ownerCount} owner`)
                if (hasRC) details.push('RC उपलब्ध/RC Available')
                if (hasInsurance) details.push('बीमा/Insurance')
                if (defects) details.push(`दोष: ${defects}`)
                details.push(`📞 ${sellerPhone}${whatsappEnabled ? ' (WhatsApp)' : ''}`)
                productQuantity = details.join(' | ')
            }

            const { error } = await supabase
                .from('products')
                .insert({
                    seller_id: user.id,
                    category,
                    name: productName,
                    quantity: productQuantity,
                    price: parseInt(price),
                    location: location.trim() || null,
                    image_urls: imageUrls,
                    status: 'available'
                })

            if (error) throw error

            showToast(t('product_posted'))
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi'
                ? `❌ त्रुटि: ${error?.message || 'उत्पाद पोस्ट नहीं हो सका'}`
                : `❌ Error: ${error?.message || 'Could not post product'}`)
        } finally {
            setLoading(false)
        }
    }

    const selectedCat = category ? CATEGORIES.find(c => c.id === category) : null
    const popularProducts = category ? getPopularProducts(category) : []
    const isElectronics = category === 'electronics'
    const isClothes = category === 'clothes'
    const isBooks = category === 'books'
    const isVehicles = category === 'vehicles'

    // Check if electronics form is complete enough to show remaining fields
    const showElectronicsDetails = isElectronics && electronicsItem && (electronicsItem !== 'other' || name.trim())
    const showClothesDetails = isClothes && clothesItem && (clothesItem !== 'other' || name.trim())
    const showBooksDetails = isBooks && booksItem && (booksItem !== 'other' || name.trim())
    const showVehiclesDetails = isVehicles && vehiclesItem && (vehiclesItem !== 'other' || name.trim())

    return (
        <div className="app">
            <Header title={language === 'hi' ? 'सामान बेचें' : 'Sell Items'} showBack />

            <div className="page category-browse-page">
                {/* Step 1: Select Category - Zepto-inspired layout */}
                {step === 1 && (
                    <>
                        {/* Hero Section - Grocery & Essentials */}
                        <section className="category-section">
                            <h2 className="category-section-title">
                                {language === 'hi' ? 'ग्रोसरी और मुख्य ज़रूरतें' : 'Grocery & Essentials'}
                            </h2>
                            <div className="sell-category-hero-grid">
                                {HERO_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        className="sell-category-hero-card"
                                        onClick={() => handleSelectCategory(cat.id)}
                                        style={{
                                            backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                        }}
                                    >
                                        <div className="sell-category-hero-overlay">
                                            <span className="sell-category-hero-name">
                                                {language === 'hi' ? cat.hi : cat.en}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Other Categories - 3 column grid */}
                        <section className="category-section">
                            <h2 className="category-section-title">
                                {language === 'hi' ? 'अन्य श्रेणियाँ' : 'Other Categories'}
                            </h2>
                            <div className="sell-category-standard-grid">
                                {STANDARD_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        className="sell-category-standard-card"
                                        onClick={() => handleSelectCategory(cat.id)}
                                        style={{
                                            backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                                        }}
                                    >
                                        <div className="sell-category-standard-overlay">
                                            <span className="sell-category-standard-name">
                                                {language === 'hi' ? cat.hi : cat.en}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* Step 2: Electronics-specific form */}
                {step === 2 && isElectronics && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>📱</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? 'इलेक्ट्रॉनिक्स' : 'Electronics'}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Electronics item selection */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                            </label>
                            <div className="popular-products-grid">
                                {ELECTRONICS_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        className={`popular-product-btn ${electronicsItem === item.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectElectronicsItem(item)}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span className="name">{language === 'hi' ? item.hi : item.en}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom input for "Other" */}
                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={language === 'hi' ? 'आइटम का नाम लिखें...' : 'Type item name...'}
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

                        {/* Show detailed form when item is selected */}
                        {showElectronicsDetails && (
                            <>
                                {/* Company Name */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कंपनी का नाम *' : 'Company Name *'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Samsung, Apple, LG...' : 'e.g., Samsung, Apple, LG...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Model Name */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'मॉडल का नाम' : 'Model Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Galaxy S21, iPhone 13...' : 'e.g., Galaxy S21, iPhone 13...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Condition: New or Old */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'स्थिति *' : 'Condition *'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('new')}
                                            style={{ flex: 1 }}
                                        >
                                            ✨ {language === 'hi' ? 'नया' : 'New'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('old')}
                                            style={{ flex: 1 }}
                                        >
                                            📦 {language === 'hi' ? 'पुराना' : 'Used'}
                                        </button>
                                    </div>
                                </div>

                                {/* Years Used (only if old) */}
                                {condition === 'old' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            {language === 'hi' ? 'कितने साल इस्तेमाल किया?' : 'How many years used?'}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={yearsUsed}
                                            onChange={(e) => setYearsUsed(e.target.value)}
                                            placeholder={language === 'hi' ? 'जैसे: 2 साल, 6 महीने...' : 'e.g., 2 years, 6 months...'}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                fontSize: '18px',
                                                borderRadius: '12px',
                                                border: '2px solid var(--color-border)'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Original Bill Available */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'ओरिजिनल बिल उपलब्ध?' : 'Original Bill Available?'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className={`btn ${hasBill === true ? 'btn-success' : 'btn-outline'}`}
                                            onClick={() => setHasBill(true)}
                                            style={{ flex: 1 }}
                                        >
                                            ✅ {language === 'hi' ? 'हाँ' : 'Yes'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${hasBill === false ? 'btn-outline' : 'btn-outline'}`}
                                            onClick={() => setHasBill(false)}
                                            style={{ flex: 1, opacity: hasBill === false ? 1 : 0.7 }}
                                        >
                                            ❌ {language === 'hi' ? 'नहीं' : 'No'}
                                        </button>
                                    </div>
                                </div>

                                {/* Defects */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कोई खराबी/दोष?' : 'Any Defects?'}
                                    </label>
                                    <textarea
                                        className="form-input"
                                        value={defects}
                                        onChange={(e) => setDefects(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: स्क्रीन पर छोटा स्क्रैच, बैटरी कमज़ोर...' : 'e.g., Small scratch on screen, weak battery...'}
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {/* Image Upload */}
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentPreviews={imagePreviews}
                                    maxImages={5}
                                />

                                {/* Price */}
                                <div className="form-group">
                                    <label className="form-label">{t('enter_price')} *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Address/Location */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'पता/लोकेशन' : 'Address/Location'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: रामपुर, सेक्टर 5...' : 'e.g., Rampur, Sector 5...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Seller Phone */}
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

                                {/* Summary Card */}
                                <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>
                                                {companyName} {name} {modelName && `(${modelName})`}
                                            </div>
                                            <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                {condition === 'new' ? '✨ नया/New' : `📦 पुराना/Used ${yearsUsed ? `(${yearsUsed})` : ''}`}
                                            </div>
                                            {hasBill && (
                                                <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                                                    ✅ {language === 'hi' ? 'बिल उपलब्ध' : 'Bill Available'}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {defects && (
                                        <div style={{ color: 'var(--color-warning)', marginBottom: 8 }}>
                                            ⚠️ {defects}
                                        </div>
                                    )}
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                    {sellerPhone && (
                                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span>📞 {sellerPhone}</span>
                                            {whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div style={{
                                    padding: 16,
                                    background: '#fef3c7',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    border: '1px solid #f59e0b'
                                }}>
                                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                                        ⚠️ {language === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
                                    </div>
                                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
                                        {language === 'hi'
                                            ? 'यह प्लेटफॉर्म केवल खरीदार और विक्रेता को जोड़ने का काम करता है। लेन-देन, उत्पाद की गुणवत्ता, और भुगतान की जिम्मेदारी दोनों पक्षों की है। कृपया सामान देखकर और जाँच कर ही खरीदें।'
                                            : 'This platform only connects buyers and sellers. Transaction, product quality, and payment responsibility lies with both parties. Please inspect the item before purchasing.'}
                                    </p>
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !companyName.trim() || !condition || !price || !sellerPhone.trim()}
                                >
                                    {loading
                                        ? t('loading')
                                        : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Step 2: Clothes-specific form */}
                {step === 2 && isClothes && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>👕</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? 'कपड़े' : 'Clothes'}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Clothes item selection */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                            </label>
                            <div className="popular-products-grid">
                                {CLOTHES_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        className={`popular-product-btn ${clothesItem === item.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectClothesItem(item)}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span className="name">{language === 'hi' ? item.hi : item.en}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom input for "Other" */}
                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={language === 'hi' ? 'आइटम का नाम लिखें...' : 'Type item name...'}
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

                        {/* Show detailed form when item is selected */}
                        {showClothesDetails && (
                            <>
                                {/* Brand Name */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'ब्रांड का नाम (वैकल्पिक)' : 'Brand Name (Optional)'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Levi\'s, Zara, FabIndia...' : 'e.g., Levi\'s, Zara, FabIndia...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Gender */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'किसके लिए?' : 'For whom?'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${gender === 'men' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setGender('men')}
                                        >
                                            👨 {language === 'hi' ? 'पुरुष' : 'Men'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${gender === 'women' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setGender('women')}
                                        >
                                            👩 {language === 'hi' ? 'महिला' : 'Women'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${gender === 'kids' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setGender('kids')}
                                        >
                                            🧒 {language === 'hi' ? 'बच्चे' : 'Kids'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${gender === 'unisex' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setGender('unisex')}
                                        >
                                            👤 Unisex
                                        </button>
                                    </div>
                                </div>

                                {/* Size */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'साइज़ *' : 'Size *'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {SIZE_OPTIONS.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                className={`btn btn-sm ${size === s.label ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => setSize(s.label)}
                                                style={{ minWidth: 50 }}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'रंग' : 'Color'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: नीला, लाल, काला...' : 'e.g., Blue, Red, Black...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Material */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कपड़े का प्रकार/मटीरियल' : 'Fabric/Material'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: कॉटन, सिल्क, पॉलिएस्टर...' : 'e.g., Cotton, Silk, Polyester...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Condition: New or Old */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'स्थिति *' : 'Condition *'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('new')}
                                            style={{ flex: 1 }}
                                        >
                                            ✨ {language === 'hi' ? 'नया' : 'New'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('old')}
                                            style={{ flex: 1 }}
                                        >
                                            👕 {language === 'hi' ? 'पुराना' : 'Used'}
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentPreviews={imagePreviews}
                                    maxImages={5}
                                />

                                {/* Price */}
                                <div className="form-group">
                                    <label className="form-label">{t('enter_price')} *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Address/Location */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'पता/लोकेशन' : 'Address/Location'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: रामपुर, सेक्टर 5...' : 'e.g., Rampur, Sector 5...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Seller Phone */}
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

                                {/* Summary Card */}
                                <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>
                                                {brand ? `${brand} ` : ''}{name} {color && `- ${color}`}
                                            </div>
                                            <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                Size: {size || '—'} | {condition === 'new' ? '✨ नया/New' : '👕 पुराना/Used'}
                                            </div>
                                            {gender && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    {gender === 'men' ? '👨 पुरुष/Men' : gender === 'women' ? '👩 महिला/Women' : gender === 'kids' ? '🧒 बच्चे/Kids' : '👤 Unisex'}
                                                </div>
                                            )}
                                            {material && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    🧵 {material}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                    {sellerPhone && (
                                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span>📞 {sellerPhone}</span>
                                            {whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div style={{
                                    padding: 16,
                                    background: '#fef3c7',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    border: '1px solid #f59e0b'
                                }}>
                                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                                        ⚠️ {language === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
                                    </div>
                                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
                                        {language === 'hi'
                                            ? 'यह प्लेटफॉर्म केवल खरीदार और विक्रेता को जोड़ने का काम करता है। लेन-देन, उत्पाद की गुणवत्ता, और भुगतान की जिम्मेदारी दोनों पक्षों की है। कृपया सामान देखकर और जाँच कर ही खरीदें।'
                                            : 'This platform only connects buyers and sellers. Transaction, product quality, and payment responsibility lies with both parties. Please inspect the item before purchasing.'}
                                    </p>
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !condition || !size || !price || !sellerPhone.trim()}
                                >
                                    {loading
                                        ? t('loading')
                                        : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                                </button>
                            </>
                        )}
                    </>
                )}
                {/* Step 2: Books-specific form */}
                {step === 2 && isBooks && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>📚</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? 'पुस्तकें' : 'Books'}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Books item selection */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'किस तरह की किताब?' : 'What type of book?'}
                            </label>
                            <div className="popular-products-grid">
                                {BOOKS_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        className={`popular-product-btn ${booksItem === item.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectBooksItem(item)}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span className="name">{language === 'hi' ? item.hi : item.en}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom input for "Other" */}
                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={language === 'hi' ? 'किताब का नाम लिखें...' : 'Type book name...'}
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

                        {/* Show detailed form when item is selected */}
                        {showBooksDetails && (
                            <>
                                {/* Book Title (for specific book) */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'किताब का नाम' : 'Book Title'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Physics Class 12, Harry Potter...' : 'e.g., Physics Class 12, Harry Potter...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Author */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'लेखक का नाम' : 'Author Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: R.D. Sharma, Premchand...' : 'e.g., R.D. Sharma, Premchand...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Subject */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'विषय' : 'Subject'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: गणित, विज्ञान, हिंदी...' : 'e.g., Mathematics, Science, Hindi...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Class/Standard */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कक्षा/स्तर' : 'Class/Level'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={classLevel}
                                        onChange={(e) => setClassLevel(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: 10वीं, 12वीं, B.A., SSC...' : 'e.g., 10th, 12th, B.A., SSC...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Publisher */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'प्रकाशक' : 'Publisher'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={publisher}
                                        onChange={(e) => setPublisher(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: NCERT, Arihant, S.Chand...' : 'e.g., NCERT, Arihant, S.Chand...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Language */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'भाषा' : 'Language'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${bookLanguage === 'Hindi' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setBookLanguage('Hindi')}
                                        >
                                            हिंदी
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${bookLanguage === 'English' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setBookLanguage('English')}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${bookLanguage === 'Both' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setBookLanguage('Both')}
                                        >
                                            दोनों/Both
                                        </button>
                                    </div>
                                </div>

                                {/* Condition: New or Old */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'स्थिति *' : 'Condition *'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'new' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('new')}
                                            style={{ flex: 1 }}
                                        >
                                            ✨ {language === 'hi' ? 'नई' : 'New'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${condition === 'old' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setCondition('old')}
                                            style={{ flex: 1 }}
                                        >
                                            📖 {language === 'hi' ? 'पुरानी' : 'Used'}
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentPreviews={imagePreviews}
                                    maxImages={3}
                                />

                                {/* Price */}
                                <div className="form-group">
                                    <label className="form-label">{t('enter_price')} *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Address/Location */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'पता/लोकेशन' : 'Address/Location'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: रामपुर, सेक्टर 5...' : 'e.g., Rampur, Sector 5...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Seller Phone */}
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

                                {/* Summary Card */}
                                <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>
                                                {name} {author && `- ${author}`}
                                            </div>
                                            <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                {condition === 'new' ? '✨ नई/New' : '📖 पुरानी/Used'}
                                            </div>
                                            {subject && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    📚 {subject} {classLevel && `| Class: ${classLevel}`}
                                                </div>
                                            )}
                                            {publisher && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    📝 {publisher}
                                                </div>
                                            )}
                                            {bookLanguage && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    🌐 {bookLanguage}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                    {sellerPhone && (
                                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span>📞 {sellerPhone}</span>
                                            {whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div style={{
                                    padding: 16,
                                    background: '#fef3c7',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    border: '1px solid #f59e0b'
                                }}>
                                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                                        ⚠️ {language === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
                                    </div>
                                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
                                        {language === 'hi'
                                            ? 'यह प्लेटफॉर्म केवल खरीदार और विक्रेता को जोड़ने का काम करता है। लेन-देन, उत्पाद की गुणवत्ता, और भुगतान की जिम्मेदारी दोनों पक्षों की है। कृपया सामान देखकर और जाँच कर ही खरीदें।'
                                            : 'This platform only connects buyers and sellers. Transaction, product quality, and payment responsibility lies with both parties. Please inspect the item before purchasing.'}
                                    </p>
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !condition || !price || !sellerPhone.trim()}
                                >
                                    {loading
                                        ? t('loading')
                                        : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Step 2: Vehicles-specific form */}
                {step === 2 && isVehicles && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>🛵</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? 'वाहन' : 'Vehicles'}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Vehicles item selection */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                            </label>
                            <div className="popular-products-grid">
                                {VEHICLES_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        className={`popular-product-btn ${vehiclesItem === item.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectVehiclesItem(item)}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span className="name">{language === 'hi' ? item.hi : item.en}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom input for "Other" */}
                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={language === 'hi' ? 'वाहन का प्रकार लिखें...' : 'Type vehicle type...'}
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

                        {/* Show detailed form when item is selected */}
                        {showVehiclesDetails && (
                            <>
                                {/* Company/Brand */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कंपनी/ब्रांड *' : 'Company/Brand *'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Hero, Honda, Maruti...' : 'e.g., Hero, Honda, Maruti...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Model Name */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'मॉडल (वैकल्पिक)' : 'Model (Optional)'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: Splendor Plus, Swift VXI...' : 'e.g., Splendor Plus, Swift VXI...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Year of Purchase */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'खरीदने का साल' : 'Year of Purchase'}
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={vehicleYear}
                                        onChange={(e) => setVehicleYear(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: 2018, 2020...' : 'e.g., 2018, 2020...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* KM Driven */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कितना चला है? (KM)' : 'KM Driven'}
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={kmDriven}
                                        onChange={(e) => setKmDriven(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: 15000' : 'e.g., 15000'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Fuel Type */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'ईंधन का प्रकार' : 'Fuel Type'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {FUEL_OPTIONS.map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                className={`btn btn-sm ${fuelType === f.label ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => setFuelType(f.label)}
                                            >
                                                {f.icon} {f.label.split('/')[language === 'hi' ? 1 : 0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Owner Count */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कौन सा मालिक?' : 'Owner Number'}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['1st', '2nd', '3rd', '4th+'].map(o => (
                                            <button
                                                key={o}
                                                type="button"
                                                className={`btn btn-sm ${ownerCount === o ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => setOwnerCount(o)}
                                                style={{ flex: 1 }}
                                            >
                                                {o}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* RC */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>📄 RC Available?</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${hasRC === true ? 'btn-success' : 'btn-outline'}`}
                                                    onClick={() => setHasRC(true)}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${hasRC === false ? 'btn-outline' : 'btn-outline'}`}
                                                    onClick={() => setHasRC(false)}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                        {/* Insurance */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>🛡️ Insurance?</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${hasInsurance === true ? 'btn-success' : 'btn-outline'}`}
                                                    onClick={() => setHasInsurance(true)}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${hasInsurance === false ? 'btn-outline' : 'btn-outline'}`}
                                                    onClick={() => setHasInsurance(false)}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Defects */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'कोई खराबी/दोष?' : 'Any Defects/Issues?'}
                                    </label>
                                    <textarea
                                        className="form-input"
                                        value={defects}
                                        onChange={(e) => setDefects(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: टायर पुराने हैं, इंजन में आवाज़...' : 'e.g., Tyres need replacement, Engine noise...'}
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {/* Image Upload */}
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentPreviews={imagePreviews}
                                    maxImages={5}
                                />

                                {/* Price */}
                                <div className="form-group">
                                    <label className="form-label">{t('enter_price')} *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Address/Location */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {language === 'hi' ? 'पता/लोकेशन' : 'Address/Location'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: रामपुर, सेक्टर 5...' : 'e.g., Rampur, Sector 5...'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Seller Phone */}
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

                                {/* Summary Card */}
                                <div className="card mb-lg" style={{ background: 'var(--color-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>
                                                {companyName} {name} {modelName}
                                            </div>
                                            <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                {vehicleYear ? `${vehicleYear} • ` : ''}{kmDriven ? `${kmDriven} KM` : ''}
                                            </div>
                                            {fuelType && (
                                                <div style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
                                                    ⛽ {fuelType} {ownerCount && `• ${ownerCount} Owner`}
                                                </div>
                                            )}
                                            <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                                                {hasRC && <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✅ RC</span>}
                                                {hasInsurance && <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✅ Insurance</span>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {defects && (
                                        <div style={{ color: 'var(--color-warning)', marginBottom: 8 }}>
                                            ⚠️ {defects}
                                        </div>
                                    )}
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                    {sellerPhone && (
                                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span>📞 {sellerPhone}</span>
                                            {whatsappEnabled && <span style={{ color: '#25D366' }}>💬 WhatsApp</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div style={{
                                    padding: 16,
                                    background: '#fef3c7',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    border: '1px solid #f59e0b'
                                }}>
                                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                                        ⚠️ {language === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
                                    </div>
                                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
                                        {language === 'hi'
                                            ? 'यह प्लेटफॉर्म केवल खरीदार और विक्रेता को जोड़ने का काम करता है। लेन-देन, उत्पाद की गुणवत्ता, और भुगतान की जिम्मेदारी दोनों पक्षों की है। कृपया सामान देखकर और जाँच कर ही खरीदें।'
                                            : 'This platform only connects buyers and sellers. Transaction, product quality, and payment responsibility lies with both parties. Please inspect the item before purchasing.'}
                                    </p>
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !companyName.trim() || !price || !sellerPhone.trim()}
                                >
                                    {loading
                                        ? t('loading')
                                        : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Step 2: Regular product form (non-electronics, non-clothes, non-books, non-vehicles) */}
                {step === 2 && !isElectronics && !isClothes && !isBooks && !isVehicles && (
                    <>
                        {/* Selected category badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>{selectedCat?.icon}</span>
                            <span style={{ fontWeight: 600 }}>
                                {language === 'hi' ? selectedCat?.hi : selectedCat?.en}
                            </span>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'var(--color-border)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 14
                                }}
                            >
                                {language === 'hi' ? 'बदलें' : 'Change'}
                            </button>
                        </div>

                        {/* Popular products grid */}
                        <div className="form-group">
                            <label className="form-label">
                                {language === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'}
                            </label>

                            {/* Popular product icons */}
                            <div className="popular-products-grid">
                                {popularProducts.map(product => (
                                    <button
                                        key={product.name}
                                        className={`popular-product-btn ${name === (language === 'hi' ? product.hi : product.name) ? 'selected' : ''}`}
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <span className="icon">{product.icon}</span>
                                        <span className="name">{language === 'hi' ? product.hi : product.name}</span>
                                    </button>
                                ))}

                                {/* Other/Custom option */}
                                <button
                                    className={`popular-product-btn ${showCustomInput ? 'selected' : ''}`}
                                    onClick={handleCustomInput}
                                >
                                    <span className="icon">✏️</span>
                                    <span className="name">{language === 'hi' ? 'अन्य' : 'Other'}</span>
                                </button>
                            </div>

                            {/* Custom text input (shown when "Other" is selected or no selection) */}
                            {showCustomInput && (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={language === 'hi' ? 'उत्पाद का नाम लिखें...' : 'Type product name...'}
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

                        {/* Show remaining fields only if product is selected */}
                        {name && (
                            <>
                                {/* Image Upload */}
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentPreviews={imagePreviews}
                                    maxImages={3}
                                />
                                <div className="form-group">
                                    <label className="form-label">{t('enter_quantity')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={language === 'hi' ? '10 किलो, 50 पीस...' : '10 kg, 50 pieces...'}
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
                                    <label className="form-label">{t('enter_price')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('your_location')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={language === 'hi' ? 'जैसे: रामपुर गाँव' : 'e.g., Rampur Village'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid var(--color-border)'
                                        }}
                                    />
                                </div>

                                {/* Summary */}
                                <div className="card mb-lg">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <span style={{ fontSize: 32 }}>{selectedIcon || selectedCat?.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
                                            <div style={{ color: 'var(--color-text-light)' }}>{quantity || '—'}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            ₹{price || '0'}
                                        </div>
                                    </div>
                                    {location && (
                                        <div style={{ color: 'var(--color-text-light)' }}>📍 {location}</div>
                                    )}
                                </div>

                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !quantity.trim() || !price}
                                >
                                    {loading ? t('loading') : (language === 'hi' ? '📤 विज्ञापन पोस्ट करें' : '📤 Post Listing')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                    {[1, 2].map(s => (
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
