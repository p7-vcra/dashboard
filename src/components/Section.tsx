import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ContainerTitle from "./SectionTitle";

interface SectionProps {
    children: React.ReactNode;
    title?: string;
    bottom?: boolean;
    collapseble?: boolean;
    initialCollapsed?: boolean;
    className?: string;
}

function Section({
    children,
    title,
    // @ts-ignore - varible is checked by Sections.tsx
    bottom = false,
    collapseble,
    initialCollapsed = true,
    className = "",
}: SectionProps) {
    if (children === null) {
        return null;
    }

    const [collapsed, setCollapsed] = React.useState(initialCollapsed);

    return (
        <li className={`w-full ${className}`}>
            {title && (
                <div className="flex justify-between items-center text-white">
                    {collapseble ? (
                        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex p-3">
                            <ContainerTitle>{title}</ContainerTitle>
                            <FontAwesomeIcon
                                icon={faCaretDown}
                                className={`transform transition-transform duration-200 ${
                                    collapsed ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    ) : (
                        <ContainerTitle className="p-3">{title}</ContainerTitle>
                    )}
                </div>
            )}
            {title ? (
                <div
                    className={`max-height-transition duration-200 ease-out overflow-hidden ${
                        collapsed ? "max-h-0" : "max-h-screen"
                    }`}
                >
                    <div className="px-3 pb-3">{children}</div>
                </div>
            ) : (
                <div className="p-3">{children}</div>
            )}
        </li>
    );
}

export default Section;
