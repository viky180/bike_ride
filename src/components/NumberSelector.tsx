interface NumberSelectorProps {
    value: number
    min: number
    max: number
    onChange: (value: number) => void
    prefix?: string
    suffix?: string
    step?: number
}

export function NumberSelector({
    value,
    min,
    max,
    onChange,
    prefix = '',
    suffix = '',
    step = 1
}: NumberSelectorProps) {
    const decrease = () => {
        if (value > min) onChange(value - step)
    }

    const increase = () => {
        if (value < max) onChange(value + step)
    }

    return (
        <div className="number-selector">
            <button onClick={decrease} disabled={value <= min}>
                −
            </button>
            <span className="value">
                {prefix}{value}{suffix}
            </span>
            <button onClick={increase} disabled={value >= max}>
                +
            </button>
        </div>
    )
}
