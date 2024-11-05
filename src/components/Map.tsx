import { LatLng, Marker as LeafletMarker } from "leaflet";
import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';


// Memoized Marker with custom comparison
const MemoizedMarker = React.memo(({ position, vessel }: MarkerProps) => {
    return (
        <Marker position={position}>
            <Popup>
                <div>
                    <h1>{vessel.vesselType}</h1>
                    <p>{vessel.mmsi}</p>
                </div>
            </Popup>
        </Marker>
    );
}, (prevProps, nextProps) => {
    return prevProps.position.lat === nextProps.position.lat &&
           prevProps.position.lng === nextProps.position.lng &&
           prevProps.vessel.mmsi === nextProps.vessel.mmsi;
});

function MapContent() {
    const [vessels, setVessels] = useState<Record<string, Vessel>>({});
    const map = useMap();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    const updateVessels = useCallback(_.debounce((newVessels: Record<string, Vessel>, bounds) => {
        setVessels(prevVessels => {
            const updatedVessels = { ...prevVessels };
            
            // Update only vessels that have moved or are new
            Object.entries(newVessels).forEach(([mmsi, vessel]) => {
                if (bounds.contains([vessel.latitude, vessel.longitude])) {
                    const existingVessel = updatedVessels[mmsi];
                    if (!existingVessel ||
                        existingVessel.latitude !== vessel.latitude ||
                        existingVessel.longitude !== vessel.longitude) {
                        updatedVessels[mmsi] = vessel;
                    }
                }
            });

            // Remove vessels outside bounds
            Object.keys(updatedVessels).forEach((mmsi) => {
                const vessel = updatedVessels[mmsi];
                if (!bounds.contains([vessel.latitude, vessel.longitude])) {
                    delete updatedVessels[mmsi];
                }
            });

            // Only return new object if there were actual changes
            return Object.keys(updatedVessels).length === Object.keys(prevVessels).length &&
                   Object.keys(updatedVessels).every(key => 
                       _.isEqual(updatedVessels[key], prevVessels[key]))
                ? prevVessels 
                : updatedVessels;
        });
    }, 300), []);

    useEffect(() => {
        let currentEventSource: EventSource | null = null;

        const cleanup = () => {
            if (currentEventSource) {
                currentEventSource.close();
                currentEventSource = null;
            }
        };

        const handleMoveEnd = () => {
            cleanup(); // Single place to handle connection cleanup

            const bounds = map.getBounds();
            const url = `http://130.225.37.58:8000/slice?latitude_range=${bounds.getSouth()},${bounds.getNorth()}&longitude_range=${bounds.getWest()},${bounds.getEast()}`;
            
            currentEventSource = new EventSource(url);
            currentEventSource.onopen = () => console.log("EventSource connection opened");

            currentEventSource.addEventListener("ais", (event) => {
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
                        };
                    }
                    return acc;
                }, {});

                updateVessels(parsedData, bounds);
            });
        };

        handleMoveEnd();
        map.on('moveend', handleMoveEnd);
        
        return () => {
            cleanup();
            map.off('moveend', handleMoveEnd);
        };
    }, [map, updateVessels]);

    return (
        <MarkerClusterGroup>
            {Object.values(vessels).map((vessel) => (
                <MemoizedMarker 
                    key={vessel.mmsi} 
                    position={new LatLng(vessel.latitude, vessel.longitude)}
                    vessel={vessel}
                />
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
