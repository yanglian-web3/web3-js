"use client"

// 基础卡片


import React, { ReactNode } from 'react'
import { cn } from '../../utils/utils'

interface CyberCardProps {
    children?: ReactNode
    className?: string
    contentClassName?: string
    hoverEffect?: boolean
    glowColor?: 'neon' | 'pink' | 'blue' | 'purple'
    borderStyle?: 'gradient' | 'solid' | 'dashed'
    onClick?: () => void
}

export default function CyberCard({
                                      children,
                                      className,
                                      contentClassName,
                                      hoverEffect = true,
                                      glowColor = 'neon',
                                      borderStyle = 'gradient',
                                      onClick
                                  }: CyberCardProps) {

    const glowColors = {
        neon: {
            shadow: 'var(--shadow-neon)',
            hoverShadow: 'var(--shadow-neon-lg)',
            gradientFrom: 'var(--color-cyber-neon-400)',
            gradientTo: 'var(--color-cyber-purple-400)'
        },
        pink: {
            shadow: 'var(--shadow-neon-pink)',
            hoverShadow: '0 0 30px rgba(255, 0, 255, 0.9)',
            gradientFrom: 'var(--color-cyber-pink-400)',
            gradientTo: 'var(--color-cyber-purple-400)'
        },
        blue: {
            shadow: 'var(--shadow-neon-blue)',
            hoverShadow: '0 0 30px rgba(0, 224, 255, 0.9)',
            gradientFrom: 'var(--color-cyber-blue-400)',
            gradientTo: 'var(--color-cyber-neon-400)'
        },
        purple: {
            shadow: 'var(--shadow-neon-purple)',
            hoverShadow: '0 0 30px rgba(157, 0, 255, 0.9)',
            gradientFrom: 'var(--color-cyber-purple-400)',
            gradientTo: 'var(--color-cyber-pink-400)'
        }
    }

    const selectedGlow = glowColors[glowColor]

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative rounded-xl transition-all duration-500 overflow-hidden",
                hoverEffect && "group cursor-pointer",
                className
            )}
            style={{
                background: 'var(--background-image-card-gradient)',
                boxShadow: `0 4px 20px rgba(10, 10, 15, 0.8), ${selectedGlow.shadow}`,
                border: '1px solid transparent'
            }}
        >
            {/* 边框层 */}
            <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                    border: borderStyle === 'solid'
                        ? '1px solid rgba(0, 255, 157, 0.2)'
                        : borderStyle === 'dashed'
                            ? '1px dashed rgba(0, 255, 157, 0.3)'
                            : `1px solid transparent`,
                    ...(borderStyle === 'gradient' && {
                        background: `linear-gradient(var(--color-cyber-dark-400), var(--color-cyber-dark-400)) padding-box,
                        linear-gradient(135deg, ${selectedGlow.gradientFrom}, ${selectedGlow.gradientTo}) border-box`,
                        border: '1px solid transparent'
                    })
                }}
            />

            {/* 网格背景 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                 style={{
                     backgroundImage: `
            linear-gradient(rgba(0, 255, 157, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 157, 0.3) 1px, transparent 1px)
          `,
                     backgroundSize: '40px 40px'
                 }}
            />

            {/* 悬停光晕效果 */}
            {hoverEffect && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{
                         background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                         ${selectedGlow.gradientFrom}20 0%, 
                         transparent 70%)`,
                         filter: 'blur(20px)'
                     }}
                />
            )}

            {/* 内容区域 */}
            <div className={`relative z-10 p-6 ${contentClassName}`}>
                {children}
            </div>
        </div>
    )
}