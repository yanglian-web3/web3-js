import {usePathname} from "next/navigation";
import Link from "next/link";

export default function NavLinkPc({ href, children }: { href: string; children: React.ReactNode }) {

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