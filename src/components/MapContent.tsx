import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import L, { LatLng, MarkerCluster } from 'leaflet';
import 'leaflet-rotatedmarker';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, MarkerProps, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useActiveVessel } from '../contexts/ActiveVesselContext';
import { useVesselData } from '../contexts/VesselsContext';
import { Vessel } from '../types/vessel';

const MemoizedMarker = React.memo(
  function MarkerComponent({
    position,
    isActive,
    rotationAngle,
    ...props
  }: MarkerProps & { vessel: Vessel; isActive: boolean; rotationAngle: number }) {
    //@ts-expect-error rotationAngle is not a valid prop for Marker
    return <Marker position={position} icon={createVesselIcon(isActive)} rotationAngle={rotationAngle} {...props} />;
  },
  function areEqual(prevProps, nextProps) {
    return (
      (prevProps.position as LatLng).lat === (nextProps.position as LatLng).lat &&
      (prevProps.position as LatLng).lng === (nextProps.position as LatLng).lng &&
      prevProps.vessel.mmsi === nextProps.vessel.mmsi &&
      prevProps.isActive === nextProps.isActive
    );
  }
);

const arrowMarkup = renderToStaticMarkup(
  <FontAwesomeIcon icon={faLocationArrow} transform={{ rotate: -45, size: 20 }} />
); // 45 degrees counter clockwise as the icon points NE by default

function createClusterIcon(cluster: MarkerCluster) {
  return L.divIcon({
    html: `<span class="text-white bg-red-700  h-7 w-7 font-medium rounded-full flex justify-center items-center">${cluster.getChildCount()}</span>`,
    iconSize: L.point(33, 33, true),
  });
}

function createVesselIcon(isActive: boolean) {
  const borderClass = isActive ? 'border-blue-600 border-opacity-100' : 'border-opacity-0 border-red-600';
  return L.divIcon({
    html: `<div class="border-2 h-7 w-7 flex justify-center items-center hover:border-opacity-100 rounded-full ${borderClass}">${arrowMarkup}</div>`,
  });
}

function MapContent() {
  const map = useMap();
  const bounds = map.getBounds();

  const { filtered } = useVesselData({
    east: bounds.getEast(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    south: bounds.getSouth(),
  });

  const { activeVessel, setActiveVessel } = useActiveVessel();

  return (
    //@ts-expect-error MarkerClusterGroup does not have a type definition
    <MarkerClusterGroup iconCreateFunction={createClusterIcon} animate spiderfyOnMaxZoom>
      {Object.values(filtered).map((vessel: Vessel) => (
        <MemoizedMarker
          key={vessel.mmsi}
          position={new LatLng(vessel.latitude, vessel.longitude)}
          rotationAngle={vessel.cog}
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
