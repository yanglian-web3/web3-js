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
import {debugSimpleDEX} from "@/src/text-simple-dex";
import {ERC20_HUMAN_ABI} from "@/src/constants/abis/erc20-human-readable";

// SimpleDEX 配置（根据您的部署更新地址）
const SIMPLE_DEX_CONFIG = {
    31337: {
        name: "本地测试网络",
        simpleDex: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // 您的 SimpleDEX 地址
        tokens: {
            TKNA: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            TKNB: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        }
    }
};

// SimpleDEX ABI
const SIMPLE_DEX_ABI = [
    "function swap(uint256 amountIn, address fromToken, uint256 minAmountOut) external returns (uint256)",
    "function getAmountOut(uint256 amountIn, address fromToken) view returns (uint256)",
    "function getReserves() view returns (uint256, uint256)",
    "function getPrice() view returns (uint256)",
    "function tokenA() view returns (address)",
    "function tokenB() view returns (address)",
    "function addLiquidity(uint256 amountA, uint256 amountB) external",
    "function removeLiquidity(uint256 amountA, uint256 amountB) external",
    "event Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
] as const;

// DEX 路由器配置（简化版，只保留 SimpleDEX）
const DEX_CONFIGS = {
    31337: {
        name: "本地测试网络",
        routers: [
            {
                name: "SimpleDEX",
                address: SIMPLE_DEX_CONFIG[31337].simpleDex,
                type: "simpledex"
            }
        ]
    }
    // 其他网络配置可以暂时不添加
};

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

    // 可用的 DEX 列表（现在只有 SimpleDEX）
    const availableDexes = DEX_CONFIGS[chainId as keyof typeof DEX_CONFIGS]?.routers || [];

    useEffect(() => {

        debugSimpleDEX().then( result => {
            console.log("调试结果:", result);
        }).catch( error => {
            console.error("调试失败:", error);
        })
    }, [])

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
     * 获取代币地址列表 - 修改为使用 SimpleDEX 配置
     */
    const getSelectTokenAddressList = () => {
        // 使用 SimpleDEX 配置中的代币
        const config = SIMPLE_DEX_CONFIG[31337];
        if (config && config.tokens) {
            const addressMap = config.tokens;
            console.log('SimpleDEX 代币地址:', addressMap);
            setRenderAddress(addressMap);

            // 设置默认的代币选择
            const tokens = Object.entries(addressMap);
            if (tokens.length >= 2) {
                setFromToken(tokens[0][1]); // TKNA
                setToToken(tokens[1][1]);   // TKNB
            }

            // 自动选择 SimpleDEX
            if (availableDexes.length > 0) {
                setSelectedDex(availableDexes[0].address);
            }

            dispatch(updateContractAddress(tokens[0]?.[1] || ""));
        } else {
            // 回退到原有逻辑
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
        }
    };

    /**
     * 获取价格预览 - 专门为 SimpleDEX 设计
     */
    /**
     * 获取价格预览
     */
    const getPricePreview = async () => {
        if (!fromToken || !toToken || !swapAmount) {
            setError('请先选择代币和输入金额');
            return;
        }

        if (parseFloat(swapAmount) <= 0) {
            setError('请输入有效的兑换金额');
            return;
        }

        setPreviewLoading(true);
        setError('');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            console.log("=== 开始价格预览 ===");
            console.log("参数:", { fromToken, toToken, swapAmount });

            // 获取代币的小数位数
            const tokenInContract = new ethers.Contract(fromToken, ERC20_HUMAN_ABI, provider);
            const tokenOutContract = new ethers.Contract(toToken, ERC20_HUMAN_ABI, provider);

            const inDecimals = await tokenInContract.decimals();
            const outDecimals = await tokenOutContract.decimals();
            const tokenInSymbol = await tokenInContract.symbol();
            const tokenOutSymbol = await tokenOutContract.symbol();

            console.log("代币信息:", {
                tokenInSymbol, inDecimals,
                tokenOutSymbol, outDecimals
            });

            const amountInWei = ethers.parseUnits(swapAmount, inDecimals);

            // 获取 SimpleDEX 实例
            const dex = new ethers.Contract(selectedDex, SIMPLE_DEX_ABI, provider);

            // 获取合约信息
            const tokenA = await dex.tokenA();
            const tokenB = await dex.tokenB();
            const [reserveA, reserveB] = await dex.getReserves();

            console.log("DEX 状态:", {
                tokenA,
                tokenB,
                reserveA: ethers.formatEther(reserveA),
                reserveB: ethers.formatUnits(reserveB, 6)
            });

            // 验证交易对
            const isFromTokenA = fromToken.toLowerCase() === tokenA.toLowerCase();
            const isFromTokenB = fromToken.toLowerCase() === tokenB.toLowerCase();
            const isToTokenA = toToken.toLowerCase() === tokenA.toLowerCase();
            const isToTokenB = toToken.toLowerCase() === tokenB.toLowerCase();

            console.log("交易对验证:", {
                isFromTokenA,
                isFromTokenB,
                isToTokenA,
                isToTokenB
            });

            if (!(isFromTokenA || isFromTokenB) || !(isToTokenA || isToTokenB)) {
                throw new Error(`无效的交易对。请选择 TKNA 或 TKNB`);
            }

            if ((isFromTokenA && isToTokenA) || (isFromTokenB && isToTokenB)) {
                throw new Error('不能使用相同的代币进行兑换');
            }

            if (!(isFromTokenA && isToTokenB) && !(isFromTokenB && isToTokenA)) {
                throw new Error('请选择 TKNA -> TKNB 或 TKNB -> TKNA');
            }

            // 检查流动性
            if (reserveA === 0n || reserveB === 0n) {
                throw new Error('流动性池为空');
            }

            // 获取预期输出
            console.log("调用 getAmountOut...");
            const expectedOutputWei = await dex.getAmountOut(amountInWei, fromToken);
            const expectedOutput = ethers.formatUnits(expectedOutputWei, outDecimals);

            console.log("计算结果:", {
                amountIn: swapAmount,
                expectedOutput
            });

            // 计算价格影响
            let priceImpact = "0.1";
            try {
                if (isFromTokenA) {
                    const inputValue = Number(swapAmount);
                    const poolSize = Number(ethers.formatEther(reserveA));
                    priceImpact = (poolSize > 0 ? (inputValue / poolSize) * 100 : 0).toFixed(2);
                } else {
                    const inputValue = Number(ethers.formatUnits(amountInWei, outDecimals));
                    const poolSize = Number(ethers.formatUnits(reserveB, outDecimals));
                    priceImpact = (poolSize > 0 ? (inputValue / poolSize) * 100 : 0).toFixed(2);
                }
            } catch (calcError) {
                console.warn('价格影响计算失败:', calcError);
            }

            // 计算最小接收金额
            const minReceived = (parseFloat(expectedOutput) * (100 - slippage) / 100).toFixed(6);

            setPricePreview({
                expectedOutput,
                priceImpact,
                minimumReceived: minReceived
            });

        } catch (err: any) {
            console.error('获取价格预览失败:', err);

            let errorMsg = '获取价格预览失败';

            if (err.code === 'CALL_EXCEPTION') {
                errorMsg = `合约调用失败: ${err.reason || '请检查交易对和流动性'}`;
            } else if (err.message.includes('invalid token pair')) {
                errorMsg = '无效的交易对，请选择 TKNA 或 TKNB';
            } else if (err.message.includes('Insufficient liquidity')) {
                errorMsg = '流动性不足';
            } else {
                errorMsg = err.message;
            }

            setError(errorMsg);
            setPricePreview(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    /**
     * 交换代币 - 专门为 SimpleDEX 设计
     */
    const handleSwap = async () => {
        const isInstalled = await isMetaMaskInstalled();
        if (!isInstalled) {
            setError('请先安装 MetaMask 钱包');
            return;
        }

        if (!fromToken || !toToken || !swapAmount || !selectedDex) {
            setError('请完善所有必填项');
            return;
        }

        if (parseFloat(swapAmount) <= 0) {
            setError('请输入有效的兑换金额');
            return;
        }

        executeSwap();
    };

    /**
     * 执行兑换 - 专门为 SimpleDEX 设计
     * 执行兑换 - 修复版本（兼容 Hardhat）
     */
    const executeSwap = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. 连接钱包 - 使用传统交易格式
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            console.log('=== 开始兑换流程 ===');
            console.log('用户地址:', userAddress);
            console.log('输入参数:', { fromToken, toToken, swapAmount });

            // 2. 获取代币信息
            const tokenInContract = new ethers.Contract(fromToken, ERC20_HUMAN_ABI, signer);
            const tokenOutContract = new ethers.Contract(toToken, ERC20_HUMAN_ABI, signer);

            const inDecimals = await tokenInContract.decimals();
            const outDecimals = await tokenOutContract.decimals();
            const tokenInSymbol = await tokenInContract.symbol();
            const tokenOutSymbol = await tokenOutContract.symbol();

            console.log('代币信息:', { tokenInSymbol, inDecimals, tokenOutSymbol, outDecimals });

            // 检查余额
            const tokenInBalance = await tokenInContract.balanceOf(userAddress);
            const amountInWei = ethers.parseUnits(swapAmount, inDecimals);

            console.log('余额检查:', {
                需要: ethers.formatUnits(amountInWei, inDecimals),
                拥有: ethers.formatUnits(tokenInBalance, inDecimals)
            });

            if (tokenInBalance < amountInWei) {
                throw new Error(`余额不足，需要 ${swapAmount} ${tokenInSymbol}，但只有 ${ethers.formatUnits(tokenInBalance, inDecimals)}`);
            }

            // 3. 获取 SimpleDEX 实例
            const dex = new ethers.Contract(selectedDex, SIMPLE_DEX_ABI, signer);

            // 4. 获取预期输出并计算最小输出
            console.log('计算预期输出...');
            const expectedOutputWei = await dex.getAmountOut(amountInWei, fromToken);
            const slippageBasis = 10000n;
            const slippageTolerance = BigInt(Math.floor(slippage * 100));
            const amountOutMin = expectedOutputWei * (slippageBasis - slippageTolerance) / slippageBasis;

            console.log('兑换参数:', {
                amountIn: ethers.formatUnits(amountInWei, inDecimals) + ' ' + tokenInSymbol,
                expectedOutput: ethers.formatUnits(expectedOutputWei, outDecimals) + ' ' + tokenOutSymbol,
                amountOutMin: ethers.formatUnits(amountOutMin, outDecimals) + ' ' + tokenOutSymbol,
                slippage: `${slippage}%`
            });

            // 5. 授权输入代币 - 使用传统 gas 设置
            console.log('检查授权...');
            try {
                const allowance = await tokenInContract.allowance(userAddress, selectedDex);
                console.log('当前授权额度:', ethers.formatUnits(allowance, inDecimals), tokenInSymbol);

                if (allowance < amountInWei) {
                    setResult({
                        type: 'tx_sending',
                        data: { message: '正在授权代币...' }
                    });

                    console.log('授权额度不足，正在授权...');

                    // 授权一个较大的金额
                    const approveAmount = amountInWei * 100n;
                    console.log('授权金额:', ethers.formatUnits(approveAmount, inDecimals), tokenInSymbol);

                    // 使用传统 gas 设置，避免 EIP-1559 问题
                    const approveTx = await tokenInContract.approve(selectedDex, approveAmount, {
                        gasLimit: 100000,
                        gasPrice: ethers.parseUnits("10", "gwei") // 明确设置 gas price
                    });

                    console.log('授权交易已发送，等待确认...');
                    const approveReceipt = await approveTx.wait();
                    console.log('授权成功，交易哈希:', approveReceipt.hash);

                    // 等待授权生效
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    // 再次检查授权
                    const newAllowance = await tokenInContract.allowance(userAddress, selectedDex);
                    console.log('新授权额度:', ethers.formatUnits(newAllowance, inDecimals), tokenInSymbol);
                } else {
                    console.log('已有足够授权额度');
                }
            } catch (approveError) {
                console.error('授权过程出错:', approveError);
                throw new Error(`授权失败: ${approveError.message}`);
            }

            // 6. 执行兑换 - 先测试
            console.log('\n=== 测试交易 ===');
            try {
                // 先使用静态调用测试
                console.log('使用静态调用测试交易...');
                const staticResult = await dex.swap.staticCall(amountInWei, fromToken, amountOutMin, {
                    from: userAddress
                });
                console.log('✅ 静态调用测试成功');
                console.log('预期返回:', staticResult);
            } catch (staticError) {
                console.error('❌ 静态调用测试失败:', staticError);

                // 尝试获取更详细的错误信息
                if (staticError.data) {
                    try {
                        const iface = new ethers.Interface(SIMPLE_DEX_ABI);
                        const decodedError = iface.parseError(staticError.data);
                        console.log('解码错误:', decodedError);
                        throw new Error(`交易测试失败: ${decodedError?.name || '未知错误'}`);
                    } catch (decodeError) {
                        console.log('无法解码错误数据');
                    }
                }
                throw new Error(`交易测试失败: ${staticError.message}`);
            }

            // 7. 执行真实交易
            setResult({
                type: 'tx_sending',
                data: {
                    message: '正在执行兑换...',
                    fromToken: tokenInSymbol,
                    toToken: tokenOutSymbol,
                    amount: swapAmount,
                    dex: 'SimpleDEX'
                }
            });

            console.log('\n=== 执行真实交易 ===');
            console.log('交易参数:', {
                amountIn: amountInWei.toString(),
                fromToken,
                amountOutMin: amountOutMin.toString()
            });

            // 执行交易 - 使用传统 gas 设置
            const swapTx = await dex.swap(amountInWei, fromToken, amountOutMin, {
                gasLimit: 300000,
                gasPrice: ethers.parseUnits("10", "gwei") // 明确设置 gas price
            });

            console.log('交易已发送，哈希:', swapTx.hash);
            console.log('等待交易确认...');

            const receipt = await swapTx.wait();

            console.log('✅ 交易成功确认！');
            console.log('交易哈希:', receipt.hash);
            console.log('Gas 使用:', receipt.gasUsed?.toString());
            console.log('区块号:', receipt.blockNumber);

            // 8. 保存交易记录
            const swapRecord: SwapHistory = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                fromToken: tokenInSymbol,
                toToken: tokenOutSymbol,
                amountIn: swapAmount,
                amountOut: ethers.formatUnits(expectedOutputWei, outDecimals),
                dex: 'SimpleDEX',
                txHash: receipt.hash,
                status: 'success'
            };

            const updatedHistory = [swapRecord, ...swapHistory.slice(0, 9)];
            setSwapHistory(updatedHistory);
            localStorage.setItem('dexSwapHistory', JSON.stringify(updatedHistory));

            // 9. 显示结果
            setResult({
                type: 'tx_confirmed',
                data: {
                    message: '兑换成功！',
                    transactionHash: receipt.hash,
                    amountIn: swapAmount,
                    amountOut: ethers.formatUnits(expectedOutputWei, outDecimals),
                    dex: 'SimpleDEX',
                    gasUsed: receipt.gasUsed?.toString() || '0',
                    blockNumber: receipt.blockNumber,
                    explorerUrl: `http://localhost:8545/tx/${receipt.hash}`
                }
            });

            // 清空预览
            setPricePreview(null);

        } catch (err: any) {
            console.error('兑换失败详情:', err);

            // 错误处理
            let errorMessage = '兑换失败';

            // 检查是否是需要手动设置 gas price 的错误
            if (err.message.includes('eth_maxPriorityFeePerGas') ||
                err.message.includes('does not exist / is not available')) {
                errorMessage = '网络配置问题，请尝试重新连接钱包或联系管理员';
            } else if (err.code === 'ACTION_REJECTED') {
                errorMessage = '用户拒绝了交易';
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                errorMessage = '余额不足';
            } else if (err.code === 'CALL_EXCEPTION') {
                if (err.reason) {
                    errorMessage = `合约执行失败: ${err.reason}`;
                } else {
                    errorMessage = '合约调用失败';
                }
            } else if (err.message.includes('Internal JSON-RPC error')) {
                errorMessage = '交易执行失败，请检查：\n' +
                    '1. 交易对是否正确\n' +
                    '2. 滑点是否设置过低\n' +
                    '3. 流动性是否充足';
            } else {
                errorMessage = `兑换失败: ${err.message}`;
            }

            setError(errorMessage);

            // 保存失败记录
            const failedRecord: SwapHistory = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                fromToken: Object.keys(renderAddress).find(key => renderAddress[key] === fromToken) || 'Unknown',
                toToken: Object.keys(renderAddress).find(key => renderAddress[key] === toToken) || 'Unknown',
                amountIn: swapAmount,
                amountOut: '0',
                dex: 'SimpleDEX',
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
                                <span className="mr-3 font-medium">SimpleDEX 代币兑换</span>
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