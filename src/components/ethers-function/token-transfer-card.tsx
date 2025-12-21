import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {useState} from "react";
import CyberCard from "@/src/components/ui/card/cyber-card";
import PageLoading from "@/src/components/page-loading";
import CyberButton from "@/src/components/ui/cyber-button";
import {isMetaMaskInstalled} from "@/src/utils/ethers-function";
import {ERC20_HUMAN_ABI} from "@/src/constants/abis/erc20-human-readable";
import {ERC20_JSON_ABI} from "@/src/constants/abis/erc20-json";
import {getEthersFunctions} from "@/src/lib/ethers";

interface TokenTransferCardProps {
    ethersVersion: '5' | '6'
}
type AbiFormat = 'HUMAN' | 'JSON';

// 常用的测试代币地址（以太坊主网）
const TEST_TOKENS = {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // 6 decimals
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // 6 decimals
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // 18 decimals
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // 18 decimals
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // 18 decimals
}

export default function TokenTransferCard({ethersVersion}: TokenTransferCardProps) {
    const [abiFormat, setAbiFormat] = useState<AbiFormat>('HUMAN');
    const [loading, setLoading] = useState(false)
    const [contractAddress, setContractAddress] = useState(TEST_TOKENS.USDT)
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('10')
    const [decimals, setDecimals] = useState(6)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string>('')

    // 获取当前版本的函数
    const functionEvents = getEthersFunctions(ethersVersion);

    /**
     * 获取ABI
     */
    const getABI = () => {
        const abiData: Record<AbiFormat, any[]> = {
            HUMAN: ERC20_HUMAN_ABI,
            JSON: ERC20_JSON_ABI
        }
        return abiData[abiFormat]
    }

    /**
     * ABI格式切换
     */
    const abiFormatChange = (value: AbiFormat) => {
        setAbiFormat(value);
    };

    /**
     * 获取代币信息（使用统一函数）
     */
    const handleGetTokenInfo = async () => {
        const isInstalled = await isMetaMaskInstalled()
        if (!isInstalled) return

        try {
            setLoading(true)
            setError('')

            const ERC20_ABI = getABI()
            const tokenInfo = await functionEvents.getTokenInfo(contractAddress, ERC20_ABI)

            setDecimals(tokenInfo.decimals)

            setResult({
                type: 'token_info',
                data: tokenInfo
            })
        } catch (err: any) {
            setError(`获取代币信息失败: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 代币转账处理（使用统一函数）
     */
    const handleTokenTransfer = async () => {
        const isInstalled = await isMetaMaskInstalled()
        if (!isInstalled) return

        if (!recipient) {
            setError('请输入接收地址')
            return
        }

        if (!amount || Number(amount) <= 0) {
            setError('请输入有效金额')
            return
        }

        try {
            setLoading(true)
            setError('')

            const ERC20_ABI = getABI()

            setResult({
                type: 'tx_sending',
                data: {
                    contractAddress,
                    to: recipient,
                    amount,
                    decimals,
                    abiFormat
                }
            })

            // 调用统一的代币转账函数
            const transferResult = await functionEvents.tokenTransfer({
                contractAddress,
                to: recipient,
                amount,
                ERC20_ABI,
                decimals
            })

            setResult({
                type: 'tx_confirmed',
                data: {
                    ...transferResult,
                    amount,
                    abiFormat
                }
            })

        } catch (err: any) {
            setError(`转账失败: ${err.message}`)
        } finally {
            setLoading(false)
        }
    };

    return (
        <CyberCard contentClassName={`${loading ? "h-[690px]" : ""}`}>
            <PageLoading loading={loading} size="mini">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="mr-4 flex items-center">
                            <span className="mr-3 font-medium">代币转账测试</span>
                            <Select value={abiFormat} onValueChange={abiFormatChange}>
                                <SelectGroup>
                                    <div className="flex items-center gap-4">
                                        <SelectLabel className="whitespace-nowrap text-md">
                                            ABI 格式
                                        </SelectLabel>
                                        <div className="flex-1">
                                            <SelectTrigger className="w-[200px] text-cyber-blue-200">
                                                <SelectValue placeholder="选择ABI 格式" />
                                            </SelectTrigger>
                                        </div>
                                    </div>
                                    <SelectContent>
                                        <SelectItem value="HUMAN">ERC20_HUMAN_ABI</SelectItem>
                                        <SelectItem value="JSON">ERC20_JSON_ABI</SelectItem>
                                    </SelectContent>
                                </SelectGroup>
                            </Select>
                        </div>
                    </div>

                    {/* 代币地址选择 */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            代币合约地址
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                className="flex-1 px-3 py-2 bg-cyber-dark-300 border border-cyber-dark-400 rounded text-white text-sm"
                                placeholder="输入代币合约地址"
                                disabled={loading}
                            />
                            <Select value={contractAddress} onValueChange={setContractAddress}>
                                <SelectGroup>
                                    <div className="flex items-center gap-4">
                                        <SelectLabel className="whitespace-nowrap text-md">
                                            ABI 格式
                                        </SelectLabel>
                                        <div className="flex-1">
                                            <SelectTrigger className="w-[100px] text-cyber-blue-200">
                                                <SelectValue placeholder="选择ABI 格式" />
                                            </SelectTrigger>
                                        </div>
                                    </div>
                                    <SelectContent>
                                        {Object.entries(TEST_TOKENS).map(([symbol, address]) => (
                                            <SelectItem key={symbol} value={address}>
                                                {symbol}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectGroup>
                            </Select>
                        </div>
                        <CyberButton
                            onClick={handleGetTokenInfo}
                            size="small"
                            loading={loading}
                            className="mt-2"
                        >
                            获取代币信息
                        </CyberButton>
                    </div>

                    {/* 接收地址 */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            接收地址
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full px-3 py-2 bg-cyber-dark-300 border border-cyber-dark-400 rounded text-white text-sm"
                            placeholder="0x..."
                            disabled={loading}
                        />
                    </div>

                    {/* 金额和精度 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                转账金额
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 bg-cyber-dark-300 border border-cyber-dark-400 rounded text-white text-sm"
                                step="0.000001"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                小数位数
                            </label>
                            <Select value={decimals} onValueChange={setDecimals}>
                                <SelectGroup>
                                    <div className="flex items-center gap-4">
                                        <SelectLabel className="whitespace-nowrap text-md">
                                            ABI 格式
                                        </SelectLabel>
                                        <div className="flex-1">
                                            <SelectTrigger className="w-[200px] text-cyber-blue-200">
                                                <SelectValue placeholder="选择ABI 格式" />
                                            </SelectTrigger>
                                        </div>
                                    </div>
                                    <SelectContent>
                                        <SelectItem value="6">6（USDT/USDC）</SelectItem>
                                        <SelectItem value="18">18（ETH/DAI）</SelectItem>
                                        <SelectItem value="8">8（WBTC）</SelectItem>
                                        <SelectItem value="9">9</SelectItem>
                                    </SelectContent>
                                </SelectGroup>
                            </Select>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-4">
                        <CyberButton
                            onClick={handleTokenTransfer}
                            loading={loading}
                            disabled={loading || !recipient || !amount}
                            fullWidth
                        >
                            {loading ? '处理中...' : '发送转账'}
                        </CyberButton>
                    </div>

                    {/* 结果显示 */}
                    {result && (
                        <div className="mt-4 p-4 bg-cyber-dark-300 rounded border border-cyber-dark-400">
                            <h3 className="font-medium text-cyber-neon-400 mb-2">
                                {result.type === 'token_info' ? '代币信息' :
                                    result.type === 'tx_sending' ? '正在发送交易...' :
                                        result.type === 'tx_confirmed' ? '交易已确认' : '结果'}
                            </h3>
                            <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* 错误显示 */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* ABI 预览 */}
                    <details className="mt-6">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                            查看当前 ABI 内容
                        </summary>
                        <pre className="mt-2 p-3 bg-cyber-dark-400 rounded text-xs text-gray-300 overflow-auto max-h-60">
                            {JSON.stringify(getABI(), null, 2)}
                        </pre>
                    </details>
                </div>
            </PageLoading>
        </CyberCard>
    )
}