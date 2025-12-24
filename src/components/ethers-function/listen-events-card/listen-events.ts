// 完整的、生产可用的监听器
import { ethers } from "ethers";
import {ERC20_HUMAN_ABI} from "@/src/constants/abis/erc20-human-readable";

interface TransferEvent {
    from: string;
    to: string;
    value: bigint;
    transactionHash: string;
    blockNumber: number;
}

interface MonitorOptions {
    decimals?: number;
    filterFrom?: string[];
    filterTo?: string[];
    minAmount?: number | string;
    onTransfer?: (event: TransferEvent) => void;
}

export class EnhancedTokenMonitor {
    private contract: ethers.Contract;
    private provider: ethers.Provider;
    private isMonitoring = false;
    private listeners: Array<() => void> = []; // 保存监听器引用

    constructor(
        tokenAddress: string,
        provider: ethers.Provider,
        private options: MonitorOptions = {}
    ) {
        this.provider = provider;
        this.contract = new ethers.Contract(tokenAddress, ERC20_HUMAN_ABI, provider);
    }

    /**
     * 开始监听
     */
    async start(): Promise<void> {
        if (this.isMonitoring) {
            console.warn("已经在监听中");
            return;
        }

        try {
            // 检查合约是否支持 Transfer 事件
            const iface = this.contract.interface;
            const hasTransferEvent = iface.fragments.some(
                (fragment) => fragment.name === "Transfer"
            );

            if (!hasTransferEvent) {
                throw new Error("该合约不支持 Transfer 事件");
            }

            // 方法1：使用合约监听（ethers v6 正确方式）
            const transferListener = async (
                from: string,
                to: string,
                value: bigint,
                event: ethers.EventLog
            ) => {
                await this.handleTransfer(from, to, value, event);
            };

            // 绑定监听器 - ethers v6 的正确方式
            this.contract.on(this.contract.filters.Transfer(), transferListener);

            // 保存监听器引用以便后续移除
            this.listeners.push(() => {
                this.contract.off(this.contract.filters.Transfer(), transferListener);
            });

            console.log("✅ Transfer 事件监听器已绑定");

            // 方法2：使用 provider 监听（替代方案）
            // 也可以使用这种方式，但需要处理解析
            // await this.setupProviderListener();

            // 查询历史事件
            await this.queryPastEvents();

            this.isMonitoring = true;

            try {
                const name = await this.contract.name();
                console.log(`✅ 开始监听 ${name} 转账`);
            } catch {
                console.log(`✅ 开始监听合约 ${this.contract.target} 的转账事件`);
            }
        } catch (error) {
            console.error("启动监听失败:", error);
            throw error;
        }
    }

