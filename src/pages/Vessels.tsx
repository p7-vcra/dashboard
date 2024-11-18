import React from "react";
import VesselCard from "../components/VesselCard";
import { useVesselData } from "../contexts/VesselsContext";

const Vessels: React.FC = () => {
    const { filtered } = useVesselData();
    return (
        <div>
            {Object.values(filtered).map((vessel) => (
                <VesselCard key={vessel.mmsi} vessel={vessel} />
            ))}
        </div>
    );
};

export default Vessels;
