import React from "react";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
    return (
        <div
            className={twMerge(
                "bg-zinc-700 border-zinc-500 border-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center aspect-square",
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Badge;
