import L from "leaflet";
import "leaflet-rotatedmarker";
import { useCallback, useEffect } from "react";
import { Marker, useMap } from "react-leaflet";
import useSupercluster from "use-supercluster";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMapOptions } from "../contexts/MapOptionsContext";
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
    filtered: { [mmsi: string]: Vessel };
    maxZoom: number;
}

const MapContent = ({ filtered, maxZoom }: MapContentProps) => {
    const map = useMap();
    const { mapOptions, setMapOptions } = useMapOptions();
    const { setMousePosition } = useMousePosition();
    const { activeVessel, setActiveVessel } = useActiveVessel();

    const updateMapOptions = useCallback(() => {
        const bounds = map.getBounds();
        setMapOptions({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bounds: {
                north: bounds.getNorth(),
                east: bounds.getEast(),
                south: bounds.getSouth(),
                west: bounds.getWest(),
            },
        });
    }, [map, setMapOptions]);

    const updateMousePosition = useCallback(
        (event: L.LeafletMouseEvent) => {
            setMousePosition(event.latlng);
        },
        [setMousePosition]
    );

    useEffect(() => {
        map.on("move", updateMapOptions);
        map.on("zoom", updateMapOptions);
        map.on("mousemove", updateMousePosition);
        return () => {
            map.off("move", updateMapOptions);
            map.off("zoom", updateMapOptions);
            map.off("mousemove", updateMousePosition);
        };
    }, [map, updateMapOptions, updateMousePosition]);

    const points = Object.values(filtered).map((vessel) => ({
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
            mapOptions.bounds?.west || map.getBounds().getWest(),
            mapOptions.bounds?.south || map.getBounds().getSouth(),
            mapOptions.bounds?.east || map.getBounds().getEast(),
            mapOptions.bounds?.north || map.getBounds().getNorth(),
        ],
        options: { radius: 180, minPoints: 2, maxZoom: 16 },
    });

    return (
        <>
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
                                    map.flyTo(
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
                            activeVessel?.mmsi ===
                            cluster.properties.vessel.mmsi
                        }
                        eventHandlers={{
                            click: () => {
                                setActiveVessel(cluster.properties.vessel);
                            },
                        }}
                    />
                );
            })}
        </>
    );
};

export default MapContent;
