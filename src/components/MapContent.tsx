import L, { MarkerCluster } from "leaflet";
import { useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useVesselData } from "../contexts/VesselsContext";
import { Vessel } from "../types/vessel";
// prettier-ignore
import "leaflet-rotatedmarker";
import { Polyline } from "react-leaflet";
import { useMapOptions } from "../contexts/MapOptionsContext";
import { useMousePosition } from "../contexts/MousePositionContext";
import { VesselMarker } from "./VesselMarker";

function createClusterIcon(cluster: MarkerCluster) {
    return L.divIcon({
        html: `<span class="text-white bg-zinc-700 border border-zinc-500 h-7 w-7 font-medium rounded-full flex justify-center items-center">${cluster.getChildCount()}</span>`,
        iconSize: L.point(33, 33, true),
    });
}

function MapContent() {
    const map = useMap();
    const { setMapOptions } = useMapOptions();
    const { setMousePosition } = useMousePosition();

    map.on("moveend", () => {
        const bounds = map.getBounds();
        setMapOptions({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bounds: {
                north: bounds.getNorth(),
                east: bounds.getEast(),
                south: bounds.getSouth(),
                west: bounds.getWest(),
            },
        });
    });

    // Get cursor position from map (lat lon)
    map.on("mousemove", (e) => {
        setMousePosition(e.latlng);
    });

    map.addEventListener("zoomend", () => {
        setMapOptions({
            center: map.getCenter(),
            zoom: map.getZoom(),
        });
    });

    const { filtered } = useVesselData();
    const { activeVessel, setActiveVessel } = useActiveVessel();

    return (
        //@ts-expect-error MarkerClusterGroup does not have a type definition
        <MarkerClusterGroup
            iconCreateFunction={createClusterIcon}
            animate
            chunkedLoading
        >
            {activeVessel && activeVessel.futureLocation && (
                <Polyline
                    positions={activeVessel.futureLocation}
                    color="#1d4ed8"
                    weight={2}
                />
            )}
            {Object.values(filtered).map((vessel: Vessel) => (
                <VesselMarker
                    key={vessel.mmsi}
                    vessel={vessel}
                    isActive={activeVessel?.mmsi === vessel.mmsi}
                    eventHandlers={{
                        click: () => {
                            setActiveVessel(vessel);
                        },
                    }}
                />
            ))}
        </MarkerClusterGroup>
    );
}

export default MapContent;
