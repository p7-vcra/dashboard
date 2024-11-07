import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useVessels } from "../contexts/VesselsContext";

interface VesselModalProps {
    mmsi: number;
    onClose: () => void;
}

function VesselModal({ mmsi, onClose }: VesselModalProps) {
    const { vessels } = useVessels();

    const selectedVesselRef = useRef(vessels[mmsi]);
    useEffect(() => {
        selectedVesselRef.current = vessels[mmsi];

        return () => {
        };
    }, [mmsi, vessels]);

    return (
        <div >
            <div className="
            fixed
            top-0
            right-0
            bg-zinc-800
            items-center
            justify-center
            z-[1000]
            h-full
        ">
                <div className="w-full  flex justify-end p-2">
                    <button
                        className="text-sm p-2 text-white hover:bg-zinc-600 rounded-md w-8 h-8"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
                <div className="p-4">
                    <ul className="w-64 text-xl">
                        {selectedVesselRef.current && Object.entries(selectedVesselRef.current).map(([key, value]) => (
                            key !== "history" && (
                                <li key={key} className="text-white py-4">
                                    <div className="font-bold text-zinc-300 text-xs">
                                        {key.toUpperCase()}
                                    </div>
                                    <div>
                                        {value}
                                    </div>
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            </div>
        </div >
    );
}

export default VesselModal;
