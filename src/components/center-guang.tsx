export default function CenterGuang () {

    return <svg className="fixed inset-0 pointer-events-none z-0" width="100%" height="100%">
        <defs>
            <radialGradient id="halo-core">
                <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.15" />
                <stop offset="30%" stopColor="#00e0ff" stopOpacity="0.08" />
                <stop offset="70%" stopColor="#ff00ff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="halo-outer">
                <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#00e0ff" stopOpacity="0.03" />
                <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <filter id="blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="100" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="blur-medium" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="60" />
            </filter>
        </defs>

        <circle
            cx="50%"
            cy="50%"
            r="300"
            fill="url(#halo-core)"
            filter="url(#blur-heavy)"
            opacity="0.7"
        />
        <circle
            cx="50%"
            cy="50%"
            r="400"
            fill="url(#halo-outer)"
            filter="url(#blur-medium)"
            opacity="0.5"
        />
    </svg>
}