import CyberButton from "@/src/components/ui/cyber-button";
import {ethers} from "ethers";
import {EnhancedTokenMonitor} from "./listen-events";
import EthersFunctionCard from "../ethers-function-card";


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
    return  <EthersFunctionCard cardProps={{className:"h-30"}}>
        {
            ({expand, setExpand}) => (
                <>
                    <div className="mb-2 flex justify-between items-center">
                        <span className="mr-4">监听事件</span>
                        {
                            expand ? <>
                                <CyberButton onClick={startListen}>开始监听</CyberButton>
                                <CyberButton onClick={stopListen}>停止监听</CyberButton>
                            </> : null
                        }
                    </div>
                    {
                        expand ? <>
                            <p>监听结果：{monitor.isMonitoring ? '正在监听' : '已停止监听'}</p>
                        </> : null
                    }
                </>
            )
        }
    </EthersFunctionCard>
}