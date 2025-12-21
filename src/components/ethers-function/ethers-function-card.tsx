// EthersFunctionCard.tsx
import CyberCard from "@/src/components/ui/card/cyber-card";
import CollapseExpandIcon from "@/src/components/ethers-function/collapse-expand-icon";
import {useState, ReactNode, useEffect, useRef} from "react";

interface Props {
    cardProps?: { [k: string]: string };
    expandClassName?: string;
    children?: (props: { expand: boolean; setExpand: (value: boolean) => void }) => ReactNode;
    showExpandIcon?: boolean;
}

export default function EthersFunctionCard({cardProps = {}, children, expandClassName,showExpandIcon=true}: Props) {
    const [expand, setExpand] = useState(false);
    const [expandIconPosition, setExpandIconPosition] = useState({});
    const cardMinHeightClassName = "h-18";
    const className = cardProps.className || "";
    const cardRef = useRef<HTMLDivElement>(null);
    /**
     * 切换展开状态
     */
    const handleToggle = () => {
        setExpand(!expand);
    };

    /**
     * 获取展开图标的位置
     */
    const getExpandIconPosition = () => {
        if(expand){
            return {
                bottom: "20px",
                right: "20px",

            }
        }else{
            return {
                top: "20px",
                right: "20px",
            }
        }
    }

    useEffect(() => {
      if(!expand){
          setExpandIconPosition({
              top: "20px",
              right: "20px",
          })
          return
      }
      console.log("cardRef=", cardRef)
    }, [ expand])

    return (
        <CyberCard
            {...cardProps}
            className={`${className} ${(expand || !showExpandIcon) ? expandClassName : cardMinHeightClassName}`}
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