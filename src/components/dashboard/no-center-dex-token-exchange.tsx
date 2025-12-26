import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import PageLoading from "@/src/components/page-loading";
import CyberButton from "@/src/components/ui/cyber-button";
import {
    getTokenContractAddresses,
    isMetaMaskInstalled
} from "@/src/utils/ethers-function";
import { useChainId } from 'wagmi'
import { useGlobalModal } from "@/src/components/ui/cyber-modal/global-modal";
import EthersFunctionCard from "@/src/components/ethers-function/ethers-function-card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { updateContractAddress } from "@/src/store/ethers-function";
import Modal from '../../components/ui/cyber-modal';
import { ethers } from "ethers";
import { getEthersFunctions } from "@/src/lib/ethers";

// DEX 路由器配置
const DEX_CONFIGS = {
    // 本地测试网络
    31337: {
        name: "本地测试",
        routers: [
            {
                name: "本地测试路由器",
                address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat 默认第一个地址
                factory: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
            }
        ]
    },
    // 以太坊主网
    1: {
        name: "以太坊主网",
        routers: [
            {
                name: "Uniswap V2",
                address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
            },
            {
                name: "SushiSwap",
                address: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
                factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
            }
        ]
    },
    // BSC 网络
    56: {
        name: "币安智能链",
        routers: [
            {
                name: "PancakeSwap V2",
                address: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
                factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
            }
        ]
    },
    // Polygon 网络
    137: {
        name: "Polygon",
        routers: [
            {
                name: "QuickSwap",
                address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
                factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"
            },
            {
                name: "SushiSwap (Polygon)",
                address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
                factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
            }
        ]
    },
    // Arbitrum
    42161: {
        name: "Arbitrum",
        routers: [
            {
                name: "Uniswap V3",
                address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
                factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
            },
            {
                name: "SushiSwap (Arbitrum)",
                address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
                factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
            }
        ]
    }
};

// Uniswap V2 Router ABI (主要函数)
const UNISWAP_ROUTER_ABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
    "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
    "function factory() external view returns (address)"
];

interface DEXSwapCardProps {
    ethersVersion: '5' | '6'
}

interface SwapHistory {
    id: string;
    timestamp: number;
    fromToken: string;
    toToken: string;
    amountIn: string;
    amountOut: string;
    dex: string;
    txHash: string;
    status: 'pending' | 'success' | 'failed';
}

