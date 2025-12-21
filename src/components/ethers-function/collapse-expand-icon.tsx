import IconArrow from "@/src/components/icons/icon-arrow";


interface Props {
  className?: string
  size?: string
  top?: string
  left?: string
  right?: string
  bottom?: string,
    onClick: () => void
}

export default function CollapseExpandIcon(props: Props) {
    const { size, top, left, right, bottom, className, onClick } = props;
  return (
    <div className={`cursor-pointer transition-all duration-300 rounded-full p-1 absolute ${className}`}
         style={{
             top,
             left,
             right,
             bottom,
             border: "solid 1px transparent",
             background: `
          linear-gradient(#0a0a0f, #0a0a0f) padding-box,
          linear-gradient(135deg, #333333, #555555) border-box
        `,
         }}
         onClick={onClick}
    >
        <IconArrow width={size} height={size}/>
    </div>
  )
}