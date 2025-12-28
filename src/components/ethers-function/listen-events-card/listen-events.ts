// 完整的、生产可用的监听器 - 终极修复版
import { ethers } from "ethers";
import { ERC20_HUMAN_ABI } from "@/src/constants/abis/erc20-human-readable";

export interface TransferEvent {
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
    maxQueryBlocks?: number;
    skipHistory?: boolean;
    debug?: boolean;
    maxRetries?: number;
    forceSingleProvider?: boolean;
    disableAutoQueries?: boolean; // 新增：禁用所有自动查询
}

export class EnhancedTokenMonitor {
    private contract: ethers.Contract;
    private provider: ethers.Provider;
    private effectiveProvider: ethers.Provider;
    private isMonitoring = false;
    private listeners: Array<() => void> = [];
    private debugMode: boolean;
    private isFallbackProvider: boolean = false;
    private queryPromise: Promise<any> | null = null;

    constructor(
        tokenAddress: string,
        provider: ethers.Provider,
        private options: MonitorOptions = {}
    ) {
        this.provider = provider;
        this.debugMode = options.debug || false;

        // 1. 首先处理 provider，避免 FallbackProvider
        this.effectiveProvider = this.createSafeProvider(provider);

        // 2. 使用安全的 provider 创建合约
        this.contract = new ethers.Contract(
            tokenAddress,
            ERC20_HUMAN_ABI,
            this.effectiveProvider // 关键：使用安全的 provider
        );

        this.debugLog(`监听器创建完成，合约地址: ${tokenAddress}`);
    }

    /**
     * 创建安全的 provider
     */
    private createSafeProvider(originalProvider: ethers.Provider): ethers.Provider {
        // 检查是否是 FallbackProvider
        const isFallback = this.isFallbackProviderCheck(originalProvider);
        this.isFallbackProvider = isFallback;

        if (this.debugMode) {
            console.log(`原始 Provider 类型: ${originalProvider.constructor.name}`);
            console.log(`是否 FallbackProvider: ${isFallback}`);
        }

        // 如果是 FallbackProvider 或者强制使用单一 provider，则创建新的单一 provider
        if (this.options.forceSingleProvider || isFallback) {
            this.debugLog("创建新的单一 provider...");
            return this.createNewSingleProvider();
        }

        return originalProvider;
    }

