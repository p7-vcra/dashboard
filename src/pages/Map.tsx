import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import L, { LatLng, MarkerCluster } from "leaflet";
import 'leaflet-rotatedmarker';
import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { Vessel, revivier as vesselsJsonRevivier } from "../components/Vessel";

const arrowMarkup = renderToStaticMarkup(<FontAwesomeIcon icon={faLocationArrow} transform={{ rotate: -45, size: 25 }} />);

// Memoized Marker to prevent blinking
const MemoizedMarker = React.memo(({ position, rotation, children }) => {
    return (
        <Marker position={position} icon={createVesselIcon()} rotationAngle={rotation} >
            {children}
        </Marker >
    );
});


function createClusterIcon(cluster: MarkerCluster) {
    return L.divIcon({
        html: `<span class="text-white bg-red-700  h-7 w-7 font-medium rounded-full flex justify-center items-center">${cluster.getChildCount()}</span>`,
        iconSize: L.point(33, 33, true),
    })
}

function createVesselIcon() {
    return L.divIcon({
        html: arrowMarkup,
    });
}


function MapContent() {
    const [vessels, setVessels] = useState<{ [mmsi: number]: Vessel }>({});
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
            const eventData: Vessel[] = JSON.parse(event.data, vesselsJsonRevivier);
            const parsedData = eventData.reduce((acc: { [mmsi: number]: Vessel }, vessel: Vessel) => {
                const { mmsi, vesselType } = vessel;

                if (vesselType === "Class A" && !isNaN(mmsi)) {
                    acc[mmsi] = {
                        ...vesselsRef.current[mmsi],
                        ...vessel,
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
        <MarkerClusterGroup iconCreateFunction={createClusterIcon}>
            {Object.values(vessels).map((vessel: Vessel) => (
                <MemoizedMarker key={vessel.mmsi} position={new LatLng(vessel.latitude, vessel.longitude)} rotation={vessel.cog}>
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
        <div className="relative h-screen">
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
