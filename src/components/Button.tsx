import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    [key: string]: any;
}

function Button({ children, onClick, className = "", style = {}, disabled, ...props }: ButtonProps) {
    disabled = disabled || false;
    return (
        <button
            onClick={onClick}
            className={twMerge(
                "bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 active:bg-zinc-700  border-2 border-zinc-600",
                className,
                disabled && "opacity-50 cursor-not-allowed hover:bg-zinc-700",
            )}
            disabled={disabled}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
