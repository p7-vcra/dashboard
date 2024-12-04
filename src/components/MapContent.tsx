import L from "leaflet";
import "leaflet-rotatedmarker";
import { useCallback, useEffect } from "react";
import { Marker } from "react-leaflet";
import useSupercluster from "use-supercluster";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useMousePosition } from "../contexts/MousePositionContext";
import { Vessel } from "../types/vessel";
import { VesselMarker } from "./VesselMarker";

function createClusterIcon(pointCount: number) {
    return L.divIcon({
        html: `<span class="text-white bg-zinc-800 border hover:bg-zinc-700 border-zinc-500 h-7 w-7 font-medium rounded-full flex justify-center items-center">${pointCount}</span>`,
        iconSize: L.point(28, 28, true),
        iconAnchor: L.point(14, 14, true),
    });
}

interface MapContentProps {
    vessels: { [mmsi: string]: Vessel };
    maxZoom: number;
}

const MapContent = ({ vessels, maxZoom }: MapContentProps) => {
    const { map, mapOptions, setMapOptions } = useMap();

    const { setMousePosition } = useMousePosition();
    const {
        activeVesselMmsi,
        encounteringVesselsMmsi,
        setActiveVesselMmsi,
        setEncounteringVesselsMmsi,
    } = useActiveVessel();

    const updateMousePosition = useCallback(
        (event: L.LeafletMouseEvent) => {
            setMousePosition(event.latlng);
        },
        [setMousePosition]
    );

    const updateMapOptions = useCallback(() => {
        if (map) {
            setMapOptions({
                center: map.getCenter(),
                zoom: map.getZoom(),
                minZoom: map.getMinZoom(),
                maxZoom: map.getMaxZoom(),
                bounds: {
                    west: map.getBounds().getWest(),
                    south: map.getBounds().getSouth(),
                    east: map.getBounds().getEast(),
                    north: map.getBounds().getNorth(),
                },
            });
        }
    }, [map, setMapOptions]);

    useEffect(() => {
        map?.on("mousemove", updateMousePosition);
        map?.on("moveend", updateMapOptions);
        map?.on("zoomend", updateMapOptions);
        return () => {
            map?.off("mousemove", updateMousePosition);
            map?.off("moveend", updateMapOptions);
            map?.off("zoomend", updateMapOptions);
        };
    }, [map, mapOptions, updateMousePosition]);

    const points = Object.values(vessels)
        .filter(
            (vessel) =>
                !(activeVesselMmsi && vessel.mmsi === activeVesselMmsi) &&
                !encounteringVesselsMmsi.some(
                    (encounteringVesselMmsi) =>
                        encounteringVesselMmsi === vessel.mmsi
                )
        )
        .map((vessel) => ({
            type: "Feature",
            properties: { cluster: false, vessel },
            geometry: {
                type: "Point",
                coordinates: [vessel.longitude, vessel.latitude],
            },
        }));

    const { clusters, supercluster } = useSupercluster({
        points,
        zoom: mapOptions.zoom,
        bounds: [
            mapOptions.bounds?.west || -9999,
            mapOptions.bounds?.south || -9999,
            mapOptions.bounds?.east || 9999,
            mapOptions.bounds?.north || 9999,
        ],
        options: { radius: 180, minPoints: 2, maxZoom: 16 },
    });

    return (
        <>
            {activeVesselMmsi && vessels[activeVesselMmsi] && (
                <VesselMarker
                    key={`active-vessel-${activeVesselMmsi}`}
                    vessel={vessels[activeVesselMmsi]}
                    isActive={true}
                />
            )}
            {encounteringVesselsMmsi.map((encounteringVesselMmsi) => (
                <VesselMarker
                    key={`encountering-vessel-${encounteringVesselMmsi}`}
                    vessel={vessels[encounteringVesselMmsi]}
                    isActive={false}
                    isEncountering={true}
                    eventHandlers={{
                        click: () => {
                            setActiveVesselMmsi(encounteringVesselMmsi);
                        },
                    }}
                />
            ))}

            {clusters.map((cluster) => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const { cluster: isCluster, point_count: pointCount } =
                    cluster.properties;

                if (isCluster) {
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            position={[latitude, longitude]}
                            icon={createClusterIcon(pointCount)}
                            eventHandlers={{
                                mousedown: () => {
                                    const expansionZoom = Math.min(
                                        supercluster.getClusterExpansionZoom(
                                            cluster.id
                                        ),
                                        maxZoom
                                    );
                                    map?.flyTo(
                                        [latitude, longitude],
                                        expansionZoom,
                                        {
                                            animate: true,
                                            duration: 0.25,
                                        }
                                    );
                                },
                            }}
                        />
                    );
                }

                return (
                    <VesselMarker
                        key={`vessel-${cluster.properties.vessel.mmsi}`}
                        vessel={cluster.properties.vessel}
                        isActive={
                            activeVesselMmsi === cluster.properties.vessel.mmsi
                        }
                        eventHandlers={{
                            click: () => {
                                setActiveVesselMmsi(
                                    cluster.properties.vessel.mmsi
                                );
                                setEncounteringVesselsMmsi(
                                    vessels[cluster.properties.vessel.mmsi]
                                        .encounteringVessels || []
                                );
                            },
                        }}
                    />
                );
            })}
        </>
    );
};

export default MapContent;
