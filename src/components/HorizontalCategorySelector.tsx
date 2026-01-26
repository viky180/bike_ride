import { HOME_CATEGORIES, ServiceCategory } from '../lib/categories'
import { ProductCategory } from '../lib/supabase'

// Icon paths for categories
type CategorySelection = ProductCategory | ServiceCategory | 'all'

const CATEGORY_ICONS: Record<CategorySelection, string> = {
    all: '/images/icons/icon_all.png',
    vegetables: '/images/icons/icon_vegetables.png',
    fruits: '/images/icons/icon_fruits.png',
    grains: '/images/icons/icon_grains.png',
    dairy: '/images/icons/icon_dairy.png',
    electronics: '/images/icons/icon_electronics.png',
    clothes: '/images/icons/icon_clothes.png',
    furniture: '/images/icons/icon_furniture.png',
    books: '/images/icons/icon_books.png',
    vehicles: '/images/icons/icon_vehicles.png',
    livestock: '/images/icons/icon_livestock.png',
    pharmacy: '/images/icons/icon_pharmacy.png',
    jobs: '/images/icons/icon_jobs.png',
    other: '/images/icons/icon_other.png',
    delivery_help: '/images/icons/icon_delivery.png'
}

interface HorizontalCategorySelectorProps {
    selectedCategory: CategorySelection
    onSelectCategory: (category: CategorySelection) => void
    language: 'en' | 'hi'
}

export function HorizontalCategorySelector({
    selectedCategory,
    onSelectCategory,
    language
}: HorizontalCategorySelectorProps) {
    // Brand color for active state
    const brandColor = '#10b981'

    return (
        <div className="category-selector">
            {/* All category - always first */}
            <button
                className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => onSelectCategory('all')}
                style={selectedCategory === 'all' ? {
                    '--pill-color': brandColor
                } as React.CSSProperties : undefined}
            >
                <img
                    src={CATEGORY_ICONS.all}
                    alt="All"
                    className="category-pill-icon-img"
                />
                <span className="category-pill-label">
                    {language === 'hi' ? 'सभी' : 'All'}
                </span>
                {selectedCategory === 'all' && <span className="category-pill-indicator" />}
            </button>

            {/* Category pills */}
            {HOME_CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onSelectCategory(cat.id)}
                    style={selectedCategory === cat.id ? {
                        '--pill-color': cat.color
                    } as React.CSSProperties : undefined}
                >
                    <img
                        src={CATEGORY_ICONS[cat.id]}
                        alt={cat.en}
                        className="category-pill-icon-img"
                    />
                    <span className="category-pill-label">
                        {language === 'hi' ? cat.hi : cat.en}
                    </span>
                    {selectedCategory === cat.id && <span className="category-pill-indicator" />}
                </button>
            ))}
        </div>
    )
}
