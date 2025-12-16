import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

interface ImageUploadProps {
    onImageChange: (file: File | null, preview: string) => void
    currentPreview?: string
}

// Compress image to reduce file size for low bandwidth
async function compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Scale down if larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }
                if (height > maxWidth) {
                    width = (width * maxWidth) / height
                    height = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create new file with compressed data
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            })
                            resolve(compressedFile)
                        } else {
                            resolve(file) // Fallback to original
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    })
}

export function ImageUpload({ onImageChange, currentPreview }: ImageUploadProps) {
    const { language } = useApp()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string>(currentPreview || '')
    const [loading, setLoading] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        try {
            // Compress the image for low bandwidth
            const compressedFile = await compressImage(file)

            // Create preview URL
            const previewUrl = URL.createObjectURL(compressedFile)
            setPreview(previewUrl)
            onImageChange(compressedFile, previewUrl)
        } catch (error) {
            console.error('Error processing image:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = () => {
        setPreview('')
        onImageChange(null, '')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="image-upload-container">
            <label className="form-label">
                {language === 'hi' ? '📷 उत्पाद की फोटो (वैकल्पिक)' : '📷 Product Photo (optional)'}
            </label>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {!preview ? (
                // Upload button
                <button
                    type="button"
                    className="image-upload-btn"
                    onClick={triggerFileInput}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="icon">⏳</span>
                            <span>{language === 'hi' ? 'प्रोसेस हो रहा है...' : 'Processing...'}</span>
                        </>
                    ) : (
                        <>
                            <span className="icon">📷</span>
                            <span className="upload-text">
                                {language === 'hi' ? 'फोटो लें या चुनें' : 'Take or Select Photo'}
                            </span>
                            <span className="upload-hint">
                                {language === 'hi' ? 'ग्राहक गुणवत्ता देख सकेंगे' : 'Customers can see quality'}
                            </span>
                        </>
                    )}
                </button>
            ) : (
                // Image preview
                <div className="image-preview">
                    <img src={preview} alt="Product preview" />
                    <button
                        type="button"
                        className="image-preview-remove"
                        onClick={handleRemove}
                        aria-label={language === 'hi' ? 'फोटो हटाएं' : 'Remove photo'}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}
