"use client"
// 交易卡片

import React from 'react'
import { cn } from '../../lib/utils'
import CyberCard from './cyber-card'
import { formatDistanceToNow } from 'date-fns'

interface TransactionCardProps {
    type: 'send' | 'receive' | 'swap' | 'approve'
    amount: string
    token: string
    from: string
    to: string
    time: Date
    status: 'pending' | 'confirmed' | 'failed'
    txHash: string
}

export default function TransactionCard({
                                            type,
                                            amount,
                                            token,
                                            from,
                                            to,
                                            time,
                                            status,
                                            txHash
                                        }: TransactionCardProps) {

    const typeConfig = {
        send: {
            label: 'Sent',
            color: 'text-cyber-danger-400',
            bgColor: 'bg-cyber-danger-400/10',
            icon: '↑'
        },
        receive: {
            label: 'Received',
            color: 'text-cyber-neon-400',
            bgColor: 'bg-cyber-neon-400/10',
            icon: '↓'
        },
        swap: {
            label: 'Swapped',
            color: 'text-cyber-blue-400',
            bgColor: 'bg-cyber-blue-400/10',
            icon: '⇄'
        },
        approve: {
            label: 'Approved',
            color: 'text-cyber-purple-400',
            bgColor: 'bg-cyber-purple-400/10',
            icon: '✓'
        }
    }

    const statusConfig = {
        pending: {
            label: 'Pending',
            color: 'text-yellow-400',
            dotColor: 'bg-yellow-400 animate-pulse'
        },
        confirmed: {
            label: 'Confirmed',
            color: 'text-cyber-neon-400',
            dotColor: 'bg-cyber-neon-400'
        },
        failed: {
            label: 'Failed',
            color: 'text-cyber-danger-400',
            dotColor: 'bg-cyber-danger-400'
        }
    }

    const config = typeConfig[type]
    const statusInfo = statusConfig[status]

    return (
        <CyberCard className="p-4" glowColor="purple" borderStyle="dashed">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
          <span className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold",
              config.bgColor,
              config.color
          )}>
            {config.icon}
          </span>
                    <div>
                        <h4 className={cn("font-semibold", config.color)}>
                            {config.label}
                        </h4>
                        <p className="text-gray-400 text-sm">
                            {formatDistanceToNow(time, { addSuffix: true })}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={cn("text-lg font-bold", config.color)}>
                        {amount} {token}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <div className={cn("w-2 h-2 rounded-full", statusInfo.dotColor)} />
                        <span className={cn("text-xs", statusInfo.color)}>
              {statusInfo.label}
            </span>
                    </div>
                </div>
            </div>

            {/* 地址信息 */}
            <div className="space-y-2 pt-3 border-t border-cyber-dark-300">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">From</span>
                    <code className="font-mono text-gray-300 text-xs">
                        {from.slice(0, 6)}...{from.slice(-4)}
                    </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">To</span>
                    <code className="font-mono text-gray-300 text-xs">
                        {to.slice(0, 6)}...{to.slice(-4)}
                    </code>
                </div>
            </div>

            {/* 交易哈希 */}
            <div className="mt-3 pt-3 border-t border-cyber-dark-300">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">TX Hash</span>
                    <button
                        onClick={() => navigator.clipboard.writeText(txHash)}
                        className="text-cyber-blue-400 hover:text-cyber-blue-300 text-xs font-mono"
                    >
                        {txHash.slice(0, 8)}...{txHash.slice(-6)}
                    </button>
                </div>
            </div>
        </CyberCard>
    )
}