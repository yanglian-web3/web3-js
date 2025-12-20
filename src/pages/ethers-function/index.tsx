import { useState } from 'react';
import CyberCard from '@/src/components/ui/card/cyber-card';
import CyberButton from '@/src/components/cyber-button';
import PageLoading from '@/src/components/page-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';
import { getEthersFunctions } from '../../lib/ethers';
import { CreateWalletInfo, EtherFunctionCardLoading } from '../../types/ethers-function';
import { useGlobalModal } from '../../components/ui/cyber-modal/global-modal';

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
    const modal = useGlobalModal();
    // 获取当前版本的函数
    const functionEvents = getEthersFunctions(ethersVersion);

    /**
     * 判断是否安装了MetaMask
     * 如果没有安装，弹出弹窗提示安装
     */
    const isMetaMaskInstalled = () => {

        return new Promise(resolve => {
            console.log('window.ethereum:', window.ethereum);
            const hasMetaMask = window.ethereum && window.ethereum.isMetaMask;
            console.log('hasMetaMask:', hasMetaMask);
            if (!hasMetaMask) {
                modal.open({
                    title: '查账metaMask失败',
                    content: "您还没有安装MetaMask,请安装MetaMask后重试",
                    size: 'sm',
                    theme: 'neon',
                    onConfirm: async () => {
                        // 确认逻辑
                    },
                });
                return
            }
            resolve(true)
        })

    }
    /**
     * 连接钱包处理
     */
    const handleConnectWallet = async () => {
        await isMetaMaskInstalled()
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
                <CyberCard contentClassName="flex justify-between items-center">
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
                </CyberCard>

                <div className="flex-1 overflow-auto space-y-2">
                    {/* 连接钱包卡片 */}
                    <CyberCard className="h-30">
                        <PageLoading loading={cardLoading.connectWallet} size="mini">
                            <div className="mb-2">
                                <span className="mr-4">ethers 连接钱包</span>
                                <CyberButton onClick={handleConnectWallet}>点击测试</CyberButton>
                            </div>
                            <p>钱包地址：{connectWalletAddress}</p>
                        </PageLoading>
                    </CyberCard>

                    {/* 创建钱包实例卡片 */}
                    <CyberCard className="h-40">
                        <PageLoading loading={cardLoading.createWallet} size="mini">
                            <div className="mb-2">
                                <span className="mr-4">ethers 创建钱包实例</span>
                                <CyberButton onClick={handleCreateWallet}>点击测试</CyberButton>
                            </div>
                            <p>钱包地址：{createWalletInfo.address}</p>
                            <p>privateKey：{createWalletInfo.privateKey}</p>
                            <p>mnemonic：{createWalletInfo.mnemonic}</p>
                        </PageLoading>
                    </CyberCard>
                </div>
            </div>
        </div>
    </>
}