    /**
     * 检查是否是 FallbackProvider
     */
    private isFallbackProviderCheck(provider: ethers.Provider): boolean {
        try {
            // 检查是否是 FallbackProvider
            if (provider.constructor.name === 'FallbackProvider') {
                return true;
            }

            // 检查是否有 _providers 属性
            if ((provider as any)._providers !== undefined) {
                return true;
            }

            // 检查其他可能的多 provider 类型
            const providerStr = JSON.stringify(provider, null, 2);
            if (providerStr.includes('FallbackProvider') ||
                providerStr.includes('_providers') ||
                providerStr.includes('quorum')) {
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    /**
     * 创建新的单一 provider
     */
    private createNewSingleProvider(): ethers.JsonRpcProvider {
        try {
            // 尝试从各种可能的来源获取 RPC URL
            let rpcUrl = 'http://localhost:8545'; // 默认本地

            // 如果是浏览器环境，检查 window.ethereum
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                this.debugLog("检测到浏览器钱包，使用 window.ethereum");
                return new ethers.BrowserProvider((window as any).ethereum);
            }

            // 尝试从环境变量获取
            if (process.env.NEXT_PUBLIC_RPC_URL) {
                rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
            }

            this.debugLog(`创建单一 provider，使用 RPC: ${rpcUrl}`);

            return new ethers.JsonRpcProvider(rpcUrl, undefined, {
                staticNetwork: true,
                batchMaxCount: 1,
                cacheTimeout: -1,
                polling: false, // 禁用轮询
            });

        } catch (error) {
            console.error("创建单一 provider 失败:", error);
            // 如果失败，尝试创建最简化的 provider
            return new ethers.JsonRpcProvider('http://localhost:8545');
        }
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
            this.debugLog("开始启动监听器...");

            // 1. 检查合约是否支持 Transfer 事件
            const hasTransferEvent = await this.checkTransferEventSupport();
            if (!hasTransferEvent) {
                throw new Error("该合约不支持 Transfer 事件");
            }

            // 2. 显示代币信息
            await this.displayTokenInfo();

            // 3. 绑定实时监听器
            await this.setupRealTimeListener();

            console.log("✅ Transfer 事件监听器已绑定");
            this.isMonitoring = true;

            // 4. 如果不禁用自动查询，则异步查询历史事件
            if (!this.options.disableAutoQueries && !this.options.skipHistory) {
                this.debugLog("开始异步查询历史事件...");

                // 使用防抖，避免重复查询
                if (!this.queryPromise) {
                    this.queryPromise = this.safeQueryPastEvents()
                        .finally(() => {
                            this.queryPromise = null;
                        });
                }
            } else if (this.options.disableAutoQueries) {
                console.log("🚫 已禁用自动查询");
            } else {
                console.log("⏭️ 跳过历史事件查询");
            }

        } catch (error) {
            console.error("启动监听失败:", error);
            this.cleanupListeners();
            throw error;
        }
    }

    /**
     * 检查 Transfer 事件支持
     */
    private async checkTransferEventSupport(): Promise<boolean> {
        try {
            const iface = this.contract.interface;
            const hasEvent = iface.fragments.some(
                (fragment) => fragment.name === "Transfer"
            );

            if (!hasEvent) {
                console.error("合约不支持 Transfer 事件");
                return false;
            }

            return true;
        } catch (error) {
            console.error("检查 Transfer 事件失败:", error);
            return false;
        }
    }

    /**
     * 设置实时监听器 - 修复ethers v6事件参数问题
     */
    private async setupRealTimeListener(): Promise<void> {
        this.debugLog("绑定实时事件监听器...");

        try {
            // 方法1：处理完整的 ContractEventPayload
            const transferListener = async (...args: any[]) => {
                try {
                    console.log('🔍 监听器收到参数:', args);
                    console.log('参数数量:', args.length);
                    console.log('第一个参数类型:', args[0]?.constructor?.name);

                    let from: string | null = null;
                    let to: string | null = null;
                    let value: bigint | null = null;
                    let eventLog: ethers.EventLog | null = null;

                    // 情况1：第一个参数是 ContractEventPayload
                    if (args[0] &&
                        (args[0].constructor.name === 'ContractEventPayload' ||
                            args[0].args !== undefined)) {
                        const payload = args[0];

                        // 从 payload.args 获取参数
                        if (payload.args && Array.isArray(payload.args)) {
                            from = payload.args[0] as string;
                            to = payload.args[1] as string;
                            value = payload.args[2] as bigint;
                        } else if (payload.args && typeof payload.args === 'object') {
                            // args 可能是对象形式
                            from = (payload.args as any).from || (payload.args as any)[0] as string;
                            to = (payload.args as any).to || (payload.args as any)[1] as string;
                            value = (payload.args as any).value || (payload.args as any)[2] as bigint;
                        }

                        // 获取 EventLog
                        if (payload.log) {
                            eventLog = payload.log;
                        } else if (payload.transactionHash) {
                            // 如果是简化的 EventLog
                            eventLog = payload as any;
                        }
                    }
                    // 情况2：直接是 EventLog
                    else if (args[0] && args[0].constructor.name === 'EventLog') {
                        eventLog = args[0];
                        if (eventLog.args && Array.isArray(eventLog.args)) {
                            from = eventLog.args[0] as string;
                            to = eventLog.args[1] as string;
                            value = eventLog.args[2] as bigint;
                        }
                    }
                    // 情况3：三个独立参数 (from, to, value, event)
                    else if (args.length >= 3) {
                        from = args[0] as string;
                        to = args[1] as string;
                        value = args[2] as bigint;
                        eventLog = args[3] as ethers.EventLog;
                    }
                    console.log("验证参数之前-----------------------------")
                    // 验证参数
                    if (!from || !to || value === null || !eventLog) {
                        console.warn('⚠️ 无法解析事件参数，原始参数:', args);
                        return;
                    }
                    console.log("验证参数之后==============")
                    // 确保 value 是 bigint
                    const safeValue = typeof value === 'bigint' ? value : BigInt(value.toString());

                    // 处理事件
                    await this.handleTransfer(from, to, safeValue, eventLog);

                } catch (error) {
                    console.error('监听器回调错误:', error);
                }
            };

            // 创建 filter
            const filter = this.contract.filters.Transfer();

            // 绑定监听器
            this.contract.on(filter, transferListener);

            this.listeners.push(() => {
                try {
                    this.contract.off(filter, transferListener);
                } catch (e) {
                    console.warn('取消监听器时出错:', e);
                }
            });

            console.log("✅ 事件监听器已绑定");

        } catch (error) {
            console.error("绑定监听器失败:", error);
            throw error;
        }
    }
    /**
     * 安全查询历史事件（完全避免 fromBlock == toBlock）
     */
    private async safeQueryPastEvents(): Promise<void> {
        try {
            console.log(`开始安全查询历史事件...`);

            // 获取当前区块高度
            const currentBlock = await this.getBlockNumberSafe();

            // 计算安全的查询范围
            const { fromBlock, toBlock } = this.calculateSafeRange(currentBlock);

            if (fromBlock >= toBlock) {
                console.log("⚠️ 查询范围无效，跳过历史查询");
                return;
            }

            this.debugLog(`安全查询范围: ${fromBlock} 到 ${toBlock} (相差 ${toBlock - fromBlock} 个区块)`);

            // 使用专门的查询方法
            const events = await this.queryEventsWithSafeRange(fromBlock, toBlock);

            console.log(`📜 查询到 ${events.length} 笔历史转账`);

            // 处理事件
            if (events.length > 0) {
                await this.processEvents(events);
            }

        } catch (error) {
            console.error("安全查询历史事件失败:", error);
            // 不抛出，只记录
        }
    }

    /**
     * 计算安全范围（确保 fromBlock < toBlock 且至少相差10个区块）
     */
    private calculateSafeRange(currentBlock: number): { fromBlock: number; toBlock: number } {
        // 设置最小查询范围
        const MIN_BLOCK_RANGE = 10;
        const MAX_BLOCKS_TO_QUERY = this.options.maxQueryBlocks || 100;

        let fromBlock = Math.max(0, currentBlock - MAX_BLOCKS_TO_QUERY);
        let toBlock = currentBlock;

        // 确保 fromBlock < toBlock
        if (fromBlock >= toBlock) {
            fromBlock = Math.max(0, toBlock - MIN_BLOCK_RANGE);
        }

        // 确保至少相差 MIN_BLOCK_RANGE 个区块
        if (toBlock - fromBlock < MIN_BLOCK_RANGE) {
            fromBlock = Math.max(0, toBlock - MIN_BLOCK_RANGE);
        }

        return { fromBlock, toBlock };
    }

    /**
     * 使用安全范围查询事件
     */
    private async queryEventsWithSafeRange(
        fromBlock: number,
        toBlock: number
    ): Promise<ethers.EventLog[]> {
        // 双重检查：确保 fromBlock < toBlock
        if (fromBlock >= toBlock) {
            console.warn(`⚠️ 范围无效: fromBlock(${fromBlock}) >= toBlock(${toBlock})`);
            return [];
        }

        const filter = this.contract.filters.Transfer();

        try {
            // 直接查询，不使用任何包装
            return await this.contract.queryFilter(filter, fromBlock, toBlock);

        } catch (error: any) {
            // 如果是范围错误，尝试调整范围
            if (error.message.includes('block range') ||
                error.message.includes('invalid range') ||
                error.message.includes('invalid block range params')) {

                console.warn(`查询范围错误，调整范围...`);

                // 增加范围大小
                const newFromBlock = Math.max(0, fromBlock - 10);
                const newToBlock = toBlock + 10;

                if (newFromBlock < newToBlock) {
                    try {
                        return await this.contract.queryFilter(filter, newFromBlock, newToBlock);
                    } catch (retryError) {
                        console.error("调整范围后查询仍然失败:", retryError);
                    }
                }
            }

            console.error("查询事件失败:", error);
            return [];
        }
    }

    /**
     * 安全的获取区块高度
     */
    private async getBlockNumberSafe(): Promise<number> {
        try {
            const blockNumber = await this.effectiveProvider.getBlockNumber();
            this.debugLog(`获取区块高度成功: ${blockNumber}`);
            return blockNumber;
        } catch (error) {
            console.error("获取区块高度失败:", error);

            // 如果失败，返回一个安全的默认值
            return 0;
        }
    }

    /**
     * 处理事件
     */
    private async processEvents(events: ethers.EventLog[]): Promise<void> {
        // 限制处理速度
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            if (event.args && event.args.length >= 3) {
                try {
                    await this.handleTransfer(
                        event.args[0],
                        event.args[1],
                        event.args[2],
                        event
                    );

                    // 每处理10个事件休息一下
                    if (i > 0 && i % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }

                } catch (error) {
                    console.warn("处理历史事件失败:", error);
                }
            }
        }
    }

