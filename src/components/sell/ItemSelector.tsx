import { useApp } from '../../context/AppContext'

interface ItemSelectorItem {
    id: string
    icon: string
    en: string
    hi: string
}

interface ItemSelectorProps<T extends ItemSelectorItem> {
    items: readonly T[]
    selectedId: string
    onSelect: (item: T) => void
    showCustomInput: boolean
    customInputValue: string
    onCustomInputChange: (value: string) => void
    customInputPlaceholder?: { hi: string; en: string }
    itemStyle?: React.CSSProperties
}

export function ItemSelector<T extends ItemSelectorItem>({
    items,
    selectedId,
    onSelect,
    showCustomInput,
    customInputValue,
    onCustomInputChange,
    customInputPlaceholder = { hi: 'आइटम का नाम लिखें...', en: 'Type item name...' },
    itemStyle
}: ItemSelectorProps<T>) {
    const { language } = useApp()

    return (
        <>
            <div className="popular-products-grid">
                {items.map(item => (
                    <button
                        key={item.id}
                        className={`popular-product-btn ${selectedId === item.id ? 'selected' : ''}`}
                        onClick={() => onSelect(item)}
                        style={itemStyle}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="name">{language === 'hi' ? item.hi : item.en}</span>
                    </button>
                ))}
            </div>

            {showCustomInput && (
                <input
                    type="text"
                    className="form-input"
                    value={customInputValue}
                    onChange={(e) => onCustomInputChange(e.target.value)}
                    placeholder={language === 'hi' ? customInputPlaceholder.hi : customInputPlaceholder.en}
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
        </>
    )
}

