import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { Vessel } from "../types/vessel";

interface VesselModalProps {
    vessel: Vessel;
    onClose: () => void;
}

function VesselModal({ vessel, onClose }: VesselModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mouseup", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mouseup", handleClickOutside);
        };
    }, [onClose]);

    const shownAttributes = [
        "mmsi",
        "vesselType",
        "latitude",
        "longitude",
        "sog",
        "cog",
        "cri",
    ];

    return (
        <div id="vessel-modal" ref={modalRef}>
            <div
                className="
            fixed
            top-0
            right-0
            bg-zinc-800
            bg-opacity-85
            backdrop-blur-xl
            items-center
            justify-center
            z-[1000]
            border-2
            border-zinc-600
            rounded-lg
            m-2
        "
            >
                <div className="w-full flex p-4 items-center justify-between text-white">
                    <div className="font-bold">Vessel</div>
                    <button
                        className="text-sm p-2 text-white hover:bg-zinc-600 rounded-md w-8 h-8"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
                <div className="p-4">
                    <ul className="min-w-44 text-md">
                        {vessel &&
                            Object.entries(vessel)
                                .filter(([key]) =>
                                    shownAttributes.includes(key)
                                )
                                .map(([key, value]) => (
                                    <li key={key} className="text-white py-2">
                                        <div className="font-bold text-zinc-300 text-xs">
                                            {key
                                                .replace(
                                                    /([a-z])([A-Z])/g,
                                                    "$1 $2"
                                                )
                                                .toUpperCase()}
                                        </div>
                                        <div>{value || "-"}</div>
                                    </li>
                                ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default VesselModal;
