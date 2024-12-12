import React from "react";

interface ContainerSegmentProps {
    children: React.ReactNode;
    title: string;
    className?: string;
    style?: React.CSSProperties;
}

function ContainerSegment({
    children,
    title,
    className = "",
    style = {},
}: ContainerSegmentProps) {
    return (
        <div
            className={`space-y-1 flex flex-col w-full ${className}`}
            style={style}
        >
            <div className="font-bold text-zinc-300 text-xs truncate">
                {title}
            </div>
            <div className="w-full">{children}</div>
        </div>
    );
}

export default ContainerSegment;
