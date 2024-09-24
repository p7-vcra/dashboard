// ShipMarker.tsx
import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface ShipMarkerProps {
    mmsi: string;
    waypoints: { latitude: number; longitude: number }[];
    icon: L.Icon;
}

const ShipMarker: React.FC<ShipMarkerProps> = ({ mmsi, waypoints, icon }) => {
    if (waypoints.length === 0) return null;

    const lastCoord = waypoints[waypoints.length - 1];

    return (
        <>
            <Polyline 
                pathOptions={{ color: 'red', weight: 4 }} 
                positions={waypoints.map(coord => [coord.latitude, coord.longitude])} 
            />
            <Marker position={[lastCoord.latitude, lastCoord.longitude]} icon={icon}>
                <Popup>
                    <strong>MMSI:</strong> {mmsi}
                </Popup>
            </Marker>
        </>
    );
};

export default ShipMarker;
