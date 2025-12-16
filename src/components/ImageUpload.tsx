import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

interface ImageUploadProps {
    onImagesChange: (files: File[], previews: string[]) => void
    currentPreviews?: string[]
    maxImages?: number
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
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            })
                            resolve(compressedFile)
                        } else {
                            resolve(file)
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

export function ImageUpload({ onImagesChange, currentPreviews = [], maxImages = 3 }: ImageUploadProps) {
    const { language } = useApp()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previews, setPreviews] = useState<string[]>(currentPreviews)
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length === 0) return

        // Check how many more images we can add
        const remainingSlots = maxImages - files.length
        if (remainingSlots <= 0) return

        const filesToAdd = selectedFiles.slice(0, remainingSlots)

        setLoading(true)
        try {
            const newFiles: File[] = []
            const newPreviews: string[] = []

            for (const file of filesToAdd) {
                const compressedFile = await compressImage(file)
                const previewUrl = URL.createObjectURL(compressedFile)
                newFiles.push(compressedFile)
                newPreviews.push(previewUrl)
            }

            const updatedFiles = [...files, ...newFiles]
            const updatedPreviews = [...previews, ...newPreviews]

            setFiles(updatedFiles)
            setPreviews(updatedPreviews)
            onImagesChange(updatedFiles, updatedPreviews)
        } catch (error) {
            console.error('Error processing images:', error)
        } finally {
            setLoading(false)
            // Reset input to allow selecting same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemove = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        const updatedPreviews = previews.filter((_, i) => i !== index)
        setFiles(updatedFiles)
        setPreviews(updatedPreviews)
        onImagesChange(updatedFiles, updatedPreviews)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const canAddMore = files.length < maxImages

    return (
        <div className="image-upload-container">
            <label className="form-label">
                {language === 'hi'
                    ? `📷 उत्पाद की फोटो (${files.length}/${maxImages})`
                    : `📷 Product Photos (${files.length}/${maxImages})`}
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

            {/* Image previews grid */}
            {previews.length > 0 && (
                <div className="image-previews-grid">
                    {previews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                                type="button"
                                className="image-preview-remove"
                                onClick={() => handleRemove(index)}
                                aria-label={language === 'hi' ? 'फोटो हटाएं' : 'Remove photo'}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* Add more button (if space available) */}
                    {canAddMore && (
                        <button
                            type="button"
                            className="image-add-more-btn"
                            onClick={triggerFileInput}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '+'}
                        </button>
                    )}
                </div>
            )}

            {/* Initial upload button (when no images) */}
            {previews.length === 0 && (
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
                                {language === 'hi' ? 'फोटो लें या चुनें' : 'Take or Select Photos'}
                            </span>
                            <span className="upload-hint">
                                {language === 'hi'
                                    ? `${maxImages} फोटो तक जोड़ें`
                                    : `Add up to ${maxImages} photos`}
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
