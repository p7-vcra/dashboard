// Map.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import ShipMarker from './ShipMarker';
import cargoVesselIcon from './assets/cargovessel.png';

// Create a custom icon for the ships
const cargoIcon = new L.Icon({
    iconUrl: cargoVesselIcon,
    iconSize: [64, 36],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function Map() {
    const [shipData, setShipData] = useState<{ [key: string]: { latitude: number, longitude: number, mmsi: string }[] }>({});
    const denmarkCoords: [number, number] = [56.2639, 9.5018];

    useEffect(() => {
        const mmsiList: string[] = ["205127000", "205148000"];

        const fetchShipData = async (mmsi: string) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/get-waypoints/${mmsi}`);
                return { mmsi, waypoints: response.data };
            } catch (error) {
                console.error(`Error fetching data for MMSI ${mmsi}`, error);
                return null;
            }
        };

        Promise.all(mmsiList.map(mmsi => fetchShipData(mmsi)))
            .then(dataArray => {
                const newData: { [key: string]: { latitude: number, longitude: number, mmsi: string }[] } = {};
                dataArray.forEach(data => {
                    if (data && data.waypoints) {
                        newData[data.mmsi] = data.waypoints;
                    }
                });
                setShipData(newData);
            });
    }, []);

    return (
        <div className="w-full h-full">
            <MapContainer minZoom={5} center={denmarkCoords} zoom={4} className="w-full h-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {Object.keys(shipData).map(mmsi => (
                    <ShipMarker 
                        key={mmsi}
                        mmsi={mmsi}
                        waypoints={shipData[mmsi]}
                        icon={cargoIcon}
                    />
                ))}
            </MapContainer>
        </div>
    );
}

export default Map;
