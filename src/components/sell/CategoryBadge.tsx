import { useApp } from '../../context/AppContext'

interface CategoryBadgeProps {
    icon: string
    labelHi: string
    labelEn: string
    onChangeClick: () => void
}

export function CategoryBadge({ icon, labelHi, labelEn, onChangeClick }: CategoryBadgeProps) {
    const { language } = useApp()

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <span style={{ fontWeight: 600 }}>
                {language === 'hi' ? labelHi : labelEn}
            </span>
            <button
                onClick={onChangeClick}
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
    )
}
