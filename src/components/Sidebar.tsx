import React from "react";

interface SidebarProps {
    children: React.ReactNode;
    position: "left" | "right";
    width: number;
}

function Sidebar({ children, position, width }: SidebarProps) {
    const borderClass = position === "left" ? "border-r-2" : "border-l-2";
    return (
        <aside
            className={`fixed top-0 z-40  h-screen transition-transform ${borderClass} border-zinc-600`}
            style={{
                width: `${width / 4}rem`,
                left: position === "left" ? 0 : "auto",
                right: position === "right" ? 0 : "auto",
            }}
        >
            <div className="h-full  bg-zinc-800">{children}</div>
        </aside>
    );
}

export default Sidebar;
