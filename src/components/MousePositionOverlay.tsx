import { LatLng } from "leaflet";
import React from "react";
import Container from "./Container";

interface MousePositionProps {
    position: LatLng;
}

const MousePositionOverlay: React.FC<MousePositionProps> = ({ position }) => {
    return (
        <Container className="flex items-center justify-center absolute bottom-1 left-12 p-2 text-xs  m-2 z-[1000]">
            <div className="text-white min-w-36 text-center tabular-nums">
                {position.lat.toFixed(6) || "-"},{" "}
                {position.lng.toFixed(6) || "-"}
            </div>
        </Container>
    );
};

export default MousePositionOverlay;
