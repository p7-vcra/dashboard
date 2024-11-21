import { MapContainer, TileLayer } from "react-leaflet";
import { default as MapContent } from "../components/MapContent";
import MousePositionOverlay from "../components/MousePositionOverlay";
import VesselModal from "../components/VesselModal";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMapOptions } from "../contexts/MapOptionsContext";
import { useMousePosition } from "../contexts/MousePositionContext";

function Map() {
    const { activeVessel, setActiveVessel } = useActiveVessel();
    const { mapOptions } = useMapOptions();
    const { mousePosition } = useMousePosition();

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
                minZoom={5}
                maxZoom={18}
                center={mapOptions.center}
                zoom={mapOptions.zoom}
                className="w-full h-full"
                attributionControl={false}
            >
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