    /**
     * 处理单个转账事件
     */
    private async handleTransfer(
        from: string | null,
        to: string | null,
        value: bigint | null,
        event: ethers.EventLog
    ): Promise<void> {
        try {
            // 1. 安全检查参数
            const argsValid = this.areTransferArgsValid(from, to, value);
            console.log(`argsValid`, argsValid);
            if (!argsValid) {
                // 安全的日志输出
                console.warn('⚠️ 事件参数不完整');
                console.log('from:', from);
                console.log('to:', to);
                console.log('value:', value);
                console.log('event:', {
                    transactionHash: event?.transactionHash,
                    blockNumber: event?.blockNumber
                });
                return;
            }
            console.log(`确保 value 是 bigint (这里 value 肯定不是 null)`);
            // 2. 确保 value 是 bigint (这里 value 肯定不是 null)
            const safeValue = value!; // 非空断言，因为上面已经检查过了

            // 3. 应用过滤器
            if (!this.passFilters(from!, to!, safeValue)) {
                console.log(`应用过滤器 进入if`);
                return;
            }
            console.log(`4. 获取代币信息`);
            // 4. 获取代币信息
            const symbol = await this.getTokenSymbol();
            const decimals = this.options.decimals || await this.getTokenDecimals();
            console.log(`5. 安全格式化金额`);
            // 5. 安全格式化金额
            const formattedAmount = this.formatUnitsSafely(safeValue, decimals);
            console.log(`6. 输出日志`);
            // 6. 输出日志
            this.logTransfer(symbol, formattedAmount, from!, to!, event);

            // 7. 触发回调
            if (this.options.onTransfer) {
                this.options.onTransfer({
                    from: from!,
                    to: to!,
                    value: safeValue,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                });
            }
        } catch (error) {
            console.error("处理转账事件出错:", error);
            // 安全的错误日志
            this.logErrorSafely('handleTransfer', error, { from, to, value });
        }
    }
    /**
     * 安全检查转账参数
     */
    private areTransferArgsValid(
        from: string | null,
        to: string | null,
        value: bigint | null
    ): boolean {
        console.log('areTransferArgsValid', { from, to, value });
        // 检查是否为 null/undefined
        if (from === null || from === undefined) return false;
        if (to === null || to === undefined) return false;
        if (value === null || value === undefined) return false;

        // 检查是否为字符串
        if (typeof from !== 'string') return false;
        if (typeof to !== 'string') return false;

        // 检查地址格式
        if (!from.startsWith('0x') || from.length !== 42) return false;
        if (!to.startsWith('0x') || to.length !== 42) return false;

        // 检查 value 是否为 bigint
        if (typeof value !== 'bigint') return false;

        return true;
    }
    /**
     * 安全格式化单位
     */
    private formatUnitsSafely(value: bigint, decimals: number): string {
        try {
            return ethers.formatUnits(value, decimals);
        } catch (error) {
            console.warn('ethers.formatUnits 失败，使用手动计算:', error);

            // 手动计算
            const valueStr = value.toString();

            if (decimals <= 0) {
                return valueStr;
            }

            // 补零
            const padded = valueStr.padStart(decimals + 1, '0');
            const integerPart = padded.slice(0, -decimals) || '0';
            const decimalPart = padded.slice(-decimals).replace(/0+$/, '');

            if (decimalPart) {
                return `${integerPart}.${decimalPart}`;
            }
            return integerPart;
        }
    }

