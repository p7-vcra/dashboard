import React from "react";
import { Vessel } from "../types/vessel";

interface VesselCardProps {
    vessel: Vessel;
}

const VesselCard: React.FC<VesselCardProps> = ({ vessel }) => {
    return (
        <div className="border-2 border-zinc-400 p-4 m-2 rounded-lg hover:bg-zinc-200 overflow-hidden">
            <h3>MMSI: {vessel.mmsi || "-"}</h3>
            <p>Type: {vessel.vesselType || "-"}</p>
            <p>Latitude: {vessel.latitude || "-"}</p>
            <p>Longitude: {vessel.longitude || "-"}</p>
            <p>COG: {vessel.cog || "-"}</p>
            <p>SOG: {vessel.sog || "-"}</p>
            <p>CRI: {vessel.cri || "-"}</p>
            <p className="truncate max-w-28">
                Forecasted:{" "}
                {vessel.futureLocation
                    ? vessel.futureLocation.join(", ")
                    : "No prediction"}
            </p>
        </div>
    );
};

export default VesselCard;
