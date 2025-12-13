"use client"

import { useEffect, useState } from 'react';

export default function ScanStarAnimations() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // 服务端渲染时返回空或占位符
        return null;
    }

    // 客户端渲染时生成随机粒子
    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 1 + Math.random() * 3,
        delay: Math.random() * 5
    }));

    return (
        <>
            {/* 主扫描线 */}
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

            {/* 动态粒子 */}
            <div className="fixed inset-0 pointer-events-none z-5">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute w-[1px] h-[1px] bg-cyber-neon-400 rounded-full"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            animation: `particle-pulse ${particle.duration}s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s`,
                            boxShadow: '0 0 10px currentColor',
                            willChange: 'opacity, transform'
                        }}
                    />
                ))}
            </div>
        </>
    );
}