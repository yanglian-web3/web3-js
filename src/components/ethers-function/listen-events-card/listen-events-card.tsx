import CyberButton from "@/src/components/ui/cyber-button";
import {ethers} from "ethers";
import {EnhancedTokenMonitor, TransferEvent} from "./listen-events";
import EthersFunctionCard from "../ethers-function-card";
import ExpandToggleShowContainer from "@/src/components/ethers-function/expand-toggle-show-container";
import {useSelector} from "react-redux";
import {RootState} from "@/src/store";
import {useEffect, useState, useSyncExternalStore} from "react";
import PageLoading from "@/src/components/page-loading";

// BigInt 序列化辅助函数
function safeJsonStringify(data: any, indent?: number): string {
    const replacer = (key: string, value: any) => {
        // 处理 BigInt
        if (typeof value === 'bigint') {
            return value.toString() + 'n'; // 添加 'n' 后缀标识 BigInt
        }

        // 处理 undefined
        if (value === undefined) {
            return 'undefined';
        }

        // 处理函数
        if (typeof value === 'function') {
            return `[Function: ${value.name || 'anonymous'}]`;
        }

        // 处理 Symbol
        if (typeof value === 'symbol') {
            return value.toString();
        }

        return value;
    };

    try {
        return JSON.stringify(data, replacer, indent);
    } catch (error) {
        console.error('JSON 序列化失败:', error);
        return `{ "error": "无法序列化数据", "message": "${error instanceof Error ? error.message : String(error)}" }`;
    }
}

// 安全解析函数（可选）
function safeJsonParse(jsonString: string): any {
    const reviver = (key: string, value: any) => {
        if (typeof value === 'string' && value.endsWith('n') && /^\d+n$/.test(value)) {
            return BigInt(value.slice(0, -1));
        }
        return value;
    };

    try {
        return JSON.parse(jsonString, reviver);
    } catch (error) {
        console.error('JSON 解析失败:', error);
        return null;
    }
}

export default function ListenEventsCard() {
    const { contractAddress } = useSelector((state: RootState) => state.ethersFunction)
    const [monitor, setMonitor] = useState<EnhancedTokenMonitor>()
    const [loading, setLoading] = useState(false)
    const [listenEvent, setListenEvent] = useState<TransferEvent>()
    const [serializedEvent, setSerializedEvent] = useState<string>('{}')
    const [isMonitoring, setIsMonitoring] = useState(false) // 监听状态

    useEffect(() => {
        console.log("contractAddress=",contractAddress)
        if(!contractAddress){
            return
        }
        const monitorValue = new EnhancedTokenMonitor(
            contractAddress, // USDT
            ethers.getDefaultProvider('mainnet'),
            {
                minAmount: '1000', // 只监听大于1000USDT的交易
                onTransfer: (event) => {
                    // 保存到数据库或发送通知
                    console.log("页面监听结果 event=", event)
                    setListenEvent(event)

                    // 同时存储序列化版本
                    setSerializedEvent(safeJsonStringify(event, 2))
                }
            }
        )
        setMonitor(monitorValue)
    }, [contractAddress])

    // 监听事件变化，自动序列化
    useEffect(() => {
        if (listenEvent) {
            setSerializedEvent(safeJsonStringify(listenEvent, 2))
        }
    }, [listenEvent])

    useEffect(() => {
        setIsMonitoring(monitor?.getStatus() || false)
    }, [])
    /**
     * 开始监听
     */
    const toggleListen = () => {
        if(isMonitoring){
            // 停止监听
            monitor?.stop()
            setIsMonitoring(monitor?.getStatus() || false)
        } else {
            // 开始监听
            setLoading( true)
            monitor?.start().finally(() => {
                setLoading( false)
                setIsMonitoring(monitor?.getStatus() || false)
            })
        }

    }

    // 格式化事件显示
    const formatEventForDisplay = (event: TransferEvent | undefined) => {
        if (!event) return null;

        return {
            from: event.from,
            to: event.to,
            value: event.value?.toString() + ' (BigInt)',
            formattedValue: event.value ? ethers.formatUnits(event.value, 18) : '0',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
        };
    };

    return  <EthersFunctionCard>
        {
            ({expand, setExpand}) => (
                <PageLoading loading={loading} size="mini">
                    <div className="mb-2 flex justify-between items-center">
                        <span className="mr-4">监听事件</span>
                        <ExpandToggleShowContainer expand={expand} className="space-x-2">
                            <CyberButton onClick={toggleListen}>{isMonitoring ? '停止' : '开始'}监听</CyberButton>
                        </ExpandToggleShowContainer>
                    </div>
                    {
                        monitor ? <>
                            <ExpandToggleShowContainer expand={expand}>
                                <p>监听状态：{isMonitoring ? '正在监听' : '已停止监听'}</p>
                            </ExpandToggleShowContainer>
                            <p className="mt-2">合约代币地址：{contractAddress}</p>

                            {/* 格式化显示事件信息 */}
                            {listenEvent && (
                                <div className="mt-4 p-4 bg-cyber-dark-300 rounded border border-cyber-dark-400">
                                    <h3 className="font-medium text-cyber-neon-400 mb-2">最新监听结果</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-400">从:</span> {listenEvent.from}</div>
                                        <div><span className="text-gray-400">到:</span> {listenEvent.to}</div>
                                        <div>
                                            <span className="text-gray-400">金额:</span>
                                            <span className="ml-2">
                                                {ethers.formatUnits(listenEvent.value, 18)}
                                                <span className="text-gray-500 text-xs ml-2">
                                                    (原始值: {listenEvent.value.toString()})
                                                </span>
                                            </span>
                                        </div>
                                        <div><span className="text-gray-400">交易哈希:</span> {listenEvent.transactionHash}</div>
                                        <div><span className="text-gray-400">区块:</span> {listenEvent.blockNumber}</div>
                                    </div>
                                </div>
                            )}

                            {/* 监听结果 JSON 预览 */}
                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                                    查看完整 JSON 数据
                                </summary>
                                <pre className="mt-2 p-3 bg-cyber-dark-400 rounded text-xs text-gray-300 overflow-auto max-h-60">
                                    {serializedEvent}
                                </pre>
                            </details>

                        </> : null
                    }
                </PageLoading>
            )
        }
    </EthersFunctionCard>
}