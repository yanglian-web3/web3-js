// EthersFunctionCard.tsx
import CyberCard from "@/src/components/ui/card/cyber-card";
import CollapseExpandIcon from "@/src/components/ethers-function/collapse-expand-icon";
import {useState, ReactNode, useEffect, useRef, useCallback} from "react";

interface Props {
    cardProps?: { [k: string]: string };
    expandClassName?: string;
    children?: (props: { expand: boolean; setExpand: (value: boolean) => void }) => ReactNode;
    showExpandIcon?: boolean;
}

// 动画展开逻辑
// 收缩时，指定一个最小max-height:80px
// 展开时，设定一个最大max-height:200vh
// 使用max-height的变化产生伸缩动画
export default function EthersFunctionCard({cardProps = {}, children, expandClassName,showExpandIcon=true}: Props) {
    const [expand, setExpand] = useState(false);
    const [expandIconPosition, setExpandIconPosition] = useState({});
    const className = cardProps.className || "";
    const cardRef = useRef<HTMLDivElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);


    /**
     * 更新容器最大高度的函数
     */
    const updateContainerMaxHeight = () => {
        if(!cardRef){
            return;
        }
        const card = cardRef.current
        if(!card){
            return;
        }
        if (!expand) {
            card.style.maxHeight = "80px"
        } else {
            // 展开状态：图标在底部
            card.style.maxHeight = "1000vh"
        }
    }
    /**
     * 更新图标位置的函数
     */
    const updateIconPosition = useCallback((height?: number) => {
        if(!cardRef || !cardRef.current){
            return;
        }
        const currentHeight = height || cardRef.current?.offsetHeight || 0;
        console.log('更新图标位置，高度:', currentHeight);
        if (!cardRef.current) return;
        const card = cardRef.current
        if (!expand) {
            // 折叠状态：图标在顶部
            setExpandIconPosition({
                top: "20px",
                right: "20px",
            });
        } else {
            // 展开状态：图标在底部
            setExpandIconPosition({
                top: `${currentHeight - 40}px`, // 距离底部 20px,图标尺寸20px
                right: "20px",
            });
        }
    }, [expand]);
    // 2. ResizeObserver 监听尺寸变化
    useEffect(() => {
        if (!cardRef || !cardRef.current) return;

        // 清理旧的 observer
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
        }
        console.log("expandClassName=", expandClassName)
        // 创建新的 ResizeObserver
        resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === cardRef.current) {
                    const newHeight = entry.contentRect.height;
                    console.log('ResizeObserver 检测到高度变化:', newHeight);
                    // 立即更新图标位置
                    updateIconPosition(newHeight);
                }
            }
        });

        // 开始监听
        resizeObserverRef.current.observe(cardRef.current);

        return () => {
            resizeObserverRef.current?.disconnect();
        };
    }, [updateIconPosition]); // 依赖 updateIconPosition

    // 3. 展开状态时更新容器最大高度
    useEffect(() => {
        updateContainerMaxHeight()
    }, [expand])
    /**
     * 切换展开状态
     */
    const handleToggle = () => {
        setExpand(!expand);
    };


    return (
        <CyberCard
            {...cardProps}
            className={className}
            ref={cardRef}
        >
            {/* 将 expand 状态作为参数传递给 children 函数 */}
            {typeof children === "function" ? children({ expand, setExpand }) : children}

            {/* 点击图标切换展开状态 */}
            { showExpandIcon ?
                <CollapseExpandIcon onClick={handleToggle}
                                    size="20px"
                                    {...expandIconPosition}
                                    className={expand ? "rotate-180" : ""}
                /> : null}
        </CyberCard>
    );
}