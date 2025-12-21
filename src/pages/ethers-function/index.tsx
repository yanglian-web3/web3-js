import { useState } from 'react';
import CyberCard from '@/src/components/ui/card/cyber-card';
import CyberButton from '@/src/components/ui/cyber-button';
import PageLoading from '@/src/components/page-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';
import { getEthersFunctions } from '../../lib/ethers';
import { CreateWalletInfo, EtherFunctionCardLoading } from '../../types/ethers-function';
import TokenTransferCard from "@/src/components/ethers-function/token-transfer-card";
import {isMetaMaskInstalled} from "@/src/utils/ethers-function";
import ListenEventsCard from "@/src/components/ethers-function/listen-events-card/listen-events-card";
import CollapseExpandIcon from "@/src/components/ethers-function/collapse-expand-icon";
import EthersFunctionCard from "@/src/components/ethers-function/ethers-function-card";

const loadingDefault: EtherFunctionCardLoading = {
    connectWallet: false,
    createWallet: false,
};

export default function EthersFunction() {
    const [connectWalletAddress, setConnectWalletAddress] = useState('');
    const [cardLoading, setCardLoading] = useState<EtherFunctionCardLoading>({ ...loadingDefault });
    const [ethersVersion, setEthersVersion] = useState('6');
    const [createWalletInfo, setCreateWalletInfo] = useState<CreateWalletInfo>({
        address: '',
        privateKey: '',
        mnemonic: '',
        walletInstance: null,
    });


    /**
     * 连接钱包处理
     */
    const handleConnectWallet = async () => {
        await isMetaMaskInstalled()
        // 获取当前版本的函数
        const functionEvents = getEthersFunctions(ethersVersion);
        try {
            setConnectWalletAddress('');
            setCardLoading({ ...loadingDefault, connectWallet: true });

            const signer = await functionEvents.connectWallet();
            const address = await signer.getAddress();
            setConnectWalletAddress(address);
        } catch (error) {
            console.error('连接钱包失败:', error);
        } finally {
            setCardLoading({ ...loadingDefault });
        }
    };

    /**
     * 创建钱包处理
     */
    const handleCreateWallet = async () => {
        await isMetaMaskInstalled()
        // 获取当前版本的函数
        const functionEvents = getEthersFunctions(ethersVersion);
        try {
            const walletInfo = functionEvents.createWallet();
            setCreateWalletInfo(walletInfo);
            console.log('创建的钱包:', walletInfo);
        } catch (error) {
            console.error('创建钱包失败:', error);
        }
    };


    /**
     * ethers版本切换
     */
    const ethersVersionChange = (value: string) => {
        setEthersVersion(value);
        pageReset();
    };

    /**
     * 页面重置
     */
    const pageReset = () => {
        setConnectWalletAddress('');
        setCardLoading({ ...loadingDefault });
        setCreateWalletInfo({
            address: '',
            privateKey: '',
            mnemonic: '',
            walletInstance: null,
        });
    };

    return <>
        <div className="max-w-4xl w-full flex-1 p-4 flex flex-wrap m-auto">
            <div className="w-full flex flex-col space-y-2">
                {/* 头部版本下拉框和重置按钮 */}
                <EthersFunctionCard cardProps={{contentClassName: "flex justify-between items-center"}} showExpandIcon={false}>
                    <Select value={ethersVersion} onValueChange={ethersVersionChange}>
                        <SelectGroup>
                            <div className="flex items-center gap-4">
                                <SelectLabel className="whitespace-nowrap text-md">
                                    ethers.js版本
                                </SelectLabel>
                                <div className="flex-1">
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
                </EthersFunctionCard>
                <div className="flex-1 overflow-auto space-y-2">
                    {/* 连接钱包卡片 */}
                    <EthersFunctionCard cardProps={{ className: "h-30" }}>
                        {({ expand }) => (
                            <PageLoading loading={cardLoading.connectWallet} size="mini">
                                <div className="mb-2 flex justify-between items-center">
                                    <span className="mr-4">连接钱包</span>
                                    {expand ? <CyberButton onClick={handleConnectWallet}>点击连接</CyberButton> : null}
                                </div>
                                {expand ? <p>钱包地址：{connectWalletAddress}</p> : null}
                            </PageLoading>
                        )}
                    </EthersFunctionCard>

                    {/* 创建钱包实例卡片 */}
                    <EthersFunctionCard  cardProps={{className: "h-40"}}>
                        {
                            ({ expand }) => (
                                <PageLoading loading={cardLoading.createWallet} size="mini">
                                    <div className="mb-2 flex justify-between items-center">
                                        <span className="mr-4">创建钱包实例</span>
                                        { expand ? <CyberButton onClick={handleCreateWallet}>点击创建</CyberButton> : null}
                                    </div>
                                    {
                                        expand ? <>
                                            <p>钱包地址：{createWalletInfo.address}</p>
                                            <p>privateKey：{createWalletInfo.privateKey}</p>
                                            <p>mnemonic：{createWalletInfo.mnemonic}</p>
                                        </> : null
                                    }
                                </PageLoading>
                            )
                        }
                    </EthersFunctionCard>
                    {/* 代币转账卡片 */}
                    <TokenTransferCard ethersVersion={ethersVersion}/>
                    {/*监听链上事件卡片*/}
                    <ListenEventsCard/>
                </div>
            </div>
        </div>
    </>
}