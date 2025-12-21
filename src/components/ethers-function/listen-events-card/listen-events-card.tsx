import CyberCard from "@/src/components/ui/card/cyber-card";
import CyberButton from "@/src/components/ui/cyber-button";
import {ethers} from "ethers";
import {EnhancedTokenMonitor} from "./listen-events";


export default function ListenEventsCard() {
    const monitor = new EnhancedTokenMonitor(
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        ethers.getDefaultProvider('mainnet'),
        {
            minAmount: '1000', // 只监听大于1000USDT的交易
            onTransfer: (event) => {
                // 保存到数据库或发送通知
            }
        }
    )

    /**
     * 开始监听
     */
    const startListen = () => {
        monitor.start()
    }
    /**
     * 停止监听
     */
    const stopListen = () => {
        monitor.stop()
    }
    return  <CyberCard className="h-30">
            <div className="mb-2 flex justify-between items-center">
                <span className="mr-4">监听链上事件</span>
                <CyberButton onClick={startListen}>开始监听</CyberButton>
            </div>
    </CyberCard>
}