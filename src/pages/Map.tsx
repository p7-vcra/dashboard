import { LatLng } from 'leaflet';
import 'leaflet-rotatedmarker';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { default as MapContent } from '../components/MapContent';
import VesselFilter from '../components/VesselFilter';
import VesselModal from '../components/VesselModal';
import { useActiveVessel } from '../contexts/ActiveVesselContext';

function Map() {
  const denmarkCoords = new LatLng(56.2639, 9.5018);

  const { activeVessel, setActiveVessel } = useActiveVessel();

  function onClose() {
    setActiveVessel(null);
  }

  const [mapOptions] = useState({
    center: denmarkCoords,
    zoom: 4,
  });

  return (
    <div className="relative h-screen z-10">
      {activeVessel && <VesselModal vessel={activeVessel} onClose={onClose} />}
      <div className="z-[2002] w-1/3 bg-zinc-800 p-4 fixed  rounded-2xl border">
        <VesselFilter />
      </div>
      <MapContainer
        minZoom={5}
        maxZoom={30}
        center={mapOptions.center}
        zoom={mapOptions.zoom}
        className="w-full h-full"
        attributionControl={false}>
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
