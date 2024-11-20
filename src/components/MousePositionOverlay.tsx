import { LatLng } from "leaflet";
import React from "react";

interface MousePositionProps {
    position: LatLng;
}

const VesselCard: React.FC<MousePositionProps> = ({ position }) => {
    return (
        <div
            className="
            absolute
            bottom-0
            left-0
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
            p-4
        "
        >
            <div className="text-white min-w-48 text-center">
                {position.lat.toFixed(6) || "-"},{" "}
                {position.lng.toFixed(6) || "-"}
            </div>
        </div>
    );
};

export default VesselCard;
