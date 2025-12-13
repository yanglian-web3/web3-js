import {IconProp} from "../../types/icon";

export default function IconLogo(prop : IconProp) {

    return <svg  className={prop.className} width={prop.width} height={prop.height} viewBox="0 0 40 40">
        <defs>
            <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff9d" />
                <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>

            {/* 添加发光效果 */}
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* 方法1：使用 stroke 直接创建边框（2px宽） */}
        <circle
            cx="20"
            cy="20"
            r="18.5"
            fill="none"
            stroke="url(#border-gradient)"
            strokeWidth="3"
        />

        {/* 内部深色背景 */}
        <circle cx="20" cy="20" r="17.5" fill="#0a0a0f" />

        {/* 文字 */}
        <text
            x="20"
            y="25"
            textAnchor="middle"
            fill="#00ff9d"
            fontSize="16"
            fontFamily="system-ui, sans-serif"
            fontWeight="700"
            filter="url(#logo-glow)"
        >
            W3
        </text>
    </svg>
}