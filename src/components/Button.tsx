import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className = "",
    style = {},
}) => {
    return (
        <button
            onClick={onClick}
            className={twMerge(
                "bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 active:bg-zinc-700  border-2 border-zinc-600",
                className
            )}
            style={style}
        >
            {children}
        </button>
    );
};

export default Button;
