import { LatLng } from "leaflet";
import 'leaflet-rotatedmarker';
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { default as MapContent } from "../components/MapContent";


function Map() {
    const denmarkCoords = new LatLng(56.2639, 9.5018);

    const [mapOptions, setMapOptions] = useState({
        center: denmarkCoords,
        zoom: 4,
    });


    return (
        <div className="relative h-screen z-10">
            <MapContainer minZoom={5} maxZoom={30} center={mapOptions.center} zoom={mapOptions.zoom} className="w-full h-full" attributionControl={false}>
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
