import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import L, { LatLng, MarkerCluster } from 'leaflet';
import "leaflet-rotatedmarker";
import React, { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, MarkerProps, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useActiveVessel } from '../contexts/ActiveVesselContext';
import { useVessels } from '../contexts/VesselsContext';
import { Vessel, revivier as vesselsJsonRevivier } from './Vessel';

const MemoizedMarker = React.memo(({ position, vessel, isActive, ...props }: MarkerProps & { vessel: Vessel, isActive: boolean }) => {
    return (
        <Marker position={position} icon={createVesselIcon(isActive)} {...props} />
    );
}, (prevProps, nextProps) => {
    return prevProps.position.lat === nextProps.position.lat &&
        prevProps.position.lng === nextProps.position.lng &&
        prevProps.vessel.mmsi === nextProps.vessel.mmsi &&
        prevProps.isActive === nextProps.isActive;
});

const arrowMarkup = renderToStaticMarkup(<FontAwesomeIcon icon={faLocationArrow} transform={{ rotate: -45, size: 20 }} />); // 45 degrees counter clockwise as the icon points NE by default

function createClusterIcon(cluster: MarkerCluster) {
    return L.divIcon({
        html: `<span class="text-white bg-red-700  h-7 w-7 font-medium rounded-full flex justify-center items-center">${cluster.getChildCount()}</span>`,
        iconSize: L.point(33, 33, true),
    });
}

function createVesselIcon(isActive: boolean) {
    const borderClass = isActive ? 'border-blue-600 border-opacity-100' : 'border-opacity-0 border-red-600';
    return L.divIcon({
        html: `<div class="border-2 ${borderClass} h-7 w-7 flex justify-center items-center hover:border-opacity-100 rounded-full">${arrowMarkup}</div>`,
    });
}


function MapContent() {
    const { vessels, updateVessels } = useVessels();
    const { activeVessel, setActiveVessel } = useActiveVessel();

    const map = useMap();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    useEffect(() => {
        const bounds = map.getBounds();

        const url = `http://130.225.37.58:8000/slice?latitude_range=${bounds.getSouth()},${bounds.getNorth()}&longitude_range=${bounds.getWest()},${bounds.getEast()}`;
        const eventSource = new EventSource(url);

        eventSource.onopen = () => console.log("EventSource connection opened");

        eventSource.addEventListener("ais", (event) => {
            const eventData: Vessel[] = JSON.parse(event.data, vesselsJsonRevivier);
            const parsedData = eventData.reduce((acc: { [mmsi: number]: Vessel }, vessel: Vessel) => {
                const { mmsi, vesselType } = vessel;

                if (vesselType === "Class A" && !isNaN(mmsi)) {
                    acc[mmsi] = {
                        ...vesselsRef.current[mmsi],
                        ...vessel,
                    };
                }
                return acc;
            }, {});

            updateVessels(parsedData);
        });

        return () => {
            setActiveVessel(null);
            eventSource.close();
        };
    }, [map, updateVessels]);

    return (
        <MarkerClusterGroup iconCreateFunction={createClusterIcon} animate spiderfyOnMaxZoom>
            {Object.values(vessels).map((vessel: Vessel) => (
                <MemoizedMarker
                    key={vessel.mmsi}
                    position={new LatLng(vessel.latitude, vessel.longitude)}
                    // icon={createVesselIcon()}
                    rotationAngle={vessel.cog}
                    vessel={vessel}
                    isActive={activeVessel?.mmsi === vessel.mmsi}
                    eventHandlers={{
                        click: () => {
                            setActiveVessel(vessel);
                        }
                    }}
                />
            ))}
            {/* {selectedVessel && <VesselModal mmsi={selectedVessel} onClose={() => setSelectedVessel(null)} />} */}
        </MarkerClusterGroup>
    );
}

export default MapContent;
