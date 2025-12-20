import CyberCard from "@/src/components/card/cyber-card";
import CyberButton from "@/src/components/cyber-button";
import { ethers } from 'ethers'
import {useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup} from "@/components/ui/select";
import PageLoading from "@/src/components/page-loading";

export default function EthersFunction () {

    const [connectWalletAddress, setConnectWalletAddress] = useState("") // 连接钱包得到的地址
    const [connectWalletLoading, setConnectWalletLoading] = useState(false) // 连接钱包得到的地址loading
    const [ethersVersion, setEthersVersion] = useState("6")

    /**
     * 获取ethers版本对应的函数
     * @param ethersVersion
     * @returns
     */
    const getFunctionEvents = (ethersVersion:string) => {
        const functionEvents = {
            "6": {
                connectWallet: connectWallet_v_six,
                createWallet: createWallet_v_six
            },
            "5": {
                connectWallet: connectWallet_v_five,
                createWallet: createWallet_v_five
            }
        }
        return functionEvents[ethersVersion]
    }

    /**
     * ethers版本切换
     * @param value
     */
    const ethersVersionChange = (value:string) => {
        setEthersVersion(value)
        pageReset()
    }

    /**
     * ethers版本6.16.0连接钱包
     */
    const connectWallet_v_six = async () => {
        try {
            setConnectWalletAddress("")
            setConnectWalletLoading(true)
            const provider = new ethers.BrowserProvider(window.ethereum)
            await provider.send("eth_requestAccounts", [])
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setConnectWalletAddress(address)
            console.log("连接地址:", address);
            console.log("Provider:", provider);

            setConnectWalletLoading(false)
            return provider.getSigner()
        } catch (error){
            console.log("连接钱包失败:", error);
            setConnectWalletLoading(false)
        }
    }
    /**
     * ethers版本6.16.0创建钱包实例
     */
    const createWallet_v_six = () => {
        const wallet = ethers.Wallet.createRandom()
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        }
    }

    /**
     * ethers版本5.7.2连接钱包
     */
    const connectWallet_v_five = async () => {
        try {
            setConnectWalletAddress("")
            setConnectWalletLoading(true)
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", [])
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setConnectWalletAddress(address)
            console.log("连接地址:", address);
            console.log("Provider:", provider);
            setConnectWalletLoading(false)
        } catch (error){
            console.log("连接钱包失败:", error);
            setConnectWalletLoading(false)
        }
    }
    /**
     * ethers版本5.7.2创建钱包实例
     */
    const createWallet_v_five = () => {
        const wallet = ethers.Wallet.createRandom()
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        }
    }
    /**
     * 连接钱包
     */
    const connectWallet = async () => {
        getFunctionEvents(ethersVersion).connectWallet()
    }

    /**
     * 页面重置
     */
    const pageReset = () => {
        setConnectWalletAddress("")
        setConnectWalletLoading(false)
    }

    return <div className="max-w-4xl w-full flex-1 p-4 flex flex-wrap h-space-2 m-auto">
        <div className="w-full space-y-2">
            <CyberCard contentClassName="flex justify-between items-center">
                <Select value={ethersVersion} onValueChange={ethersVersionChange}>
                    <SelectGroup>
                        <div className="flex items-center gap-4"> {/* 横向布局 */}
                            <SelectLabel className="whitespace-nowrap text-md">ethers.js版本</SelectLabel>
                            <div className="flex-1"> {/* 让下拉框占满剩余空间 */}
                                <SelectTrigger className="w-[160px] text-cyber-blue-200">
                                    <SelectValue placeholder="选择版本" />
                                </SelectTrigger>
                            </div>
                        </div>
                        <SelectContent>
                            <SelectItem value="6">6.16.0</SelectItem>
                            <SelectItem value="5">5.7.2</SelectItem>
                        </SelectContent>
                    </SelectGroup>
                </Select>
                <CyberButton onClick={pageReset}>页面重置</CyberButton>
            </CyberCard>
            <CyberCard className="h-30">
                <PageLoading loading={connectWalletLoading} size="mini">
                    <div className="mb-2">
                        <span className="mr-4">ethers 连接钱包</span>
                        <CyberButton onClick={connectWallet}>点击测试</CyberButton>
                    </div>
                    <p>钱包地址：{connectWalletAddress}</p>
                </PageLoading>
            </CyberCard>
        </div>
    </div>
}