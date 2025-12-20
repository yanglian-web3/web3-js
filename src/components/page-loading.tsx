import React from "react";

export type LoadingSize = 'mini' | 'small' | "middle" | 'large'
interface SizeConfig {
    outCircle: string
    innerCircle: string
    content: string
    subContent: string
}
interface Props {
    content?: string
    subContent?: string
    children?: React.ReactNode
    loading?: boolean
    size?: LoadingSize
}

export default function PageLoading({content="loading...", subContent, children, loading, size} : Props) {

    const defaultSize:SizeConfig = {
        outCircle: "w-16 h-16",
        innerCircle: "w-8 h-8",
        content: "text-lg mt-6",
        subContent: "text-sm"
    }

    /**
     * 获取loading尺寸
     * @param size
     */
    const getLoadingSizeClassName = (size: LoadingSize): SizeConfig => {
        switch (size) {
            case 'mini':
                return {
                    outCircle: "w-8 h-8",
                    innerCircle: "w-4 h-4",
                    content: "text-sm mt-2",
                    subContent: "text-xs"
                }
            case 'small':
                return {
                    outCircle: "w-12 h-12",
                    innerCircle: "w-6 h-6",
                    content: "text-md mt-4",
                    subContent: "text-xs"
                }
            case 'middle':
                return defaultSize
            case 'large':
                return {
                    outCircle: "w-20 h-20",
                    innerCircle: "w-10 h-10",
                    content: "text-lg mt-8",
                    subContent: "text-sm"
                }
            default:
                return defaultSize
        }
    }

    const renderSizeConfig = getLoadingSizeClassName(size || "middle")
    return <div className="relative w-full h-full">
        {
            loading ? <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="relative">
                    <div className={`${renderSizeConfig.outCircle} border-4 border-cyber-neon-400/30 border-t-cyber-neon-400 rounded-full animate-spin`}/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${renderSizeConfig.innerCircle} bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 rounded-full animate-pulse`}/>
                    </div>
                </div>
                <p className={`text-cyber-neon-400 ${renderSizeConfig.content}`}>{content}</p>
                <p className={`text-cyber-neon-400/70 ${renderSizeConfig.subContent} mt-2`}>{subContent}</p>
            </div> : <div className="w-full h-full">
                { children }
            </div>
        }

    </div>
}