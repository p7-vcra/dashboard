import React from 'react';
import { Vessel } from '../types/Vessel';

interface VesselCardProps {
    vessel: Vessel;
    onClick: () => void;
}

const VesselCard: React.FC<VesselCardProps> = ({ vessel, onClick }) => {
    return (
        <div onClick={onClick} className="border border-gray-300 p-4 m-2 rounded-lg shadow-md cursor-pointer">
            <h3>MMSI: {vessel.mmsi}</h3>
            <p>Type: {vessel.vesselType}</p>
            <p>Latitude: {vessel.latitude}</p>
            <p>Longitude: {vessel.longitude}</p>
            <p>COG: {vessel.cog}</p>
            <p>SOG: {vessel.sog}</p>
        </div>
    );
};

export default VesselCard;