export default function DEXSwapCard({ ethersVersion }: DEXSwapCardProps) {
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const { contractAddress } = useSelector((state: RootState) => state.ethersFunction);
    const [renderAddress, setRenderAddress] = useState<{ [k: string]: string }>({});

    // DEX 相关状态
    const [selectedDex, setSelectedDex] = useState<string>('');
    const [fromToken, setFromToken] = useState('');
    const [toToken, setToToken] = useState('');
    const [swapAmount, setSwapAmount] = useState('1');
    const [slippage, setSlippage] = useState(0.5); // 默认 0.5%
    const [pricePreview, setPricePreview] = useState<{
        expectedOutput: string;
        priceImpact: string;
        minimumReceived: string;
    } | null>(null);

    // 交易历史
    const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const chainId = useChainId();
    const modal = useGlobalModal();
    const dispatch = useDispatch<AppDispatch>();
    const functionEvents = getEthersFunctions(ethersVersion);

    // 可用的 DEX 列表
    const availableDexes = DEX_CONFIGS[chainId as keyof typeof DEX_CONFIGS]?.routers || [];

    useEffect(() => {
        getSelectTokenAddressList();
        // 从 localStorage 加载交易历史
        const savedHistory = localStorage.getItem('dexSwapHistory');
        if (savedHistory) {
            try {
                setSwapHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('加载交易历史失败:', e);
            }
        }
    }, [chainId]);

    /**
     * 获取代币地址列表
     */
    const getSelectTokenAddressList = () => {
        getTokenContractAddresses(chainId).then((address) => {
            console.log('address:', address);
            setRenderAddress(address);
            dispatch(updateContractAddress(Object.values(address)[0] || ""));

            // 设置默认的代币选择
            const tokens = Object.entries(address);
            if (tokens.length >= 2) {
                setFromToken(tokens[0][1]); // 第一个代币作为输入
                setToToken(tokens[1][1]);   // 第二个代币作为输出
            }
        });
    };

    /**
     * 获取价格预览
     */
    const getPricePreview = async () => {
        if (!fromToken || !toToken || !swapAmount || !selectedDex) {
            setError('请先选择代币、输入金额和 DEX');
            return;
        }

        if (parseFloat(swapAmount) <= 0) {
            setError('请输入有效的兑换金额');
            return;
        }

        setPreviewLoading(true);
        setError('');

        try {
            // 获取输入代币的小数位数
            const inputDecimals = 18; // 简化处理，实际应该从合约获取

            const amountInWei = ethers.parseUnits(swapAmount, inputDecimals);
            const path = [fromToken, toToken];

            // 获取路由器合约
            const provider = new ethers.BrowserProvider(window.ethereum);
            const router = new ethers.Contract(selectedDex, UNISWAP_ROUTER_ABI, provider);

            // 获取预期输出
            const amounts = await router.getAmountsOut(amountInWei, path);
            const expectedOutput = ethers.formatUnits(amounts[1], 18); // 假设输出也是18位小数

            // 计算价格影响（简化计算）
            const priceImpact = "0.1"; // 实际应该基于流动性计算

            // 计算最小接收金额（考虑滑点）
            const minReceived = (parseFloat(expectedOutput) * (100 - slippage) / 100).toFixed(6);

            setPricePreview({
                expectedOutput,
                priceImpact,
                minimumReceived: minReceived
            });

        } catch (err: any) {
            setError(`获取价格预览失败: ${err.message}`);
            setPricePreview(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    /**
     * 交换代币
     */
    const handleSwap = async () => {
        const isInstalled = await isMetaMaskInstalled();
        if (!isInstalled) return;

        if (!fromToken || !toToken || !swapAmount || !selectedDex) {
            setError('请完善所有必填项');
            return;
        }

        if (parseFloat(swapAmount) <= 0) {
            setError('请输入有效的兑换金额');
            return;
        }

        if (chainId === 1n) {
            // 主网警告
            modal.open({
                title: '⚠️ 主网交易确认',
                content: `确认在 ${DEX_CONFIGS[1]?.routers.find(d => d.address === selectedDex)?.name || '选定的 DEX'} 上进行代币兑换？\n\n兑换 ${swapAmount} 代币A → 代币B`,
                showCancelButton: true,
                confirmText: '确认兑换',
                cancelText: '取消',
                size: 'sm',
                theme: 'neon',
                onConfirm: executeSwap
            });
            return;
        }

        executeSwap();
    };

    /**
     * 执行兑换
     */
    const executeSwap = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. 连接钱包
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            // 2. 获取路由器合约
            const router = new ethers.Contract(selectedDex, UNISWAP_ROUTER_ABI, signer);

            // 3. 设置路径和参数
            const path = [fromToken, toToken];
            const amountInWei = ethers.parseUnits(swapAmount, 18); // 假设18位小数

            // 4. 授权输入代币（如果需要）
            const tokenInContract = new ethers.Contract(
                fromToken,
                ["function approve(address spender, uint256 amount) external returns (bool)"],
                signer
            );

            // 检查授权
            const allowance = await tokenInContract.allowance(userAddress, selectedDex);
            if (allowance < amountInWei) {
                setResult({
                    type: 'tx_sending',
                    data: { message: '正在授权代币...' }
                });

                const approveTx = await tokenInContract.approve(selectedDex, amountInWei);
                await approveTx.wait();
            }

            // 5. 获取预期输出并计算最小输出
            const amounts = await router.getAmountsOut(amountInWei, path);
            const expectedOutput = amounts[1];

            // 应用滑点计算最小输出
            const slippageBasis = 10000n;
            const slippageTolerance = BigInt(Math.floor(slippage * 100));
            const amountOutMin = expectedOutput * (slippageBasis - slippageTolerance) / slippageBasis;

            // 6. 设置截止时间
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟

            // 7. 执行兑换
            setResult({
                type: 'tx_sending',
                data: {
                    message: '正在执行兑换...',
                    fromToken,
                    toToken,
                    amount: swapAmount,
                    dex: selectedDex
                }
            });

            const tx = await router.swapExactTokensForTokens(
                amountInWei,
                amountOutMin,
                path,
                userAddress,
                deadline,
                { gasLimit: 300000 }
            );

            // 8. 等待交易确认
            const receipt = await tx.wait();

            // 9. 保存交易记录
            const swapRecord: SwapHistory = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                fromToken: Object.keys(renderAddress).find(key => renderAddress[key] === fromToken) || fromToken,
                toToken: Object.keys(renderAddress).find(key => renderAddress[key] === toToken) || toToken,
                amountIn: swapAmount,
                amountOut: ethers.formatUnits(expectedOutput, 18),
                dex: availableDexes.find(d => d.address === selectedDex)?.name || 'Unknown',
                txHash: receipt.hash,
                status: 'success'
            };

            const updatedHistory = [swapRecord, ...swapHistory.slice(0, 9)]; // 保留最近10条
            setSwapHistory(updatedHistory);
            localStorage.setItem('dexSwapHistory', JSON.stringify(updatedHistory));

            // 10. 显示结果
            setResult({
                type: 'tx_confirmed',
                data: {
                    message: '兑换成功！',
                    transactionHash: receipt.hash,
                    amountIn: swapAmount,
                    amountOut: ethers.formatUnits(expectedOutput, 18),
                    dex: availableDexes.find(d => d.address === selectedDex)?.name,
                    gasUsed: receipt.gasUsed.toString()
                }
            });

            // 清空预览
            setPricePreview(null);

        } catch (err: any) {
            console.error('兑换失败:', err);
            setError(`兑换失败: ${err.message || '未知错误'}`);

            // 保存失败记录
            const failedRecord: SwapHistory = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                fromToken: Object.keys(renderAddress).find(key => renderAddress[key] === fromToken) || fromToken,
                toToken: Object.keys(renderAddress).find(key => renderAddress[key] === toToken) || toToken,
                amountIn: swapAmount,
                amountOut: '0',
                dex: availableDexes.find(d => d.address === selectedDex)?.name || 'Unknown',
                txHash: '',
                status: 'failed'
            };

            const updatedHistory = [failedRecord, ...swapHistory.slice(0, 9)];
            setSwapHistory(updatedHistory);
            localStorage.setItem('dexSwapHistory', JSON.stringify(updatedHistory));

        } finally {
            setLoading(false);
        }
    };

    /**
     * 切换代币方向
     */
    const reverseTokens = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        setPricePreview(null);
    };

    /**
     * 清空交易历史
     */
    const clearHistory = () => {
        if (confirm('确认清空所有交易历史？')) {
            setSwapHistory([]);
            localStorage.removeItem('dexSwapHistory');
        }
    };

    return (
        <>
            <EthersFunctionCard
                cardProps={{
                    contentClassName: `${loading ? "h-[750px]" : ""}`,
                }}
                expandClassName="min-h-[750px]"
            >
                <PageLoading loading={loading} size="mini">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="mr-4 flex items-center">
                                <span className="mr-3 font-medium">DEX 代币兑换</span>
                                <CyberButton
                                    size="small"
                                    variant="secondary"
                                    onClick={() => setShowHistory(!showHistory)}
                                >
                                    {showHistory ? '返回兑换' : '查看历史'}
                                </CyberButton>
                            </div>
                        </div>

                        {!showHistory ? (
                            <>
                                {/* 网络和 DEX 选择 */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            当前网络
                                        </label>
                                        <div className="p-2 bg-cyber-dark-400 rounded text-sm">
                                            {DEX_CONFIGS[chainId as keyof typeof DEX_CONFIGS]?.name || `网络 ${chainId}`}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            选择 DEX
                                        </label>
                                        <Select value={selectedDex} onValueChange={setSelectedDex}>
                                            <SelectTrigger className="w-full text-cyber-blue-200">
                                                <SelectValue placeholder="选择去中心化交易所" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>可用 DEX</SelectLabel>
                                                    {availableDexes.map((dex) => (
                                                        <SelectItem key={dex.address} value={dex.address}>
                                                            {dex.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 代币选择区域 */}
                                <div className="space-y-4 mb-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            从代币
                                        </label>
                                        <div className="flex gap-2">
                                            <Select value={fromToken} onValueChange={setFromToken}>
                                                <SelectTrigger className="flex-1 text-cyber-blue-200">
                                                    <SelectValue placeholder="选择输入代币" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(renderAddress).map(([symbol, address]) => (
                                                        <SelectItem key={`from-${address}`} value={address}>
                                                            {symbol}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="number"
                                                value={swapAmount}
                                                onChange={(e) => {
                                                    setSwapAmount(e.target.value);
                                                    setPricePreview(null);
                                                }}
                                                className="w-32 px-3 py-2 bg-cyber-dark-300 border border-cyber-dark-400 rounded text-white text-sm"
                                                placeholder="数量"
                                                step="0.000001"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* 切换按钮 */}
                                    <div className="flex justify-center">
                                        <CyberButton
                                            size="small"
                                            onClick={reverseTokens}
                                            className="rounded-full w-8 h-8 p-0"
                                        >
                                            ⇅
                                        </CyberButton>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            兑换为
                                        </label>
                                        <Select value={toToken} onValueChange={setToToken}>
                                            <SelectTrigger className="w-full text-cyber-blue-200">
                                                <SelectValue placeholder="选择输出代币" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(renderAddress).map(([symbol, address]) => (
                                                    <SelectItem key={`to-${address}`} value={address}>
                                                        {symbol}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 滑点设置 */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            滑点容忍度
                                        </label>
                                        <span className="text-sm text-cyber-neon-400">{slippage}%</span>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        {[0.1, 0.5, 1.0, 2.0].map((value) => (
                                            <CyberButton
                                                key={value}
                                                size="small"
                                                variant={slippage === value ? "primary" : "secondary"}
                                                onClick={() => setSlippage(value)}
                                            >
                                                {value}%
                                            </CyberButton>
                                        ))}
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="10"
                                        step="0.1"
                                        value={slippage}
                                        onChange={(e) => setSlippage(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-cyber-dark-400 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>0.1%</span>
                                        <span className={slippage > 2 ? 'text-yellow-500' : ''}>
                                            {slippage > 2 ? '⚠️ 高风险' : '安全'}
                                        </span>
                                        <span>10%</span>
                                    </div>
                                </div>

                                {/* 价格预览 */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-300">
                                            价格预览
                                        </label>
                                        <CyberButton
                                            size="small"
                                            onClick={getPricePreview}
                                            loading={previewLoading}
                                            disabled={!fromToken || !toToken || !selectedDex || !swapAmount}
                                        >
                                            更新报价
                                        </CyberButton>
                                    </div>

                                    {pricePreview ? (
                                        <div className="p-4 bg-cyber-dark-300 rounded border border-cyber-dark-400">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">预期收到:</span>
                                                    <span className="font-medium text-cyber-neon-400">
                                                        {pricePreview.expectedOutput}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">最小收到 (含滑点):</span>
                                                    <span className="font-medium">
                                                        {pricePreview.minimumReceived}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">价格影响:</span>
                                                    <span className={parseFloat(pricePreview.priceImpact) > 1 ? 'text-yellow-500' : 'text-green-500'}>
                                                        {pricePreview.priceImpact}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-cyber-dark-300 rounded border border-cyber-dark-400 text-center text-gray-400">
                                            点击"更新报价"获取实时价格
                                        </div>
                                    )}
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex gap-3 pt-4">
                                    <CyberButton
                                        onClick={handleSwap}
                                        loading={loading}
                                        disabled={loading || !fromToken || !toToken || !selectedDex || !swapAmount}
                                        fullWidth
                                    >
                                        {loading ? '兑换中...' : '开始兑换'}
                                    </CyberButton>
                                </div>
                            </>
                        ) : (
                            /* 交易历史 */
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-lg">兑换历史</h3>
                                    <CyberButton
                                        size="small"
                                        onClick={clearHistory}
                                        variant="secondary"
                                    >
                                        清空历史
                                    </CyberButton>
                                </div>

                                {swapHistory.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {swapHistory.map((record) => (
                                            <div
                                                key={record.id}
                                                className="p-3 bg-cyber-dark-300 rounded border border-cyber-dark-400"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">
                                                            {record.fromToken} → {record.toToken}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {new Date(record.timestamp).toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {record.dex}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {record.amountIn} → {record.amountOut}
                                                        </div>
                                                        <div className={`text-xs ${record.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {record.status === 'success' ? '✅ 成功' : '❌ 失败'}
                                                        </div>
                                                        {record.txHash && (
                                                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                {record.txHash.slice(0, 10)}...{record.txHash.slice(-8)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        暂无交易历史
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 结果显示 */}
                        {result && (
                            <div className="mt-4 p-4 bg-cyber-dark-300 rounded border border-cyber-dark-400">
                                <h3 className="font-medium text-cyber-neon-400 mb-2">
                                    {result.type === 'tx_sending' ? '交易进行中...' :
                                        result.type === 'tx_confirmed' ? '交易完成' : '结果'}
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
                    </div>
                </PageLoading>
            </EthersFunctionCard>
        </>
    );
}