"use client"

import CyberGradientConnectButton from "../cyber-gradient-connect-button";
import NavPc from "./nav/nav-pc";
import IconLogo from "../icons/icon-logo";
import NavMobile from "./nav/mobile/nav-mobile";
/**
 * 应用程序头部导航组件
 */
export default function PageHeader() {
    return <>
        <header className="sticky top-0 z-50 mx-auto flex justify-between items-center w-full py-4 px-4 md:px-6 backdrop-blur-xl bg-cyber-dark-400/90 border-b border-cyber-neon/20">
            <div className="w-full mx-auto flex justify-between items-center">
                <div className="flex items-center gap-0 md:gap-2">
                    {/* Logo 区域 */}
                    <div className="mr-0 md:mr-8 flex items-center gap-3">
                        <IconLogo className="hidden md:block w-10 h-10"/>
                        <div className="hidden md:block text-xl font-bold bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 bg-clip-text text-transparent">
                            W3Wallet
                        </div>
                    </div>
                    {/* PC 端导航 */}
                    <NavPc/>

                </div>
                <div className="relative flex justify-center items-center z-10">
                    {/* RainbowKit 连接按钮容器 */}
                    <CyberGradientConnectButton />
                    {/* 移动端导航 */}
                    <div className="ml-4">
                        <NavMobile/>
                    </div>
                </div>
            </div>
        </header>
    </>
}