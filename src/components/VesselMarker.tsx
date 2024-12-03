import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import L, { LatLng } from "leaflet";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, MarkerProps, Polyline } from "react-leaflet";
import { Vessel } from "../types/vessel";

const VesselMarker = React.memo(
    function MarkerComponent({
        vessel,
        isActive,
        ...props
    }: Omit<MarkerProps, "position"> & {
        vessel: Vessel;
        isActive: boolean;
    }) {
        const rotation = vessel.cog || 0;
        return (
            <>
                <Marker
                    position={new LatLng(vessel.latitude, vessel.longitude)}
                    icon={createVesselIcon(isActive, vessel.cri)}
                    //@ts-expect-error rotationAngle is imported from leaflet-rotatedmarker
                    rotationAngle={rotation}
                    rotationOrigin="center center"
                    {...props}
                />
                {isActive && vessel.forecast && vessel.forecast.length > 0 && (
                    <Polyline
                        positions={vessel.forecast}
                        color="#1d4ed8"
                        weight={2}
                    />
                )}
            </>
        );
    },
    function areEqual(prevProps, nextProps) {
        return (
            prevProps.vessel.latitude === nextProps.vessel.latitude &&
            prevProps.vessel.longitude === nextProps.vessel.longitude &&
            prevProps.vessel.mmsi === nextProps.vessel.mmsi &&
            prevProps.isActive === nextProps.isActive
        );
    }
);

const arrowMarkup = renderToStaticMarkup(
    <FontAwesomeIcon
        icon={faLocationArrow}
        transform={{ rotate: -45, size: 20, y: 2 }}
    />
); // 45 degrees counter clockwise as the icon points NE by default

function createVesselIcon(isActive: boolean, cri?: number) {
    const borderClass = isActive
        ? "border-blue-700 border-opacity-100 z-[9999]"
        : "border-opacity-0 border-zinc-500";

    const colorClass =
        cri && cri >= 0.9
            ? "text-red-600 bg-red-100 bg-opacity-50"
            : cri && cri >= 0.75
            ? "text-orange-600 bg-orange-100 bg-opacity-50"
            : cri && cri >= 0.5
            ? "text-yellow-600 bg-yellow-100 bg-opacity-50"
            : "text-zinc-900";

    return L.divIcon({
        html: `<div class="border-2 m-[-8px] h-7 w-7 flex justify-center items-center hover:border-opacity-100 rounded-full !outline-none  ${borderClass} ${colorClass}">${arrowMarkup}</div>`,
    });
}

export { VesselMarker };