    /**
     * 安全记录错误
     */
    private logErrorSafely(context: string, error: any, data?: any): void {
        try {
            console.error(`❌ ${context} 错误:`, error.message || error);

            if (data) {
                // 安全地序列化数据
                const safeData = this.safeSerialize(data);
                console.error('相关数据:', safeData);
            }
        } catch (logError) {
            console.error('记录错误时发生错误:', logError);
        }
    }
    /**
     * 安全序列化数据
     */
    private safeSerialize(data: any): any {
        try {
            // 处理 BigInt
            if (typeof data === 'bigint') {
                return data.toString();
            }

            // 处理对象
            if (data && typeof data === 'object') {
                const result: any = {};
                for (const [key, value] of Object.entries(data)) {
                    result[key] = this.safeSerialize(value);
                }
                return result;
            }

            // 处理数组
            if (Array.isArray(data)) {
                return data.map(item => this.safeSerialize(item));
            }

            // 基本类型直接返回
            return data;

        } catch (error) {
            return '[无法序列化数据]';
        }
    }
    /**
     * 安全转换为 BigInt
     */
    private safeToBigInt(value: any): bigint {
        if (value === null || value === undefined) {
            throw new Error('Value is null or undefined');
        }

        // 如果已经是 bigint
        if (typeof value === 'bigint') {
            return value;
        }

        // 如果是 number
        if (typeof value === 'number') {
            if (isNaN(value)) {
                throw new Error('Value is NaN');
            }
            return BigInt(Math.floor(value));
        }

        // 如果是 string
        if (typeof value === 'string') {
            // 检查是否是十六进制
            if (value.startsWith('0x')) {
                try {
                    return BigInt(value);
                } catch {
                    // 如果不是有效的十六进制，尝试十进制
                }
            }

            // 尝试十进制
            const decimalMatch = value.match(/^\d+(\.\d+)?$/);
            if (decimalMatch) {
                // 如果是小数，取整数部分
                const integerPart = decimalMatch[0].split('.')[0];
                return BigInt(integerPart);
            }

            throw new Error(`Invalid string value: ${value}`);
        }

        // 如果是 BigNumber (ethers v5)
        if (value._isBigNumber) {
            return value.toBigInt();
        }

        // 如果是可以转换为数字的对象
        if (value.toString) {
            try {
                const str = value.toString();
                return this.safeToBigInt(str);
            } catch {
                // 继续尝试其他方法
            }
        }

        throw new Error(`Cannot convert value to BigInt: ${typeof value} ${value}`);
    }

