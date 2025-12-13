"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CyberGradientConnectButton from "./cyber-gradient-connect-button";

/**
 * tab 切换项 - 高对比度版
 */
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`relative px-4 py-3 font-medium rounded-lg transition-all duration-300 group overflow-hidden`}
        >
            {/* 基础文字 - 始终可见的白色/灰色 */}
            <span className={`relative z-10 ${isActive ? 'text-cyber-neon-400' : 'text-gray-300 hover:text-white'}`}>
        {children}
      </span>

            {/* 激活状态的光晕背景 */}
            {isActive && (
                <>
                    {/*背景*/}
                    <span className="absolute inset-0 bg-gradient-to-r from-cyber-neon-400/10 via-cyber-blue-400/5 to-cyber-pink-400/10 rounded-lg" />
                    {/*边框*/}
                    <span className="absolute inset-0 border border-cyber-neon-400/30 rounded-lg" />
                </>
            )}

            {/* 悬停时的背景光晕 */}
            <span className={`absolute inset-0 bg-gradient-to-r from-cyber-neon-400/5 via-cyber-blue-400/3 to-cyber-pink-400/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`} />

            {/* 霓虹下划线 - 始终显示激活状态，悬停时更亮 */}
            <span
                className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 transition-all duration-300 ${isActive ? 'w-full opacity-100 animate-neon-pulse' : 'w-0 opacity-50 group-hover:w-full group-hover:opacity-100'}`}
            />
        </Link>
    );
}

/**
 * 应用程序头部导航组件
 */
export default function PageHeader() {
    return <>
        <header className="sticky top-0 z-50 mx-auto flex justify-between items-center w-full py-4 px-6 backdrop-blur-xl bg-cyber-dark-400/90 border-b border-cyber-neon/20">
            {/* 头部背景光晕 */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyber-neon-400/5 via-transparent to-transparent -z-10" />
            <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {/* Logo 区域 */}
                    <div className="mr-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-neon-400 to-cyber-pink-400 p-0.5">
                            <div className="w-full h-full rounded-full bg-cyber-dark-400 flex items-center justify-center">
                                <span className="text-cyber-neon-400 font-bold text-lg">W3</span>
                            </div>
                        </div>
                        <div className="text-xl font-bold bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 bg-clip-text text-transparent">
                            W3Wallet
                        </div>
                    </div>
                    <nav className="flex items-center gap-1">
                        <NavLink href="/">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Dashboard
          </span>
                        </NavLink>
                        <NavLink href="/stake">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
            </svg>
            Stake
          </span>
                        </NavLink>
                    </nav>
                </div>
                {/* RainbowKit 连接按钮容器 */}
                <div className="relative">
                    <div className="relative z-10">
                        <CyberGradientConnectButton />
                    </div>
                    {/* 按钮背景光晕 */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyber-neon-400/20 to-cyber-pink-400/20 blur-xl rounded-2xl opacity-0 hover:opacity-50 transition-opacity duration-300 -z-10" />
                </div>
            </div>
        </header>
    </>
}