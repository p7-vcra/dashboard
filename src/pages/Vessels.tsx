import React from 'react';
import VesselCard from '../components/VesselCard';
import { useVesselData } from '../contexts/VesselsContext';
//import { Vessel } from '../types/vessel';


const Vessels: React.FC = () => {
    const { vessels } = useVesselData(); // Access vessels from VesselsContext
    return (
        <div>
            {Object.values(vessels).map(vessel => (
                <VesselCard
                    key={vessel.mmsi}
                    vessel={vessel}
                />
            ))}
        </div>
    );
};


export default Vessels;
