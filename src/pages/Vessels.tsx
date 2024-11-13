import React from 'react';
import VesselCard from '../components/VesselCard';
import { VesselsProvider, useVessels, useVesselData } from '../contexts/VesselsContext';
import { ActiveVesselProvider, useActiveVessel } from '../contexts/ActiveVesselContext';
import { MapContainer } from 'react-leaflet'; 

const Vessels: React.FC = () => {
    const { vessels } = useVessels(); // Access vessels from VesselsContext
    //const { setActiveVessel } = useActiveVessel(); // Set active vessel using ActiveVesselContext
    useVessels(); // Fetch and update vessel data within MapContainer context

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
