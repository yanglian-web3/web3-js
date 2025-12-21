
// 完整的、生产可用的监听器
import {ethers} from "ethers";
import {ERC20_ABI} from "@/lib/constants";

interface TransferEvent {
    from: string
    to: string
    value: bigint
    transactionHash: string
    blockNumber: number
}

export class EnhancedTokenMonitor {
    private contract: ethers.Contract
    private isMonitoring = false

    constructor(
        tokenAddress: string,
        provider: ethers.Provider,
        private options = {
            decimals: 18,
            filterFrom: [],
            filterTo:[],
            minAmount: 0,
            onTransfer: (event: TransferEvent) => {}
        }
    ) {
        this.contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    }

    // 开始监听
    async start(): Promise<void> {
        if (this.isMonitoring) {
            console.warn('已经在监听中')
            return
        }

        // 监听新事件
        this.contract.on('Transfer', this.handleTransfer.bind(this))

        // 也可以查询历史事件
        await this.queryPastEvents()

        this.isMonitoring = true
        console.log(`✅ 开始监听 ${await this.contract.name()} 转账`)
    }

    // 停止监听
    stop(): void {
        this.contract.removeAllListeners('Transfer')
        this.isMonitoring = false
        console.log('⏹️ 停止监听')
    }

    private async handleTransfer(
        from: string,
        to: string,
        value: bigint,
        event: ethers.EventLog
    ): Promise<void> {
        // 过滤条件
        if (this.options.filterFrom &&
            !this.options.filterFrom.includes(from.toLowerCase())) {
            return
        }

        if (this.options.filterTo &&
            !this.options.filterTo.includes(to.toLowerCase())) {
            return
        }

        if (this.options.minAmount &&
            value < ethers.parseUnits(this.options.minAmount, this.options.decimals)) {
            return
        }

        const formattedAmount = ethers.formatUnits(value, this.options.decimals)
        const symbol = await this.contract.symbol()

        console.log(`📤 ${symbol} 转账: ${formattedAmount}`)
        console.log(`   从: ${from}`)
        console.log(`   到: ${to}`)
        console.log(`   交易: ${event.transactionHash}`)

        // 回调函数
        if (this.options.onTransfer) {
            this.options.onTransfer({
                from,
                to,
                value,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            })
        }
    }

    private async queryPastEvents(days = 1): Promise<void> {
        const currentBlock = await this.contract.provider.getBlockNumber()
        const blocksPerDay = 7200 // 大约值
        const fromBlock = currentBlock - (blocksPerDay * days)

        const filter = this.contract.filters.Transfer()
        const events = await this.contract.queryFilter(filter, fromBlock, currentBlock)

        console.log(`📜 过去 ${days} 天有 ${events.length} 笔转账`)
    }
}

// 使用示例
// const monitor = new EnhancedTokenMonitor(
//     '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
//     ethers.getDefaultProvider('mainnet'),
//     {
//         minAmount: '1000', // 只监听大于1000USDT的交易
//         onTransfer: (event) => {
//             // 保存到数据库或发送通知
//         }
//     }
// )
//
// // 开始监听
// monitor.start()

// 需要时停止
// monitor.stop()