import React from "react";

interface ContainerSegmentProps {
    children: React.ReactNode;
    title: string;
    className?: string;
    style?: React.CSSProperties;
}

const ContainerSegment: React.FC<ContainerSegmentProps> = ({
    children,
    title,
    className = "",
    style = {},
}) => {
    return (
        <div
            className={`space-y-2 flex flex-col w-full ${className}`}
            style={style}
        >
            <div className="font-bold text-zinc-300 text-xs ">{title}</div>
            <div className="w-full">{children}</div>
        </div>
    );
};

export default ContainerSegment;
