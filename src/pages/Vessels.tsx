import React from 'react';
import VesselCard from '../components/VesselCard';
import { VesselsProvider, useVessels, useVesselData } from '../contexts/VesselsContext';
import { ActiveVesselProvider, useActiveVessel } from '../contexts/ActiveVesselContext';
import { MapContainer } from 'react-leaflet'; // Import MapContainer from react-leaflet

const DashboardContent: React.FC = () => {
    const { vessels } = useVessels(); // Access vessels from VesselsContext
    const { setActiveVessel } = useActiveVessel(); // Set active vessel using ActiveVesselContext
    useVesselData(); // Fetch and update vessel data within MapContainer context

    return (
        <div>
            {Object.values(vessels).map(vessel => (
                <VesselCard
                    key={vessel.mmsi}
                    vessel={vessel}
                    onClick={() => setActiveVessel(vessel)}
                />
            ))}
        </div>
    );
};

const Vessels: React.FC = () => {
    return (
        <VesselsProvider>
            <ActiveVesselProvider>
                <MapContainer
                    center={[0, 0]} // Replace with your desired map center coordinates
                    zoom={2} // Replace with your desired initial zoom level
                    style={{ height: '100vh', width: '100%' }} // Set dimensions for the map
                >
                    <DashboardContent />
                </MapContainer>
            </ActiveVesselProvider>
        </VesselsProvider>
    );
};

export default Vessels;
