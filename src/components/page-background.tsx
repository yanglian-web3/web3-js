// components/page-background.tsx
export default function PageBackground() {
    return (
        <svg className="fixed inset-0 pointer-events-none z-0" width="100%" height="100%">
            <defs>
                {/* 网格图案 */}
                <pattern id="cyber-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="url(#neon-glow)" strokeWidth="1" opacity="0.1"/>
                </pattern>

                {/* 霓虹渐变 */}
                <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00ff9d" />
                    <stop offset="50%" stopColor="#00e0ff" />
                    <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>

                {/*/!* 扫描线渐变 *!/*/}
                <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="10%" stopColor="rgba(0,255,157,0.1)" />
                    <stop offset="90%" stopColor="rgba(0,255,157,0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* 网格背景 */}
            <rect width="100%" height="100%" fill="url(#cyber-grid)" />

        </svg>
    );
}