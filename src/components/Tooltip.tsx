import React from "react";
import { twMerge } from "tailwind-merge";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: "top" | "right" | "bottom" | "left";
    className?: string;
}

function Tooltip({ children, content, position = "top", className = "" }: TooltipProps) {
    return (
        <div className="relative group">
            {children}
            <div
                className={twMerge(
                    `absolute text-sm cursor-pointer hidden group-hover:block w-max bg-zinc-900 text-white rounded-lg border-1 border-zinc-600 px-2 py-1 ${
                        position === "top"
                            ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
                            : position === "right"
                              ? "left-full ml-2 top-1/2 -translate-y-1/2"
                              : position === "bottom"
                                ? "top-full mt-2 left-1/2 -translate-x-1/2"
                                : "right-full mr-2 top-1/2 -translate-y-1/2"
                    }`,
                    className,
                )}
            >
                {content}
            </div>
        </div>
    );
}

export default Tooltip;
