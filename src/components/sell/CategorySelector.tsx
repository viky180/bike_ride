import { useApp } from '../../context/AppContext'
import { HERO_CATEGORIES, STANDARD_CATEGORIES } from '../../lib/categories'
import { ProductCategory } from '../../lib/supabase'

interface CategorySelectorProps {
    onSelectCategory: (category: ProductCategory) => void
}

export function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
    const { language } = useApp()

    return (
        <>
            {/* Hero Section - Agriculture / खेती-बाड़ी */}
            <section className="category-section">
                <h2 className="section-title" style={{ marginBottom: 16 }}>
                    🌾 {language === 'hi' ? 'खेती-बाड़ी' : 'Agriculture'}
                </h2>
                <div className="sell-category-hero-grid">
                    {HERO_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className="sell-category-hero-card"
                            onClick={() => onSelectCategory(cat.id)}
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
                            onClick={() => onSelectCategory(cat.id)}
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
    )
}
