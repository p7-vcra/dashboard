import {
    MapContainer,
    ScaleControl,
    TileLayer,
    ZoomControl,
} from "react-leaflet";
import MousePositionOverlay from "../components/MousePositionOverlay";
import VesselClusters from "../components/VesselClusters";
import { useMap } from "../contexts/MapContext";
import { useMousePosition } from "../contexts/MousePositionContext";

function Map() {
    const { mousePosition } = useMousePosition();
    const { mapOptions, setMap } = useMap();
    document.title = "Map - Vessel CRA";

    return (
        <div className="relative h-screen z-10 w-full">
            <MousePositionOverlay position={mousePosition} />
            <MapContainer
                minZoom={mapOptions.minZoom}
                maxZoom={mapOptions.maxZoom}
                center={mapOptions.center}
                zoom={mapOptions.zoom}
                className="w-full h-full"
                attributionControl={false}
                zoomControl={false}
                preferCanvas={true}
                ref={setMap}
            >
                <VesselClusters maxZoom={mapOptions.maxZoom} />
                <ZoomControl position="bottomleft" />
                <ScaleControl position="bottomleft" metric />
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
