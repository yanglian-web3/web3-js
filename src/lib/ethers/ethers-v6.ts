// src/lib/ethers/ethers-v6.ts
import { ethers, Wallet, BrowserProvider, JsonRpcSigner } from 'ethers';
import {CreateWalletInfo, TokenTransferParams, WalletFunctions} from "@/src/types/ethers-function";

/**
 * v6 连接钱包
 */
export const connectWallet_v_six = async (): Promise<JsonRpcSigner> => {
    if (!window.ethereum) {
        throw new Error('请安装 MetaMask!');
    }

    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    console.log('连接地址:', await signer.getAddress());
    console.log('Provider:', provider);

    return signer;
};

/**
 * v6 创建钱包
 */
export const createWallet_v_six = (): CreateWalletInfo => {
    const wallet = Wallet.createRandom();
    const mnemonic = wallet.mnemonic?.phrase || wallet.mnemonic || '';

    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        walletInstance: wallet,
    };
};

/**
 * v6 版本代币转账
 */
export const tokenTransfer_v6 = async (params: TokenTransferParams) => {
    const {
        contractAddress,
        to,
        amount,
        ERC20_ABI,
        decimals = 18
    } = params

    // 1. 创建 Provider
    const provider = new ethers.BrowserProvider(window.ethereum)

    // 2. 获取 Signer（注意：v6 是异步）
    const signer = await provider.getSigner()

    // 3. 创建合约实例
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer)

    // 4. 解析金额（v6 去掉 utils）
    const parsedAmount = ethers.parseUnits(amount, decimals)

    console.log('发送转账交易...', {
        contractAddress,
        to,
        amount: amount,
        parsedAmount: parsedAmount.toString(),
        decimals
    })

    // 5. 发送转账交易
    const tx = await contract.transfer(to, parsedAmount)

    console.log('交易已发送，等待确认...', {
        hash: tx.hash,
        from: await signer.getAddress(),
        to
    })

    // 6. 等待交易确认
    const receipt = await tx.wait()

    console.log('交易已确认', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations
    })

    return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations
    }
}

/**
 * v6 获取代币信息
 */
export const getTokenInfo_v6 = async (contractAddress: string, ERC20_ABI: any[]) => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider)

    const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
    ])

    return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString()
    }
}

/**
 * 获取 v6 所有函数
 */
export const getV6Functions = (): WalletFunctions => ({
    connectWallet: connectWallet_v_six,
    createWallet: createWallet_v_six,
    tokenTransfer: tokenTransfer_v6,
    getTokenInfo: getTokenInfo_v6
});