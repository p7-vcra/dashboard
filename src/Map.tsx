import { fetchEventSource } from "@microsoft/fetch-event-source";
import { LatLng, latLng, latLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";




function Map() {
    const [coords, setCoords] = useState<LatLng[]>([]);
    const denmarkCoords = latLng(56.2639, 9.5018);

    useEffect(() => {
        const evtSource = new EventSource("http://127.0.0.1:8000/get-waypoints");
        evtSource.addEventListener("locationUpdate", (event) => {
            console.log("locationUpdate", event.data);
            if (event.data) {
                setCoords((prev) => [...prev, latLng(JSON.parse(event.data))]);
            }
        });

        evtSource.addEventListener("error", (event) => {
            console.error("EventSource failed:", event);
            evtSource.close();
        });

        return () => {
            evtSource.close();
        };
    }, []);



    return (
        <div className="w-full h-full border-red-600 border">
            <MapContainer minZoom={5} center={denmarkCoords} zoom={4} className="w-full h-full" attributionControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Polyline pathOptions={{ color: 'blue', weight: 2 }} smoothFactor={3} positions={coords.map((coord) => [coord.lat, coord.lng])} />
            </MapContainer>
        </div >
    );
}

export default Map
