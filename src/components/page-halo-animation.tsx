"use client"

import { usePathname } from 'next/navigation';

/**
 * 全屏扫描线组件
 */
function PageHaloAnimation() {
    return (
        <>
            {/* 固定全屏扫描线 */}
            <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-neon-400/5 to-transparent animate-scan-line" />
            </div>
        </>
    );
}

/**
 * 页面扫描线背景
 */
function PageScanBackground() {
    const pathname = usePathname();
    const isActivePage = pathname === '/';

    if (!isActivePage) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-30">
            {/* 全局网格背景 */}
            <div className="absolute inset-0 opacity-5 grid-background" />

            {/* 中心光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyber-neon-400/10 via-cyber-blue-400/5 to-cyber-pink-400/10 rounded-full blur-3xl" />

            {/* 边缘光晕 */}
            <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-cyber-pink-400/10 to-transparent" />

            {/* 动态粒子效果（可选） */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1px] h-[1px] bg-cyber-neon-400 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${1 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function GlobalScan() {
    return (
        <>
            {/* 全局扫描效果 */}
            <PageHaloAnimation />
            <PageScanBackground />
        </>
    );
}