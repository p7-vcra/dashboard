import React from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Container: React.FC<ContainerProps> = ({
    children,
    className = "",
    style = {},
}) => {
    return (
        <div
            className={twMerge(
                `
            bg-zinc-800
            bg-opacity-85
            backdrop-blur-xl
            items-center
            justify-center
            border-2
            border-zinc-600
            rounded-lg
            text-white
            p-4`,
                className,
            )}
            style={style}
        >
            {children}
        </div>
    );
};

export default Container;
