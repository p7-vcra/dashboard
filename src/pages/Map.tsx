import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { default as MapContent } from "../components/MapContent";
import MousePositionOverlay from "../components/MousePositionOverlay";
import VesselModal from "../components/VesselModal";
import VesselSearch from "../components/VesselSearch";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useMousePosition } from "../contexts/MousePositionContext";
import { useVesselData } from "../contexts/VesselsContext";

function Map() {
    const { activeVessel, setActiveVessel } = useActiveVessel();
    const { mousePosition } = useMousePosition();
    const { vessels, filtered } = useVesselData();
    const { mapOptions, setMap } = useMap();

    function onClose() {
        setActiveVessel(null);
    }

    return (
        <div className="relative h-screen z-10 w-full">
            <MousePositionOverlay position={mousePosition} />
            {activeVessel && (
                <VesselModal vessel={activeVessel} onClose={onClose} />
            )}
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
                <VesselSearch vessels={vessels} />
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
