import CyberButton from "@/src/components/ui/cyber-button";
import {ethers} from "ethers";
import {EnhancedTokenMonitor} from "./listen-events";
import EthersFunctionCard from "../ethers-function-card";
import ExpandToggleShowContainer from "@/src/components/ethers-function/expand-toggle-show-container";
import {useSelector} from "react-redux";
import {RootState} from "@/src/store";
import {useEffect, useState} from "react";


export default function ListenEventsCard() {

    const { contractAddress } = useSelector((state: RootState) => state.ethersFunction)
    const [monitor, setMonitor] = useState<EnhancedTokenMonitor>()

    useEffect(() => {
        // console.log("contractAddress=",contractAddress)
        // if(!contractAddress){
        //     return
        // }
        // const monitorValue = new EnhancedTokenMonitor(
        //     contractAddress, // USDT
        //     ethers.getDefaultProvider('mainnet'),
        //     {
        //         minAmount: '1000', // 只监听大于1000USDT的交易
        //         onTransfer: (event) => {
        //             // 保存到数据库或发送通知
        //             console.log("页面监听结果 event=", event)
        //         }
        //     }
        // )
        // setMonitor(monitorValue)
    }, [contractAddress])

    /**
     * 开始监听
     */
    const startListen = () => {
        console.log("status=", monitor?.getStatus())
        console.log("status=", monitor?.isMonitoring)
        monitor?.start()
    }
    /**
     * 停止监听
     */
    const stopListen = () => {
        monitor?.stop()
    }
    return  <EthersFunctionCard cardProps={{className:"h-30"}}>
        {
            ({expand, setExpand}) => (
                <>
                    <div className="mb-2 flex justify-between items-center">
                        <span className="mr-4">监听事件</span>
                        <ExpandToggleShowContainer expand={expand} className="space-x-2">
                            <CyberButton onClick={startListen}>开始监听</CyberButton>
                            <CyberButton onClick={stopListen}>停止监听</CyberButton>
                        </ExpandToggleShowContainer>
                    </div>
                    {
                        monitor ? <>
                            <ExpandToggleShowContainer expand={expand}>
                                <p>监听结果：{monitor.isMonitoring ? '正在监听' : '已停止监听'}</p>
                            </ExpandToggleShowContainer>
                            <p className="mt-2">合约代币地址：{contractAddress}</p>
                        </> : null
                    }
                </>
            )
        }
    </EthersFunctionCard>
}