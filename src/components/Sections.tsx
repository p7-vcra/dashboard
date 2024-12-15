import React from "react";

interface SectionsProps {
    children: React.ReactNode;
}

function Sections({ children }: SectionsProps) {
    let bottomAssigned = false;

    return (
        <ul className="w-full h-full flex flex-col">
            {React.Children.map(children, (child, index) => {
                const childElement = child as React.ReactElement<any>;
                const isBottom = childElement.props.bottom && !bottomAssigned;

                if (isBottom) {
                    bottomAssigned = true;
                }

                return React.cloneElement(childElement, {
                    key: index,
                    className: `${childElement.props.className || ""}${
                        index === 0 ? "" : " border-zinc-600 border-t-2"
                    } ${isBottom ? "mt-auto" : ""}`,
                });
            })}
        </ul>
    );
}

export default Sections;
