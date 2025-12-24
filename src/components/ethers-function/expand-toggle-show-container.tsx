

interface ExpandToggleShowContainerProps {
    expand: boolean,
    children: React.ReactNode,
    className?: string
}


export default function ExpandToggleShowContainer({expand, children, className}: ExpandToggleShowContainerProps) {

    return <div className={`transition-all duration-300 ${expand ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className || ""}`}>
        {children}
    </div>
}