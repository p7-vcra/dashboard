import { LatLng, Marker as LeafletMarker } from "leaflet";
import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';

// Memoized Marker to prevent blinking
const MemoizedMarker = React.memo(({ position, children }) => {
    return (
        <Marker position={position}>
            {children}
        </Marker>
    );
});

function MapContent() {
    const [vessels, setVessels] = useState({});
    const map = useMap();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    const updateVessels = useCallback(_.debounce((newVessels) => {
        setVessels(prevVessels => ({
            ...prevVessels,
            ...newVessels
        }));
    }, 300), []);

    useEffect(() => {
        const bounds = map.getBounds();

        const url = `http://130.225.37.58:8000/slice?latitude_range=${bounds.getSouth()},${bounds.getNorth()}&longitude_range=${bounds.getWest()},${bounds.getEast()}`;

        const eventSource = new EventSource(url);

        eventSource.onopen = () => console.log("EventSource connection opened");

        eventSource.addEventListener("ais", (event) => {
            const eventData = JSON.parse(event.data);

            const parsedData = eventData.reduce((acc, vessel) => {
                const { MMSI: mmsi, "Type of mobile": vesselType, Latitude: latitude, Longitude: longitude } = vessel;

                if (vesselType === "Class A" && !isNaN(mmsi)) {
                    acc[mmsi] = {
                        ...vesselsRef.current[mmsi],
                        mmsi,
                        vesselType,
                        latitude,
                        longitude,
                        history: [
                            ...(vesselsRef.current[mmsi]?.history || []),
                            { latitude, longitude, timestamp: new Date().toISOString() }
                        ]
                    };
                }
                return acc;
            }, {});

            updateVessels(parsedData);
        });

        return () => {
            eventSource.close();
        };
    }, [map, updateVessels]);

    return (
        <MarkerClusterGroup>
            {Object.values(vessels).map((vessel) => (
                <MemoizedMarker key={vessel.mmsi} position={new LatLng(vessel.latitude, vessel.longitude)}>
                    <Popup>
                        <div>
                            <h1>{vessel.vesselType}</h1>
                            <p>{vessel.mmsi}</p>
                        </div>
                    </Popup>
                </MemoizedMarker>
            ))}
        </MarkerClusterGroup>
    );
}

function Map() {
    const denmarkCoords = new LatLng(56.2639, 9.5018);

    return (
        <div className="w-full h-full border-red-600 border">
            <MapContainer minZoom={5} maxZoom={30} center={denmarkCoords} zoom={4} className="w-full h-full" attributionControl={false}>
                <MapContent />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    noWrap={true}
                />
            </MapContainer>
        </div>
    );
}

export default Map;