    /**
     * 安全格式化单位
     */
    private safeFormatUnits(value: bigint, decimals: number): string | null {
        try {
            // 检查参数
            if (value === null || value === undefined) {
                console.error('FormatUnits: value is null/undefined');
                return null;
            }

            if (typeof decimals !== 'number' || isNaN(decimals)) {
                console.error('FormatUnits: invalid decimals:', decimals);
                return null;
            }

            // 确保 value 是 bigint
            const bigintValue = this.safeToBigInt(value);

            // 使用 ethers 的 formatUnits
            return ethers.formatUnits(bigintValue, decimals);

        } catch (error) {
            console.error('❌ safeFormatUnits 失败:', error, {
                value,
                valueType: typeof value,
                decimals
            });

            // 降级方案：手动计算
            try {
                const valueStr = value.toString();
                if (decimals <= 0) {
                    return valueStr;
                }

                // 手动处理小数位
                const padded = valueStr.padStart(decimals + 1, '0');
                const integerPart = padded.slice(0, -decimals) || '0';
                const decimalPart = padded.slice(-decimals).replace(/0+$/, '');

                if (decimalPart) {
                    return `${integerPart}.${decimalPart}`;
                }
                return integerPart;

            } catch (manualError) {
                console.error('手动格式化也失败:', manualError);
                return null;
            }
        }
    }

