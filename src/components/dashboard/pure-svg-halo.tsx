"use client"

import {useEffect, useState} from 'react';

export default function PureSVGHalo() {
    const [isClient, setIsClient] = useState(false);
    const [screenSize, setScreenSize] = useState({ width: 1000, height: 1000 });

    useEffect(() => {
        setIsClient(true);

        // 获取屏幕尺寸
        const updateScreenSize = () => {
            // 计算对角线长度（确保覆盖整个屏幕）
            const diagonal = Math.sqrt(
                window.innerWidth * window.innerWidth +
                window.innerHeight * window.innerHeight
            );
            // 放大一些确保完全覆盖
            const maxRadius = diagonal * 1.5;
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
                maxRadius: Math.ceil(maxRadius)
            });
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);

        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    useEffect(() => {
        // 确保 SVG 滤镜正常工作
        console.log('SVG Halo mounted');
        console.log('Screen size:', screenSize);

        // 调试：检查元素是否渲染
        const checkRender = () => {
            const svg = document.querySelector('svg');
            const circles = svg?.querySelectorAll('circle');
            console.log('SVG exists:', !!svg);
            console.log('Circles:', circles?.length || 0);
        };

        setTimeout(checkRender, 100);
    }, [screenSize]);

    if (!isClient) {
        return null;
    }

    // 计算 viewBox 基于屏幕尺寸
    const viewBoxWidth = Math.max(screenSize.width, 1000);
    const viewBoxHeight = Math.max(screenSize.height, 1000);
    const coreHoloSize = viewBoxWidth * 0.18
    const outHoloSize = coreHoloSize + 30
    const innerHoloSize = coreHoloSize - 50
    const centerX = viewBoxWidth - viewBoxWidth * .2 - coreHoloSize/2;
    const centerY = viewBoxHeight - viewBoxHeight * .2

    // 计算最大半径（覆盖整个屏幕）
    const maxRadius = screenSize.maxRadius ||
        Math.sqrt(viewBoxWidth * viewBoxWidth + viewBoxHeight * viewBoxHeight) * 1.2;

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid slice"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 0,
                // 调试用
                // outline: '1px solid rgba(255,0,0,0.3)'
            }}
        >
            <defs>
                {/* 霓虹渐变 */}
                <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff9d" />
                    <stop offset="50%" stopColor="#00e0ff" />
                    <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>

                {/* 简化版滤镜 */}
                <filter
                    id="cyber-glow"
                    width="300%"
                    height="300%"
                    x="-100%"
                    y="-100%"
                    filterUnits="userSpaceOnUse"
                >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="80" result="blur" />
                    <feComponentTransfer in="blur" result="soft-blur">
                        <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feBlend in="SourceGraphic" in2="soft-blur" mode="screen" />
                </filter>

                {/* 备用简单滤镜 */}
                <filter id="simple-glow">
                    <feGaussianBlur stdDeviation="50" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                </filter>
            </defs>

            {/* 主光晕 */}
            <g>
                {/* 核心光晕 */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={coreHoloSize}
                    fill="url(#neon-gradient)"
                    filter="url(#cyber-glow)"
                    opacity="0.4"
                />

                {/* 外层光晕 - 扩散至全屏 */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={outHoloSize}
                    fill="none"
                    stroke="url(#neon-gradient)"
                    strokeWidth="2"
                    opacity="0.1"
                >
                    <animate
                        attributeName="r"
                        from="380"
                        to={maxRadius}
                        dur="8s"
                        repeatCount="indefinite"
                        keyTimes="0;0.3;1"
                        keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                        values={`380;${maxRadius * 0.3};${maxRadius}`}
                    />
                    <animate
                        attributeName="opacity"
                        values="0.1;0.15;0"
                        keyTimes="0;0.3;1"
                        dur="8s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* 内层光晕 */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerHoloSize}
                    fill="none"
                    stroke="url(#neon-gradient)"
                    strokeWidth="1"
                    opacity="0.15"
                    strokeDasharray="5,5"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="20"
                        dur="4s"
                        repeatCount="indefinite"
                    />
                </circle>
            </g>

            {/* 大光点 */}
            {[...Array(5)].map((_, i) => (
                <circle
                    key={i}
                    cx={centerX + Math.cos((i * 72) * Math.PI / 180) * (coreHoloSize - 30)}
                    cy={centerY + Math.sin((i * 72) * Math.PI / 180) * (coreHoloSize - 30)}
                    r="10"
                    fill="url(#neon-gradient)"
                    opacity="0.3"
                >
                    <animate
                        attributeName="r"
                        values="8;12;8"
                        dur={`${2 + i * 0.5}s`}
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.2;0.4;0.2"
                        dur={`${3 + i * 0.3}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}

            {/* 扫描线效果 */}
            <line
                x1="0"
                y1="0"
                x2={viewBoxWidth}
                y2="0"
                stroke="url(#neon-gradient)"
                strokeWidth="1"
                opacity="0.05"
            >
                <animate
                    attributeName="y1"
                    from="0"
                    to={viewBoxHeight}
                    dur="15s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="y2"
                    from="0"
                    to={viewBoxHeight}
                    dur="15s"
                    repeatCount="indefinite"
                />
            </line>
        </svg>
    );
}