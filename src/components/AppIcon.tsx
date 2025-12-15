// Custom SVG icon for Gram Junction - represents village connection/exchange
export function AppIcon({ size = 64 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background circle */}
            <circle cx="50" cy="50" r="48" fill="url(#gradient)" />

            {/* Left person */}
            <circle cx="22" cy="38" r="9" fill="white" />
            <path
                d="M22 49 C10 49 6 60 6 68 L38 68 C38 60 34 49 22 49"
                fill="white"
            />

            {/* Right person */}
            <circle cx="78" cy="38" r="9" fill="white" />
            <path
                d="M78 49 C66 49 62 60 62 68 L94 68 C94 60 90 49 78 49"
                fill="white"
            />

            {/* Center crop/plant icon */}
            <g transform="translate(50, 48)">
                {/* Plant pot */}
                <path d="M-8 8 L8 8 L6 16 L-6 16 Z" fill="#fbbf24" />

                {/* Main stem */}
                <line x1="0" y1="8" x2="0" y2="-12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />

                {/* Left leaf */}
                <path
                    d="M0 -4 Q-12 -8 -14 -18 Q-8 -14 0 -12"
                    fill="#22c55e"
                />

                {/* Right leaf */}
                <path
                    d="M0 -4 Q12 -8 14 -18 Q8 -14 0 -12"
                    fill="#22c55e"
                />

                {/* Top leaf */}
                <path
                    d="M0 -12 Q-4 -24 0 -28 Q4 -24 0 -12"
                    fill="#16a34a"
                />
            </g>

            {/* Gradient definition */}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    )
}
