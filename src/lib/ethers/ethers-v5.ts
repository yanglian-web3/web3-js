// src/lib/ethers/ethers-v5.ts
import { ethers } from 'ethers-v5';
import {CreateWalletInfo, TokenTransferParams, WalletFunctions} from "@/src/types/ethers-function";

declare global {
    interface Window {
        ethereum?: any;
    }
}

/**
 * v5 连接钱包
 */
export const connectWallet_v_five = async (): Promise<any> => {
    if (!window.ethereum) {
        throw new Error('请安装 MetaMask!');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    console.log('连接地址:', await signer.getAddress());
    console.log('Provider:', provider);

    return signer;
};

/**
 * v5 创建钱包
 */
export const createWallet_v_five = (): CreateWalletInfo => {
    const wallet = ethers.Wallet.createRandom();

    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        walletInstance: wallet,
    };
};

/**
 * v5 版本代币转账
 */
export const tokenTransfer_v5 = async (params: TokenTransferParams) => {
    const {
        contractAddress,
        to,
        amount,
        ERC20_ABI,
        decimals = 18
    } = params

    // 1. 创建 Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // 2. 获取 Signer（v5 是同步）
    const signer = provider.getSigner()

    // 3. 创建合约实例
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer)

    // 4. 解析金额（v5 通过 utils）
    const parsedAmount = ethers.utils.parseUnits(amount, decimals)

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
 * v5 获取代币信息
 */
export const getTokenInfo_v5 = async (contractAddress: string, ERC20_ABI: any[]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
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
 * 获取 v5 所有函数
 */
export const getV5Functions = (): WalletFunctions => ({
    connectWallet: connectWallet_v_five,
    createWallet: createWallet_v_five,
    tokenTransfer: tokenTransfer_v5,
    getTokenInfo: getTokenInfo_v5
});