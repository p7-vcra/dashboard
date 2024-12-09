import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { default as MapContent } from "../components/MapContent";
import MousePositionOverlay from "../components/MousePositionOverlay";
import { useMap } from "../contexts/MapContext";
import { useMousePosition } from "../contexts/MousePositionContext";
import { useVessels } from "../contexts/VesselsContext";

function Map() {
    const { mousePosition } = useMousePosition();
    const { filtered } = useVessels();
    const { mapOptions, setMap } = useMap();

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
                <MapContent vessels={filtered} maxZoom={mapOptions.maxZoom} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    noWrap={true}
                />
                <ZoomControl position="bottomleft" />
            </MapContainer>
        </div>
    );
}

export default Map;
