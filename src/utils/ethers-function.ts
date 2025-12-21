import { GlobalModalManager } from "@/src/components/ui/cyber-modal/global-modal";

/**
 * 判断是否安装了MetaMask
 * 如果没有安装，弹出弹窗提示安装
 */

export const isMetaMaskInstalled = () => {

    return new Promise(resolve => {
        // console.log('window.ethereum:', window.ethereum);
        const hasMetaMask = window.ethereum && window.ethereum.isMetaMask;
        // console.log('hasMetaMask:', hasMetaMask);
        if (!hasMetaMask) {
            GlobalModalManager.open({
                title: '查账metaMask失败',
                content: "您还没有安装MetaMask,请安装MetaMask后重试",
                showCancelButton: false,
                confirmText: '知道了',
                size: 'sm',
                theme: 'neon'
            });
            return
        }
        resolve(true)
    })

}

/**
 * 获取Sepolia测试网已验证且可操作的ERC20合约地址列表
 * 这些是公开、常用的测试代币，通常部署者会预置余额或提供水龙头，适合测试。
 */
export const sepoliaVerifiedTokenAddresses = {
    // Sepolia上的Wrapped Ether (WETH)，是许多DEX的基础[citation:5]
    'WETH': '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    // Sepolia上的USDC测试代币，Circle官方提供水龙头[citation:5]
    'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379c7238',
    // 一个通用的测试ERC20代币示例，常用于开发教程[citation:9]
    'TEST_ERC20': '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    // 你的MetaNode Token合约（如果已部署并已验证）
    'META_NODE': '0xCC2B75Acee22512ff1Fddf440877417370D0eCA4',
}
/**
 * 本地部署代币合约账户地址
 */
export const localHardatTokenAddresses = {
    'MNT': '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    'USDC': '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    'DAI': '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    'LINK': '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
}

/**
 * 统一的主函数：获取指定网络的测试合约或账户地址
 * @param {number} chainId - 网络链ID
 * @returns {Promise<Array<string> | Object<string, string>>} 返回地址数组或代币映射对象
 */
export const getHardhatAddresses = async (chainId):Promise<{[key: string]: string }> => {
    // 1. 检查MetaMask是否安装（用于后续钱包连接场景）
    await isMetaMaskInstalled();

    if (![31337, 11155111].includes(chainId)) {
        GlobalModalManager.open({
            title: '请求合约地址失败',
            content: "请求合约地址失败，不支持该网络",
            showCancelButton: false,
            confirmText: '知道了',
            size: 'sm',
            theme: 'neon'
        });
        return chainId === 31337 ? [] : {};
    }

    // 3. 根据网络类型采用不同策略获取地址
    switch (chainId) {
        case 31337: { // Hardhat 本地网络
            return localHardatTokenAddresses
        }
        case 11155111: { // Sepolia 测试网络
            // Sepolia作为公共测试网，无法通过RPC直接获取用户账户列表[citation:1]。
            // 返回已验证的、可公开操作的测试代币合约地址对象。
            return sepoliaVerifiedTokenAddresses; // 返回代币名称到地址的映射
        }
        default: {
            // 其他网络暂不支持获取测试地址
            console.warn(`不支持的链ID: ${chainId}，无法获取测试地址。`);
            return {};
        }
    }
};