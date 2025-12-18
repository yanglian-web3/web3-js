"use client"

// 信息卡片


import React from 'react'
import { cn } from '../../utils/utils'
import CyberCard from './cyber-card'

interface InfoCardProps {
    title: string
    value: string
    subtitle?: string
    icon?: React.ReactNode
    trend?: 'up' | 'down'
    trendValue?: string
    className?: string
}

export default function InfoCard({
                                     title,
                                     value,
                                     subtitle,
                                     icon,
                                     trend,
                                     trendValue,
                                     className
                                 }: InfoCardProps) {
    return (
        <CyberCard
            className={cn("p-5", className)}
            glowColor="blue"
            hoverEffect={false}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{value}</span>
                        {trend && trendValue && (
                            <span className={cn(
                                "text-xs font-semibold px-2 py-1 rounded",
                                trend === 'up'
                                    ? "text-cyber-neon-400 bg-cyber-neon-400/10"
                                    : "text-cyber-danger-400 bg-cyber-danger-400/10"
                            )}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-blue-400/20 to-cyber-purple-400/20">
                        {icon}
                    </div>
                )}
            </div>

            {subtitle && (
                <p className="text-gray-500 text-sm mt-4 pt-4 border-t border-cyber-dark-300">
                    {subtitle}
                </p>
            )}

            {/* 数据条效果 */}
            <div className="mt-4 h-1.5 w-full bg-cyber-dark-300 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyber-blue-400 to-cyber-purple-400 rounded-full"
                    style={{ width: '75%' }}
                />
            </div>
        </CyberCard>
    )
}