    /**
     * 使用 Provider 监听事件的替代方案
     */
    private async setupProviderListener(): Promise<void> {
        // 监听所有日志，然后过滤 Transfer 事件
        const listener = async (log: ethers.Log) => {
            try {
                // 解析日志
                const parsedLog = this.contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data,
                });

                if (parsedLog && parsedLog.name === "Transfer") {
                    const from = parsedLog.args[0];
                    const to = parsedLog.args[1];
                    const value = parsedLog.args[2];

                    await this.handleTransfer(
                        from,
                        to,
                        value,
                        {
                            ...log,
                            args: parsedLog.args,
                            fragment: parsedLog.fragment,
                            interface: parsedLog.interface,
                        } as ethers.EventLog
                    );
                }
            } catch (error) {
                // 忽略解析错误（可能是其他合约的事件）
            }
        };

        // 监听所有日志
        this.provider.on("logs", listener);

        // 保存监听器引用
        this.listeners.push(() => {
            this.provider.off("logs", listener);
        });
    }

    /**
     * 停止监听
     */
    stop(): void {
        // 移除所有监听器
        this.listeners.forEach(removeListener => removeListener());
        this.listeners = [];

        this.isMonitoring = false;
        console.log("⏹️ 停止监听");
    }

    private async handleTransfer(
        from: string,
        to: string,
        value: bigint,
        event: ethers.EventLog
    ): Promise<void> {
        try {
            // 设置默认值
            const decimals = this.options.decimals || 18;
            const minAmount = this.options.minAmount || 0;

            // 过滤条件 - 确保数组存在
            if (
                this.options.filterFrom &&
                this.options.filterFrom.length > 0 &&
                !this.options.filterFrom.includes(from.toLowerCase())
            ) {
                return;
            }

            if (
                this.options.filterTo &&
                this.options.filterTo.length > 0 &&
                !this.options.filterTo.includes(to.toLowerCase())
            ) {
                return;
            }

            // 金额过滤
            if (minAmount) {
                const minValue =
                    typeof minAmount === "string"
                        ? ethers.parseUnits(minAmount.toString(), decimals)
                        : ethers.parseUnits(minAmount.toString(), decimals);
                if (value < minValue) {
                    return;
                }
            }

            const formattedAmount = ethers.formatUnits(value, decimals);

            // 获取代币符号（缓存或直接使用）
            let symbol = "TOKEN";
            try {
                symbol = await this.contract.symbol();
            } catch {
                // 如果获取失败，使用默认值
            }

            console.log(`📤 ${symbol} 转账: ${formattedAmount}`);
            console.log(`   从: ${from}`);
            console.log(`   到: ${to}`);
            console.log(`   交易: ${event.transactionHash}`);
            console.log(`   区块: ${event.blockNumber}`);

            // 回调函数
            if (this.options.onTransfer) {
                this.options.onTransfer({
                    from,
                    to,
                    value,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                });
            }
        } catch (error) {
            console.error("处理转账事件出错:", error);
        }
    }

    private async queryPastEvents(days = 1): Promise<void> {
        try {
            const currentBlock = await this.provider.getBlockNumber();
            const blocksPerDay = 7200; // 以太坊主网大约值，根据实际链调整
            const fromBlock = Math.max(0, currentBlock - blocksPerDay * days);

            console.log(`查询从区块 ${fromBlock} 到 ${currentBlock} 的事件`);

            // 使用合约的 queryFilter 方法
            const filter = this.contract.filters.Transfer();
            const events = await this.contract.queryFilter(
                filter,
                fromBlock,
                currentBlock
            );

            console.log(`📜 过去 ${days} 天有 ${events.length} 笔转账`);

            // 处理历史事件
            for (const event of events) {
                if (event.args && event.args.length >= 3) {
                    await this.handleTransfer(
                        event.args[0],
                        event.args[1],
                        event.args[2],
                        event as ethers.EventLog
                    );
                }
            }
        } catch (error) {
            console.error("查询历史事件失败:", error);
        }
    }

    /**
     * 获取当前监听状态
     */
    getStatus(): boolean {
        return this.isMonitoring;
    }

    /**
     * 更新过滤条件
     */
    updateOptions(newOptions: Partial<MonitorOptions>): void {
        this.options = { ...this.options, ...newOptions };
        console.log("🔄 监听选项已更新");
    }

    /**
     * 获取合约信息
     */
    async getContractInfo() {
        try {
            const [name, symbol, decimals] = await Promise.all([
                this.contract.name(),
                this.contract.symbol(),
                this.contract.decimals(),
            ]);
            return { name, symbol, decimals, address: this.contract.target };
        } catch (error) {
            console.error("获取合约信息失败:", error);
            return null;
        }
    }
}

// 简化的监听器创建函数
export async function createTokenMonitor(
    tokenAddress: string,
    providerUrl: string,
    options?: MonitorOptions
): Promise<EnhancedTokenMonitor> {
    // 创建 provider
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // 创建监听器
    const monitor = new EnhancedTokenMonitor(tokenAddress, provider, options);

    // 可选：显示合约信息
    const info = await monitor.getContractInfo();
    if (info) {
        console.log(`🔄 连接合约: ${info.name} (${info.symbol})`);
    }

    return monitor;
}

// 使用示例
/*
async function main() {
  try {
    // 创建监听器
    const monitor = await createTokenMonitor(
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
      {
        decimals: 6,
        minAmount: '1000',
        onTransfer: (event) => {
          console.log('大额转账:', event);
        }
      }
    );

    // 开始监听
    await monitor.start();

    // 在适当的时候停止
    // setTimeout(() => monitor.stop(), 60000); // 1分钟后停止

  } catch (error) {
    console.error('监控器创建失败:', error);
  }
}

// 在 React 中使用
import { useEffect, useRef } from 'react';
import { EnhancedTokenMonitor } from './EnhancedTokenMonitor';

export function TokenMonitor({ tokenAddress, provider }) {
  const monitorRef = useRef<EnhancedTokenMonitor | null>(null);

  useEffect(() => {
    if (!tokenAddress || !provider) return;

    // 创建监听器
    monitorRef.current = new EnhancedTokenMonitor(tokenAddress, provider, {
      onTransfer: (event) => {
        // 更新 React 状态或发送通知
        console.log('转账事件:', event);
      }
    });

    // 开始监听
    monitorRef.current.start();

    // 清理函数
    return () => {
      if (monitorRef.current?.getStatus()) {
        monitorRef.current.stop();
      }
    };
  }, [tokenAddress, provider]);

  return null;
}
*/