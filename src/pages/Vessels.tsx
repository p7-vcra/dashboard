import React from "react";
import VesselCard from "../components/VesselCard";
import { useVesselData } from "../contexts/VesselsContext";

const Vessels: React.FC = () => {
    const { filtered } = useVesselData();
    return (
        <div className="xl:grid-cols-4 grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {Object.values(filtered).map((vessel) => (
                <VesselCard key={vessel.mmsi} vessel={vessel} />
            ))}
        </div>
    );
};

export default Vessels;
