import {HDNodeWallet, Mnemonic} from "ethers";
import { Wallet as V5Wallet } from 'ethers-v5';

export interface CreateWalletInfo{
    address: string,
    privateKey: string,
    mnemonic: string | Mnemonic | null,
    walletInstance: HDNodeWallet | V5Wallet | null
}

export interface EtherFunctionCardLoading {
    connectWallet: boolean,
    createWallet: boolean
}
export interface TokenTransferParams {
    contractAddress: string,
    to: string,
    amount: string,
    ERC20_ABI: any[],
    decimals?: number
}
export interface WalletFunctions {
    connectWallet: () => Promise<any>;
    createWallet: () => CreateWalletInfo;
    tokenTransfer: (params:TokenTransferParams) => Promise<any>;
    getTokenInfo: (contractAddress: string, ERC20_ABI: any[]) => Promise<{
        name: string,
        symbol: string,
        decimals: number,
        totalSupply: string
    }>;
}