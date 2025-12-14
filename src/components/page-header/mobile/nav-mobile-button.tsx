"use client"

import {useEffect, useState} from "react";
import MenuLine from "./menu-line";

export default function NavMobileButton() {

    const [isClient, setIsClient] = useState(false);
    const [menuIsOpen, setMenuIsOpen ] = useState(false) // 打开菜单

    useEffect(() => {
        setIsClient(true);
    }, []);



    /**
     * 切换打开关闭菜单
     */
    const toggleMenu = () => {
        setMenuIsOpen(!menuIsOpen)
    }

    // 非客户端不显示
    if (!isClient) {
        return null;
    }

    return <div className="flex md:hidden">
        <button
            onClick={toggleMenu}
            className="group relative p-1 w-8 h-8 rounded-sm font-bold transition-all duration-300 overflow-hidden cursor-pointer"
            style={{
                // 渐变边框
                background: `
                    linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                    linear-gradient(${menuIsOpen ? "-45deg" : "135deg"}, #00ff9d, #00e0ff, #ff00ff) border-box
                  `,
                border: '2px solid transparent',
                color: '#00ff9d',
            }}
        >
            {/* 光晕层 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{
                     background: 'radial-gradient(circle at center, rgba(0,255,157,0.2) 0%, transparent 70%)',
                     filter: 'blur(10px)',
                 }}
            />

            {/* 扫描线效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                 style={{
                     background: 'linear-gradient(transparent 50%, rgba(0,255,157,0.1) 50%)',
                     backgroundSize: '100% 4px',
                     animation: 'scan-line 2s linear infinite',
                 }}
            />
            <div className="flex flex-col justify-around w-full h-full">
                <MenuLine className={`${menuIsOpen ? 'opacity-0' : 'opacity-100'}`}/>
                <span className="relative h-0.5">
                    <MenuLine className={`absolute left-0 top-0 ${menuIsOpen ? 'rotate-45' : ''}`}/>
                    <MenuLine className={`absolute left-0 top-0 ${menuIsOpen ? '-rotate-45' : ''}`}/>
                </span>
                <MenuLine className={`${menuIsOpen ? 'opacity-0' : 'opacity-100'}`}/>
            </div>
        </button>
    </div>


}