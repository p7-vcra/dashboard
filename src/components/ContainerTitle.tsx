import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface ContainerTitleProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClose?: () => void;
}

const ContainerTitle: React.FC<ContainerTitleProps> = ({
    children,
    className = "",
    style = {},
    onClose,
}) => {
    return (
        <div className="w-full flex items-center justify-between text-white">
            <div className={`font-bold text-sm ${className}`} style={style}>
                {children}
            </div>
            <button
                className="text-sm p-2 text-white hover:bg-zinc-600 rounded-md w-8 h-8"
                onClick={onClose}
            >
                <FontAwesomeIcon icon={faClose} />
            </button>
        </div>
    );
};

export default ContainerTitle;
