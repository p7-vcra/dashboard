import React from "react";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
    children: React.ReactNode;
    position: "left" | "right";
    width: number;
    className?: string;
}

function Sidebar({ children, position, width, className = "" }: SidebarProps) {
    const borderClass = position === "left" ? "border-r-2" : "border-l-2";
    return (
        <aside
            className={twMerge(
                `fixed top-0 z-40 h-screen bg-zinc-800 transition-transform ${borderClass} border-zinc-600`,
                className,
            )}
            style={{
                width: `${width / 4}rem`,
                left: position === "left" ? 0 : "auto",
                right: position === "right" ? 0 : "auto",
            }}
        >
            <div className="h-full ">{children}</div>
        </aside>
    );
}

export default Sidebar;
