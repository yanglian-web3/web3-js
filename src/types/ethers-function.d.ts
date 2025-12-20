import {HDNodeWallet, Mnemonic} from "ethers";


export interface CreateWalletInfo{
    address: string,
    privateKey: string,
    mnemonic: string | Mnemonic | null,
    walletInstance: HDNodeWallet | null
}

export interface EtherFunctionCardLoading {
    connectWallet: boolean,
    createWallet: boolean
}