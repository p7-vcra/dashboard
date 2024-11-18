import { MapContainer, TileLayer } from 'react-leaflet';
import { default as MapContent } from '../components/MapContent';
import VesselModal from '../components/VesselModal';
import { useActiveVessel } from '../contexts/ActiveVesselContext';
import { useMapOptions } from '../contexts/MapOptionsContext';

function Map() {
  const { activeVessel, setActiveVessel } = useActiveVessel();
  const { mapOptions } = useMapOptions();

  function onClose() {
    setActiveVessel(null);
  }

  return (
    <div className="relative h-screen z-10">
      {activeVessel && <VesselModal vessel={activeVessel} onClose={onClose} />}
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
