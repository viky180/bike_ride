import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, ProductCategory } from '../lib/supabase'
import { URGENCY_OPTIONS, SELLING_TYPE_OPTIONS, LACTATION_OPTIONS } from '../lib/sellFormConstants'
import { Header } from '../components/Header'
import {
    CategorySelector,
    ElectronicsForm,
    ClothesForm,
    BooksForm,
    VehiclesForm,
    LivestockForm,
    PharmacyForm,
    RegularProductForm,
} from '../components/sell'
import type {
    ElectronicsFormData,
    ClothesFormData,
    BooksFormData,
    VehiclesFormData,
    LivestockFormData,
    PharmacyFormData,
    RegularProductFormData,
} from '../components/sell'

export function SellProductPage() {
    const { user, showToast, language } = useApp()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSelectCategory = (cat: ProductCategory) => {
        setCategory(cat)
        setStep(2)
    }

    const handleBack = () => {
        setStep(1)
        setCategory(null)
    }

    // Upload images to Supabase storage
    const uploadImages = async (imageFiles: File[]): Promise<string[]> => {
        const imageUrls: string[] = []
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const fileExt = file.name.split('.').pop() || 'jpg'
            const fileName = `${user!.id}/${Date.now()}-${i}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, { cacheControl: '3600', upsert: false })

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
        return imageUrls
    }

    // Insert product into database
    const insertProduct = async (data: {
        name: string
        quantity: string
        category: ProductCategory
        price: string
        location: string
        pincode: string
        imageUrls: string[]
        medicines?: string[] | null
        discountPercent?: string | null
    }) => {
        const { error } = await supabase.from('products').insert({
            seller_id: user!.id,
            category: data.category,
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            location: data.location.trim() || null,
            pincode: data.pincode.trim() || null,
            image_urls: data.imageUrls,
            status: 'available',
            medicines: data.medicines,
            discount_percent: data.discountPercent
        })
        if (error) throw error
    }

    // Handle Electronics form submission
    const handleElectronicsSubmit = async (data: ElectronicsFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            // Build product name
            let productName = `${data.companyName} ${data.name}`.trim()
            if (data.modelName) productName += ` (${data.modelName})`

            // Build description
            const details: string[] = []
            details.push(data.condition === 'new' ? 'नया/New' : `पुराना/Used ${data.yearsUsed ? `(${data.yearsUsed} साल)` : ''}`)
            if (data.hasBill) details.push('बिल उपलब्ध/Bill available')
            if (data.defects) details.push(`दोष/Defects: ${data.defects}`)
            details.push(`📞 ${data.sellerPhone}${data.whatsappEnabled ? ' (WhatsApp)' : ''}`)

            await insertProduct({
                name: productName,
                quantity: details.join(' | '),
                category: 'electronics',
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Clothes form submission
    const handleClothesSubmit = async (data: ClothesFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            let productName = data.brand ? `${data.brand} ${data.name}`.trim() : data.name.trim()
            if (data.color) productName += ` - ${data.color}`

            const details: string[] = []
            details.push(`Size: ${data.size}`)
            if (data.gender) details.push(data.gender === 'men' ? 'पुरुष/Men' : data.gender === 'women' ? 'महिला/Women' : data.gender === 'kids' ? 'बच्चे/Kids' : 'Unisex')
            if (data.material) details.push(data.material)
            details.push(data.condition === 'new' ? 'नया/New' : 'पुराना/Used')
            details.push(`📞 ${data.sellerPhone}${data.whatsappEnabled ? ' (WhatsApp)' : ''}`)

            await insertProduct({
                name: productName,
                quantity: details.join(' | '),
                category: 'clothes',
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Books form submission
    const handleBooksSubmit = async (data: BooksFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            let productName = data.name.trim()
            if (data.author) productName += ` - ${data.author}`

            const details: string[] = []
            if (data.subject) details.push(data.subject)
            if (data.classLevel) details.push(`Class: ${data.classLevel}`)
            if (data.publisher) details.push(data.publisher)
            if (data.bookLanguage) details.push(data.bookLanguage)
            details.push(data.condition === 'new' ? 'नया/New' : 'पुराना/Used')
            details.push(`📞 ${data.sellerPhone}${data.whatsappEnabled ? ' (WhatsApp)' : ''}`)

            await insertProduct({
                name: productName,
                quantity: details.join(' | '),
                category: 'books',
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Vehicles form submission
    const handleVehiclesSubmit = async (data: VehiclesFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            let productName = `${data.companyName} ${data.name}`.trim()
            if (data.modelName) productName += ` ${data.modelName}`
            if (data.vehicleYear) productName += ` (${data.vehicleYear})`

            const details: string[] = []
            if (data.kmDriven) details.push(`${data.kmDriven} KM`)
            if (data.fuelType) details.push(data.fuelType)
            if (data.ownerCount) details.push(`${data.ownerCount} owner`)
            if (data.hasRC) details.push('RC उपलब्ध/RC Available')
            if (data.hasInsurance) details.push('बीमा/Insurance')
            if (data.defects) details.push(`दोष: ${data.defects}`)
            details.push(`📞 ${data.sellerPhone}${data.whatsappEnabled ? ' (WhatsApp)' : ''}`)

            await insertProduct({
                name: productName,
                quantity: details.join(' | '),
                category: 'vehicles',
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Livestock form submission
    const handleLivestockSubmit = async (data: LivestockFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            const details: string[] = []
            if (data.sellingUrgency) {
                const urgency = URGENCY_OPTIONS.find(u => u.id === data.sellingUrgency)
                if (urgency) details.push(urgency.hi)
            }
            if (data.sellingType) {
                const type = SELLING_TYPE_OPTIONS.find(t => t.id === data.sellingType)
                if (type) details.push(type.hi)
            }
            if (data.lactationStage) {
                const stage = LACTATION_OPTIONS.find(l => l.id === data.lactationStage)
                if (stage) details.push(`ब्यांत: ${stage.hi}`)
            }
            if (data.milkYield) details.push(`दूध: ${data.milkYield} लीटर/दिन`)
            if (data.defects) details.push(`विवरण: ${data.defects}`)
            details.push(`📞 ${data.sellerPhone}${data.whatsappEnabled ? ' (WhatsApp)' : ''}`)

            await insertProduct({
                name: data.name.trim(),
                quantity: details.join(' | '),
                category: 'livestock',
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Pharmacy form submission
    const handlePharmacySubmit = async (data: PharmacyFormData) => {
        if (!user) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            const details: string[] = []
            if (data.medicines.length > 0) {
                // We don't necessarily need to put medicines in description as they are stored in a separate column
                // But for fallback/searchability we can add a summary
                details.push(`${data.medicines.length} Medicines`)
            }
            if (data.location) details.push(data.location)

            // For pharmacy, the "name" is the Shop Name
            await insertProduct({
                name: data.shopName.trim(),
                quantity: 'Items Available', // Pharmacy listings are often for the shop/inventory generally
                category: 'pharmacy',
                price: 'Contact for Price', // Usually prices vary per medicine
                location: data.location,
                pincode: data.pincode,
                imageUrls,
                medicines: data.medicines,
                discountPercent: data.discountPercent || null
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle Regular product form submission
    const handleRegularSubmit = async (data: RegularProductFormData) => {
        if (!user || !category) return
        setLoading(true)
        try {
            const imageUrls = await uploadImages(data.imageFiles)

            await insertProduct({
                name: data.name.trim(),
                quantity: data.quantity.trim() || '1 piece',
                category: category,
                price: data.price,
                location: data.location,
                pincode: data.pincode,
                imageUrls
            })

            showToast(language === 'hi' ? '✅ उत्पाद पोस्ट हो गया!' : '✅ Product posted!')
            navigate('/my-products')
        } catch (error: any) {
            console.error('Error posting product:', error)
            showToast(language === 'hi' ? `❌ त्रुटि: ${error?.message}` : `❌ Error: ${error?.message}`)
        } finally {
            setLoading(false)
        }
    }

    const isElectronics = category === 'electronics'
    const isClothes = category === 'clothes'
    const isBooks = category === 'books'
    const isVehicles = category === 'vehicles'
    const isLivestock = category === 'livestock'
    const isPharmacy = category === 'pharmacy'

    return (
        <div className="app">
            <Header title={language === 'hi' ? 'सामान बेचें' : 'Sell Items'} showBack />

            <div className="page category-browse-page">
                {/* Step 1: Select Category */}
                {step === 1 && (
                    <CategorySelector onSelectCategory={handleSelectCategory} />
                )}

                {/* Step 2: Category-specific forms */}
                {step === 2 && isElectronics && (
                    <ElectronicsForm onBack={handleBack} onSubmit={handleElectronicsSubmit} loading={loading} />
                )}

                {step === 2 && isClothes && (
                    <ClothesForm onBack={handleBack} onSubmit={handleClothesSubmit} loading={loading} />
                )}

                {step === 2 && isBooks && (
                    <BooksForm onBack={handleBack} onSubmit={handleBooksSubmit} loading={loading} />
                )}

                {step === 2 && isVehicles && (
                    <VehiclesForm onBack={handleBack} onSubmit={handleVehiclesSubmit} loading={loading} />
                )}

                {step === 2 && isLivestock && (
                    <LivestockForm onBack={handleBack} onSubmit={handleLivestockSubmit} loading={loading} />
                )}

                {step === 2 && isPharmacy && (
                    <PharmacyForm onBack={handleBack} onSubmit={handlePharmacySubmit} loading={loading} />
                )}

                {step === 2 && !isElectronics && !isClothes && !isBooks && !isVehicles && !isLivestock && !isPharmacy && category && (
                    <RegularProductForm category={category} onBack={handleBack} onSubmit={handleRegularSubmit} loading={loading} />
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
