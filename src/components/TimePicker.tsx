import { useApp } from '../context/AppContext'

interface TimePickerProps {
    value: Date
    onChange: (date: Date) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
    const { t } = useApp()

    const today = new Date()
    today.setHours(today.getHours(), 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = value.toDateString() === today.toDateString()
    const isTomorrow = value.toDateString() === tomorrow.toDateString()

    const hour = value.getHours()
    const isPM = hour >= 12
    const displayHour = hour % 12 || 12

    const setDay = (date: Date) => {
        const newDate = new Date(date)
        newDate.setHours(value.getHours(), value.getMinutes(), 0, 0)
        onChange(newDate)
    }

    const adjustHour = (delta: number) => {
        const newDate = new Date(value)
        newDate.setHours(value.getHours() + delta)
        onChange(newDate)
    }

    const toggleAMPM = () => {
        const newDate = new Date(value)
        if (isPM) {
            newDate.setHours(hour - 12)
        } else {
            newDate.setHours(hour + 12)
        }
        onChange(newDate)
    }

    return (
        <div className="time-picker">
            {/* Day selector */}
            <div className="date-buttons">
                <button
                    className={isToday ? 'selected' : ''}
                    onClick={() => setDay(today)}
                >
                    {t('today')}
                </button>
                <button
                    className={isTomorrow ? 'selected' : ''}
                    onClick={() => setDay(tomorrow)}
                >
                    {t('tomorrow')}
                </button>
            </div>

            {/* Time selector */}
            <div className="time-selector">
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => adjustHour(-1)}
                    style={{ width: 56, minHeight: 56 }}
                >
                    −
                </button>

                <span className="time-value">{displayHour}:00</span>

                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => adjustHour(1)}
                    style={{ width: 56, minHeight: 56 }}
                >
                    +
                </button>

                <div className="ampm-toggle">
                    <button
                        className={!isPM ? 'selected' : ''}
                        onClick={() => isPM && toggleAMPM()}
                    >
                        {t('am')}
                    </button>
                    <button
                        className={isPM ? 'selected' : ''}
                        onClick={() => !isPM && toggleAMPM()}
                    >
                        {t('pm')}
                    </button>
                </div>
            </div>
        </div>
    )
}
