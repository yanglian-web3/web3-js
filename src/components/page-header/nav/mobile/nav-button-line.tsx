export default function NavButtonLine({className}:{className?: string }) {

    return <span className={`h-0.5 w-full transition-all duration-300 ${className}`} style={{
        // 渐变边框
        background: `linear-gradient(-90deg, #00ff9d, #9d00ff)`,
    }}/>
}