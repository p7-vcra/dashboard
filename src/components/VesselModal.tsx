import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { Vessel } from "./Vessel";

interface VesselModalProps {
    vessel: Vessel;
    onClose: () => void;
}

function VesselModal({ vessel, onClose }: VesselModalProps) {

    useEffect(() => {
        console.log("Vessel Modal mounted");
        return () => {
            console.log("Vessel Modal unmounted");
            console.log(vessel);
        };
    }, [vessel]);

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
                        {Object.entries(vessel).map(([key, value]) => (
                            <li key={key} className="text-white py-4">
                                <div className="font-bold text-zinc-300 text-xs">
                                    {key.toUpperCase()}
                                </div>
                                <div>
                                    {value}
                                </div>
                            </li>
                        ))
                        }

                    </ul>
                </div>
            </div >
        </div >
    );
}

export default VesselModal;
