import {GlobalModalManager} from "@/src/components/ui/cyber-modal/global-modal";


/**
 * 判断是否安装了MetaMask
 * 如果没有安装，弹出弹窗提示安装
 */

export const isMetaMaskInstalled = () => {

    return new Promise(resolve => {
        console.log('window.ethereum:', window.ethereum);
        const hasMetaMask = window.ethereum && window.ethereum.isMetaMask;
        console.log('hasMetaMask:', hasMetaMask);
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