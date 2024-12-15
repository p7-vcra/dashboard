import {
    faArrowsToCircle,
    faExpand,
    faLocation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useVessels } from "../contexts/VesselsContext";
import { Vessel } from "../types/vessel";
import Button from "./Button";
import Tooltip from "./Tooltip";

function vesselToBoundExpr(vessel: Vessel): LatLngBoundsExpression {
    const points: LatLngBoundsExpression = [
        [vessel.latitude, vessel.longitude] as LatLngTuple,
    ];

    if (!vessel.forecast) {
        return points;
    }

    points.push(
        ...vessel.forecast.map(
            (forecast) => [forecast.latitude, forecast.longitude] as LatLngTuple
        )
    );

    return points;
}

function ViewControls() {
    const { map } = useMap();
    const { vessels } = useVessels();
    const { activeVesselMmsi } = useActiveVessel();

    const onEncountersClick = () => {
        if (!activeVesselMmsi) {
            return;
        }

        if (!vessels[activeVesselMmsi].encounteringVessels) {
            return;
        }

        const points = [
            vessels[activeVesselMmsi],
            ...(vessels[activeVesselMmsi].encounteringVessels ?? [])
                .map((encounter) => vessels[encounter.mmsi] || null)
                .filter((vessel) => vessel !== null),
        ].reduce((acc: LatLngTuple[], vessel) => {
            acc.push(...(vesselToBoundExpr(vessel) as LatLngTuple[]));
            return acc;
        }, [] as LatLngTuple[]) as LatLngBoundsExpression;

        map?.fitBounds(points, {
            animate: true,
            duration: 0.25,
            padding: [100, 100],
        });
    };

    const onMoveClick = () => {
        if (activeVesselMmsi) {
            const { latitude, longitude } = vessels[activeVesselMmsi];
            map?.panTo([latitude, longitude], {
                animate: true,
                duration: 0.25,
            });
        }
    };

    const onExpandClick = () => {
        if (!activeVesselMmsi) {
            return;
        }
        const points = vesselToBoundExpr(vessels[activeVesselMmsi]);
        map?.fitBounds(points, {
            animate: true,
            duration: 0.25,
            padding: [100, 100],
        });
    };

    return (
        <ul className="flex space-x-2 text-md w-full">
            <li>
                <Tooltip content="Move into view">
                    <Button
                        className="px-3"
                        onClick={onMoveClick}
                        disabled={!activeVesselMmsi}
                    >
                        <FontAwesomeIcon icon={faLocation} />
                    </Button>
                </Tooltip>
            </li>
            <li>
                <Tooltip content="Expand view">
                    <Button
                        className="px-3"
                        onClick={onExpandClick}
                        disabled={!activeVesselMmsi}
                    >
                        <FontAwesomeIcon icon={faExpand} />
                    </Button>
                </Tooltip>
            </li>
            <li className="w-full">
                <Tooltip content="Expand to encountering vessels view">
                    <Button
                        className="px-3 w-full"
                        onClick={onEncountersClick}
                        disabled={
                            !activeVesselMmsi ||
                            !vessels[activeVesselMmsi]?.encounteringVessels
                                ?.length
                        }
                    >
                        <FontAwesomeIcon
                            icon={faArrowsToCircle}
                            className="mr-2"
                        />{" "}
                        Encounter
                    </Button>
                </Tooltip>
            </li>
        </ul>
    );
}

export default ViewControls;
