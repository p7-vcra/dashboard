import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { default as MapContent } from "../components/MapContent";
import MousePositionOverlay from "../components/MousePositionOverlay";
import VesselModal from "../components/VesselModal";
import VesselSearch from "../components/VesselSearch";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMapOptions } from "../contexts/MapOptionsContext";
import { useMousePosition } from "../contexts/MousePositionContext";
import { useVesselData } from "../contexts/VesselsContext";

function Map() {
    const { activeVessel, setActiveVessel } = useActiveVessel();
    const { mapOptions } = useMapOptions();
    const { mousePosition } = useMousePosition();
    const { vessels, filtered } = useVesselData();

    const minZoom = 5;
    const maxZoom = 18;

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
                minZoom={minZoom}
                maxZoom={maxZoom}
                center={mapOptions.center}
                zoom={mapOptions.zoom}
                className="w-full h-full"
                attributionControl={false}
                zoomControl={false}
                preferCanvas={true}
            >
                <VesselSearch vessels={vessels} />
                <MapContent filtered={filtered} maxZoom={maxZoom} />
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