    /**
     * 修改 pass_Filters 方法，接受 bigint
     */
    private passFilters(from: string, to: string, value: bigint): boolean {
        console.log('pass_Filters: from=', from, "to=", to, "value=", value);
        try {
            // 地址过滤
            if (this.options.filterFrom &&
                this.options.filterFrom.length > 0 &&
                !this.options.filterFrom.includes(from.toLowerCase())) {
                console.log("pass_filters 第一个if")
                return false;
            }

            if (this.options.filterTo &&
                this.options.filterTo.length > 0 &&
                !this.options.filterTo.includes(to.toLowerCase())) {
                console.log("pass_filters 第3个if")
                return false;
            }

            // 金额过滤
            // if (this.options.minAmount) {
            //     const decimals = this.options.decimals || 18;
            //     const minValue = typeof this.options.minAmount === "string"
            //         ? ethers.parseUnits(this.options.minAmount.toString(), decimals)
            //         : ethers.parseUnits(this.options.minAmount.toString(), decimals);
            //
            //     if (value < minValue) {
            //         console.log("pass_filters 第3个if")
            //         return false;
            //     }
            // }

            return true;
        } catch (error) {
            console.error('pass_Filters 出错:', error);
            return false;
        }
    }

    /**
     * 获取代币符号
     */
    private async getTokenSymbol(): Promise<string> {
        try {
            return await this.contract.symbol();
        } catch {
            return "TOKEN";
        }
    }

    /**
     * 获取代币精度
     */
    private async getTokenDecimals(): Promise<number> {
        try {
            return await this.contract.decimals();
        } catch {
            return 18;
        }
    }

    /**
     * 输出转账日志
     */
    private logTransfer(
        symbol: string,
        amount: string,
        from: string,
        to: string,
        event: ethers.EventLog
    ): void {
        console.log(`📤 ${symbol} 转账: ${amount}`);
        console.log(`   从: ${from}`);
        console.log(`   到: ${to}`);
        console.log(`   交易: ${event.transactionHash}`);
        console.log(`   区块: ${event.blockNumber}`);
    }

    /**
     * 显示代币信息
     */
    private async displayTokenInfo(): Promise<void> {
        try {
            const name = await this.contract.name();
            console.log(`✅ 开始监听 ${name} 转账`);
        } catch {
            console.log(`✅ 开始监听合约 ${this.contract.target} 的转账事件`);
        }
    }

    /**
     * 清理监听器
     */
    private cleanupListeners(): void {
        this.debugLog(`清理 ${this.listeners.length} 个监听器`);
        this.listeners.forEach(removeListener => {
            try {
                removeListener();
            } catch (e) {
                // 忽略清理时的错误
            }
        });
        this.listeners = [];
    }

    /**
     * 停止监听
     */
    stop(): void {
        this.cleanupListeners();
        this.isMonitoring = false;
        console.log("⏹️ 停止监听");
    }

    /**
     * 调试日志
     */
    private debugLog(...args: any[]): void {
        if (this.debugMode) {
            console.log("[DEBUG]", ...args);
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
        if (newOptions.debug !== undefined) {
            this.debugMode = newOptions.debug;
        }
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

// 终极创建函数 - 完全避免 FallbackProvider 问题
export async function createSafeTokenMonitor(
    tokenAddress: string,
    providerUrl?: string,
    options?: MonitorOptions
): Promise<EnhancedTokenMonitor> {
    console.log(`🔄 创建安全 TokenMonitor，地址: ${tokenAddress}`);

    // 1. 创建完全安全的单一 provider
    let provider: ethers.Provider;

    if (!providerUrl) {
        providerUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
    }

    provider = new ethers.JsonRpcProvider(providerUrl, undefined, {
        staticNetwork: true,
        batchMaxCount: 1,
        cacheTimeout: -1,
        polling: false, // 关键：禁用轮询
    });

    // 2. 创建监听器，使用最安全的配置
    const monitor = new EnhancedTokenMonitor(tokenAddress, provider, {
        debug: true,
        forceSingleProvider: true,
        disableAutoQueries: true, // 关键：禁用所有自动查询
        skipHistory: true,        // 关键：跳过历史查询
        maxQueryBlocks: 50,       // 关键：限制查询范围
        ...options,
    });

    return monitor;
}

// 专门用于完全禁用所有查询的创建函数
export async function createMinimalTokenMonitor(
    tokenAddress: string,
    providerUrl?: string
): Promise<EnhancedTokenMonitor> {
    return createSafeTokenMonitor(tokenAddress, providerUrl, {
        debug: false,
        forceSingleProvider: true,
        disableAutoQueries: true,
        skipHistory: true,
        maxQueryBlocks: 0,
    });
}