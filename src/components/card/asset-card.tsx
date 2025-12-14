"use client"


// 资产卡片


import React from 'react'
import { cn } from '../../lib/utils'
import CyberCard from './cyber-card'

interface AssetCardProps {
    name: string
    symbol: string
    amount: string
    value: string
    change: string
    isPositive: boolean
    iconUrl?: string
    onClick?: () => void
}

export default function AssetCard({
                                      name,
                                      symbol,
                                      amount,
                                      value,
                                      change,
                                      isPositive,
                                      iconUrl,
                                      onClick
                                  }: AssetCardProps) {
    return (
        <CyberCard
            onClick={onClick}
            className="p-4"
            glowColor="neon"
            borderStyle="solid"
        >
            <div className="flex items-center justify-between">
                {/* Token 信息 */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {iconUrl ? (
                            <img
                                src={iconUrl}
                                alt={symbol}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-neon-400 to-cyber-purple-400 flex items-center justify-center">
                                <span className="text-black font-bold text-sm">{symbol.charAt(0)}</span>
                            </div>
                        )}
                        {/* 在线状态指示器 */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-cyber-dark-400">
                            <div className="w-full h-full rounded-full bg-gradient-to-r from-cyber-neon-400 to-cyber-cyan-400 animate-pulse" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white">{name}</h4>
                        <p className="text-gray-400 text-sm">{symbol}</p>
                    </div>
                </div>

                {/* 资产数据 */}
                <div className="text-right">
                    <p className="text-lg font-bold text-white">{amount}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-gray-400 text-sm">${value}</span>
                        <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded",
                            isPositive
                                ? "text-cyber-neon-400 bg-cyber-neon-400/10"
                                : "text-cyber-danger-400 bg-cyber-danger-400/10"
                        )}>
              {isPositive ? '+' : ''}{change}%
            </span>
                    </div>
                </div>
            </div>

            {/* 交易数据条 */}
            <div className="mt-4 pt-4 border-t border-cyber-dark-300">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>24h Volume</span>
                    <span>$1.2M</span>
                </div>
                <div className="h-1.5 w-full bg-cyber-dark-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 rounded-full"
                        style={{ width: '60%' }}
                    />
                </div>
            </div>
        </CyberCard>
    )
}