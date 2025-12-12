// components/cyber-animations.tsx
export default function CyberAnimations() {
    return (
        <>
            {/* 主扫描线 - CSS 动画 */}
            <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
                <div
                    className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-neon-400 to-transparent"
                    style={{
                        animation: 'scan-down 8s linear infinite',
                        top: '0%',
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                    }}
                />
            </div>

            {/* 次扫描线 - 反向 */}
            <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
                <div
                    className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue-400 to-transparent"
                    style={{
                        animation: 'scan-down 12s linear infinite reverse',
                        top: '20%',
                        animationDelay: '-4s',
                        willChange: 'transform'
                    }}
                />
            </div>

            {/* 动态粒子 - 用 div 而不是 SVG */}
            <div className="fixed inset-0 pointer-events-none z-5">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1px] h-[1px] bg-cyber-neon-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `particle-pulse ${1 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            boxShadow: '0 0 10px currentColor',
                            willChange: 'opacity, transform'
                        }}
                    />
                ))}
            </div>
        </>
    );
}