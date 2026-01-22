import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

interface ProductPhotoManagerProps {
    /** Existing image URLs from the product */
    existingImages: string[]
    /** Maximum number of images allowed */
    maxImages?: number
    /** Callback when images change - returns all current URLs (existing + newly uploaded) and files to upload */
    onImagesChange: (imageUrls: string[], newFiles: File[], deletedUrls: string[]) => void
    /** Loading state */
    loading?: boolean
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

export function ProductPhotoManager({
    existingImages,
    maxImages = 5,
    onImagesChange,
    loading = false
}: ProductPhotoManagerProps) {
    const { language } = useApp()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Track existing URLs that should remain
    const [currentExistingUrls, setCurrentExistingUrls] = useState<string[]>(existingImages)
    // Track deleted URLs (for cleanup from storage)
    const [deletedUrls, setDeletedUrls] = useState<string[]>([])
    // Track newly added files and their preview URLs
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [newPreviews, setNewPreviews] = useState<string[]>([])
    const [processing, setProcessing] = useState(false)

    const totalImages = currentExistingUrls.length + newFiles.length

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length === 0) return

        // Check how many more images we can add
        const remainingSlots = maxImages - totalImages
        if (remainingSlots <= 0) return

        const filesToAdd = selectedFiles.slice(0, remainingSlots)

        setProcessing(true)
        try {
            const processedFiles: File[] = []
            const previews: string[] = []

            for (const file of filesToAdd) {
                const compressedFile = await compressImage(file)
                const previewUrl = URL.createObjectURL(compressedFile)
                processedFiles.push(compressedFile)
                previews.push(previewUrl)
            }

            const updatedNewFiles = [...newFiles, ...processedFiles]
            const updatedNewPreviews = [...newPreviews, ...previews]

            setNewFiles(updatedNewFiles)
            setNewPreviews(updatedNewPreviews)

            // Notify parent of changes
            onImagesChange(currentExistingUrls, updatedNewFiles, deletedUrls)
        } catch (error) {
            console.error('Error processing images:', error)
        } finally {
            setProcessing(false)
            // Reset input to allow selecting same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveExisting = (index: number) => {
        const urlToRemove = currentExistingUrls[index]
        const updatedExisting = currentExistingUrls.filter((_, i) => i !== index)
        const updatedDeleted = [...deletedUrls, urlToRemove]

        setCurrentExistingUrls(updatedExisting)
        setDeletedUrls(updatedDeleted)
        onImagesChange(updatedExisting, newFiles, updatedDeleted)
    }

    const handleRemoveNew = (index: number) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(newPreviews[index])

        const updatedFiles = newFiles.filter((_, i) => i !== index)
        const updatedPreviews = newPreviews.filter((_, i) => i !== index)

        setNewFiles(updatedFiles)
        setNewPreviews(updatedPreviews)
        onImagesChange(currentExistingUrls, updatedFiles, deletedUrls)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const canAddMore = totalImages < maxImages

    return (
        <div className="image-upload-container">
            <label className="form-label">
                {language === 'hi'
                    ? `📷 उत्पाद की फोटो (${totalImages}/${maxImages})`
                    : `📷 Product Photos (${totalImages}/${maxImages})`}
            </label>

            {/* Hidden file input - supports both camera and gallery */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Image previews grid */}
            {totalImages > 0 && (
                <div className="image-previews-grid">
                    {/* Existing images */}
                    {currentExistingUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="image-preview-item">
                            <img src={url} alt={`Photo ${index + 1}`} />
                            <button
                                type="button"
                                className="image-preview-remove"
                                onClick={() => handleRemoveExisting(index)}
                                disabled={loading}
                                aria-label={language === 'hi' ? 'फोटो हटाएं' : 'Remove photo'}
                            >
                                ✕
                            </button>
                            <span style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                fontSize: 10,
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: 4
                            }}>
                                {language === 'hi' ? 'मौजूदा' : 'Existing'}
                            </span>
                        </div>
                    ))}

                    {/* Newly added images */}
                    {newPreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="image-preview-item">
                            <img src={preview} alt={`New photo ${index + 1}`} />
                            <button
                                type="button"
                                className="image-preview-remove"
                                onClick={() => handleRemoveNew(index)}
                                disabled={loading}
                                aria-label={language === 'hi' ? 'फोटो हटाएं' : 'Remove photo'}
                            >
                                ✕
                            </button>
                            <span style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                fontSize: 10,
                                background: '#22c55e',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: 4
                            }}>
                                {language === 'hi' ? 'नया' : 'New'}
                            </span>
                        </div>
                    ))}

                    {/* Add more button (if space available) */}
                    {canAddMore && (
                        <button
                            type="button"
                            className="image-add-more-btn"
                            onClick={triggerFileInput}
                            disabled={loading || processing}
                        >
                            {processing ? '⏳' : '+'}
                        </button>
                    )}
                </div>
            )}

            {/* Initial upload button (when no images) */}
            {totalImages === 0 && (
                <button
                    type="button"
                    className="image-upload-btn"
                    onClick={triggerFileInput}
                    disabled={loading || processing}
                >
                    {processing ? (
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

            {/* Deleted photos indicator */}
            {deletedUrls.length > 0 && (
                <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: '#fef2f2',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#dc2626'
                }}>
                    {language === 'hi'
                        ? `${deletedUrls.length} फोटो हटाई जाएंगी`
                        : `${deletedUrls.length} photo(s) will be deleted`}
                </div>
            )}
        </div>
    )
}
