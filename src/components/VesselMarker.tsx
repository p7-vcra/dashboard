import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import L, { LatLng } from "leaflet";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, MarkerProps, Polyline } from "react-leaflet";
import { twMerge } from "tailwind-merge";
import { Vessel } from "../types/vessel";

const VesselMarker = React.memo(
    function MarkerComponent({
        vessel,
        cri,
        isActive,
        isEncountering,
        index,
        ...props
    }: Omit<MarkerProps, "position"> & {
        vessel: Vessel;
        cri: number;
        isActive: boolean;
        isEncountering?: boolean;
        index?: number;
    }) {
        isEncountering = isEncountering || false;
        const cog = vessel.cog || 0;
        const icon = React.useMemo(
            () => createVesselIcon(isActive, isEncountering, cri, cog, index),
            [isActive, isEncountering, cri, cog, index]
        );

        return (
            <>
                <Marker
                    position={new LatLng(vessel.latitude, vessel.longitude)}
                    icon={icon}
                    // @ts-expect-error rotationAngle is not in the types
                    // rotationAngle={vessel.cog || 0}
                    rotationOrigin="center center"
                    zIndexOffset={isActive || isEncountering ? 1000 : 0}
                    {...props}
                />
                {(isActive || isEncountering) &&
                    vessel.forecast &&
                    vessel.forecast.length > 0 && (
                        <Polyline
                            positions={vessel.forecast.map((point) => [
                                point[1],
                                point[2],
                            ])}
                            color={isEncountering ? "#2563eb" : "#18181b"}
                            weight={2}
                            dashArray={[5, 3]}
                        />
                    )}
            </>
        );
    },
    function areEqual(prevProps, nextProps) {
        return (
            prevProps.vessel.latitude === nextProps.vessel.latitude &&
            prevProps.vessel.longitude === nextProps.vessel.longitude &&
            prevProps.vessel.cog === nextProps.vessel.cog &&
            prevProps.vessel.mmsi === nextProps.vessel.mmsi &&
            prevProps.isActive === nextProps.isActive
        );
    }
);

// const arrowMarkup = renderToStaticMarkup(
//     <FontAwesomeIcon
//         icon={faLocationArrow}
//         transform={{ rotate: -45, size: 20, y: 2 }}
//     />
// ); // 45 degrees counter clockwise as the icon points NE by default

function createVesselIcon(
    isActive: boolean,
    isEncountering: boolean,
    cri: number,
    cog: number,
    index?: number
) {
    const borderClass =
        isActive || isEncountering
            ? "border-opacity-100 bg-opacity-100"
            : "border-opacity-0 border-zinc-500";

    const colorClass = isEncountering
        ? "text-blue-600 bg-blue-100 bg-opacity-100 border-blue-600"
        : cri && cri >= 0.9
        ? "text-red-600 bg-red-100 bg-opacity-15 border-red-600"
        : cri && cri >= 0.75
        ? "text-orange-600 bg-orange-100 bg-opacity-15 border-orange-600"
        : cri && cri >= 0.5
        ? "text-yellow-600 bg-yellow-100 bg-opacity-15 border-yellow-600"
        : isActive
        ? "text-zinc-900 bg-zinc-300 bg-opacity-15 border-zinc-900"
        : "text-zinc-900";

    const classNames = twMerge(
        "border-2 m-[-8px] h-7 w-7 flex justify-center items-center hover:border-opacity-100 rounded-full !outline-none",
        colorClass,
        borderClass
    );

    const arrowMarkupRotated = renderToStaticMarkup(
        <FontAwesomeIcon
            icon={faLocationArrow}
            transform={{ rotate: -45 + cog, size: 20 }}
        />
    );

    const indexMarkup =
        index !== undefined
            ? `<span class="bg-zinc-700 absolute -top-2 right-0  border-zinc-500 border-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${index}</span>`
            : "";
    return L.divIcon({
        html: `<div class="relative"><div class="${classNames}">${arrowMarkupRotated}</div>${indexMarkup}</div>`,
        iconSize: L.point(28, 28, true),
        iconAnchor: L.point(14, 14, true),
    });
}

export { VesselMarker };
