import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import L, { LatLng, MarkerCluster } from "leaflet";
import 'leaflet-rotatedmarker';
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useVessels } from "../contexts/VesselsContext";
import dummy from "../dummy.json";
import { Vessel, revivier as vesselsJsonRevivier } from "./Vessel";
import VesselModal from "./VesselModal";





const arrowMarkup = renderToStaticMarkup(<FontAwesomeIcon icon={faLocationArrow} transform={{ rotate: -45, size: 25 }} />); // 45 degrees counter clockwise as the icon points NE by default

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
    const { vessels, updateVessels } = useVessels();

    const map = useMap();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

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
            setSelectedVessel(null);
            eventSource.close();
        };
    }, [map, updateVessels]);


    return (
        <MarkerClusterGroup iconCreateFunction={createClusterIcon}>
            {Object.values(vessels).map((vessel: Vessel) => (
                <Marker key={vessel.mmsi} position={new LatLng(vessel.latitude, vessel.longitude)} icon={createVesselIcon()} rotationAngle={vessel.cog} eventHandlers={
                    {
                        click: () => {
                            console.log("Marker clicked");
                            setSelectedVessel(vessel);
                        }
                    }
                }>
                </Marker>
            ))}
            {selectedVessel && <VesselModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />}
        </MarkerClusterGroup>
    );
}

export default MapContent;
