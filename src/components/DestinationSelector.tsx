import { useApp } from '../context/AppContext'
import { DESTINATIONS, Destination } from '../lib/destinations'

interface DestinationGridProps {
    selected: string | null
    onSelect: (destination: Destination) => void
}

export function DestinationGrid({ selected, onSelect }: DestinationGridProps) {
    const { language } = useApp()

    return (
        <div className="destination-grid">
            {DESTINATIONS.map(dest => (
                <button
                    key={dest.id}
                    className={`destination-card ${selected === dest.id ? 'selected' : ''}`}
                    onClick={() => onSelect(dest)}
                    style={{
                        borderColor: selected === dest.id ? dest.color : undefined,
                        backgroundColor: selected === dest.id ? `${dest.color}15` : undefined
                    }}
                >
                    <span className="icon">{dest.icon}</span>
                    <span className="name">{language === 'hi' ? dest.hi : dest.en}</span>
                </button>
            ))}
        </div>
    )
}

interface DestinationTabsProps {
    selected: string | null
    onSelect: (id: string | null) => void
    showAll?: boolean
}

export function DestinationTabs({ selected, onSelect, showAll = true }: DestinationTabsProps) {
    const { language } = useApp()

    return (
        <div className="destination-tabs">
            {showAll && (
                <button
                    className={`destination-tab ${selected === null ? 'selected' : ''}`}
                    onClick={() => onSelect(null)}
                >
                    <span className="icon">🔍</span>
                    <span className="name">{language === 'hi' ? 'सभी' : 'All'}</span>
                </button>
            )}
            {DESTINATIONS.map(dest => (
                <button
                    key={dest.id}
                    className={`destination-tab ${selected === dest.id ? 'selected' : ''}`}
                    onClick={() => onSelect(dest.id)}
                >
                    <span className="icon">{dest.icon}</span>
                    <span className="name">{language === 'hi' ? dest.hi : dest.en}</span>
                </button>
            ))}
        </div>
    )
}
