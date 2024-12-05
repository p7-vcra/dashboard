import {
    faExpand,
    faLocation,
    faMap,
    faShip,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LatLng, LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import Button from "../components/Button";
import ContainerSegment from "../components/ContainerSegment";
import ContainerTitle from "../components/ContainerTitle";
import VesselCard from "../components/VesselCard";
import VesselFilter from "../components/VesselFilter";
import VesselSearch from "../components/VesselSearch";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useVesselData } from "../contexts/VesselsContext";
import { Vessel } from "../types/vessel";

function vesselToBoundExpr(vessel: Vessel): LatLngBoundsExpression {
    const points: LatLngBoundsExpression = [
        [vessel.latitude, vessel.longitude] as LatLngTuple,
    ];

    if (!vessel.forecast) {
        return points;
    }

    points.push(
        ...vessel.forecast.map(
            (forecast) => [forecast[1], forecast[2]] as LatLngTuple
        )
    );

    return points;
}

function Layout() {
    const routes = {
        map: {
            display: "Map",
            icon: faMap,
            href: "/",
        },
        vessels: {
            display: "Vessels",
            icon: faShip,
            href: "/vessels",
        },
    };

    const { map } = useMap();
    const {
        activeVesselMmsi,
        setActiveVesselMmsi,
        setEncounteringVesselsMmsi,
        encounteringVesselsMmsi,
    } = useActiveVessel();
    const { vessels } = useVesselData();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveVesselMmsi(null);
                setEncounteringVesselsMmsi([]);
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setActiveVesselMmsi]);

    const onEncountersClick = () => {
        console.log("Encounters", activeVesselMmsi, encounteringVesselsMmsi);
        if (!activeVesselMmsi) {
            return;
        }

        if (!vessels[activeVesselMmsi].encounteringVessels) {
            return;
        }

        setEncounteringVesselsMmsi(
            vessels[activeVesselMmsi].encounteringVessels || []
        );

        console.log("Encounters", activeVesselMmsi, encounteringVesselsMmsi);

        const points = [
            vessels[activeVesselMmsi],
            ...encounteringVesselsMmsi
                .map((mmsi) => vessels[mmsi] || null)
                .filter((vessel) => vessel !== null),
        ].reduce((acc: LatLngTuple[], vessel) => {
            acc.push(...(vesselToBoundExpr(vessel) as LatLngTuple[]));
            return acc;
        }, [] as LatLngTuple[]) as LatLngBoundsExpression;

        map?.fitBounds(points, {
            animate: true,
            duration: 0.25,
            padding: [50, 50],
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
            padding: [50, 50],
        });
    };

    return (
        <div className="">
            <aside className="fixed top-0 left-0 z-40 w-20 h-screen transition-transform border-r-2 border-zinc-600">
                <div className="h-full px-3 py-4  bg-zinc-800 ">
                    <ul className="space-y-2 font-medium text-sm">
                        {Object.values(routes).map((route) => (
                            <li key={route.href} className="relative group">
                                <Link
                                    to={route.href}
                                    className="flex items-center justify-center p-4 text-white rounded-lg  hover:bg-zinc-700"
                                >
                                    <FontAwesomeIcon icon={route.icon} />
                                </Link>
                                <div className="absolute text-sm left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block w-max bg-zinc-900 text-white  rounded-lg border-1 border-zinc-600 px-2 py-1">
                                    {route.display}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 ml-20 mr-72">
                <Outlet />
            </main>

            <aside className="fixed top-0 right-0 z-40 w-72 h-screen transition-transform border-l-2 border-zinc-600">
                <div className="h-full px-3   bg-zinc-800 ">
                    <div className="space-y-2 flex flex-col justify-between h-full">
                        <div>
                            <div className="border-b-2 -mx-3 py-4 mb-3 border-zinc-600 ">
                                <div className="mx-3">
                                    <VesselSearch vessels={vessels} />
                                </div>
                            </div>
                            {activeVesselMmsi && (
                                <>
                                    <ContainerTitle
                                        onClose={() => {
                                            setActiveVesselMmsi(null);
                                            setEncounteringVesselsMmsi([]);
                                        }}
                                    >
                                        Vessel
                                    </ContainerTitle>
                                    <VesselCard
                                        vessel={vessels[activeVesselMmsi]}
                                    />

                                    {encounteringVesselsMmsi &&
                                        encounteringVesselsMmsi.length > 0 && (
                                            <>
                                                <ContainerTitle className="py-2">
                                                    Encountering Vessels
                                                </ContainerTitle>
                                                <ul className="grid grid-cols-2 gap-2">
                                                    {encounteringVesselsMmsi.map(
                                                        (mmsi: string) => {
                                                            const vessel =
                                                                vessels[mmsi];

                                                            if (!vessel) {
                                                                return null;
                                                            }
                                                            return (
                                                                <li
                                                                    key={
                                                                        vessel.mmsi
                                                                    }
                                                                    className="w-full"
                                                                >
                                                                    <Button
                                                                        className="w-full"
                                                                        onClick={() => {
                                                                            setActiveVesselMmsi(
                                                                                vessel.mmsi
                                                                            );
                                                                            map?.setView(
                                                                                new LatLng(
                                                                                    vessel.latitude,
                                                                                    vessel.longitude
                                                                                )
                                                                            );
                                                                        }}
                                                                    >
                                                                        <ContainerSegment
                                                                            title={
                                                                                vessel.name ||
                                                                                ""
                                                                            }
                                                                            className="text-left"
                                                                        >
                                                                            <div className="truncate">
                                                                                {
                                                                                    vessel.mmsi
                                                                                }
                                                                            </div>
                                                                        </ContainerSegment>
                                                                    </Button>
                                                                </li>
                                                            );
                                                        }
                                                    )}
                                                </ul>
                                            </>
                                        )}
                                </>
                            )}
                        </div>
                        <div>
                            <ul className="flex space-x-2 text-md pb-4">
                                <li className="group relative">
                                    <Button
                                        className="px-3"
                                        onClick={onMoveClick}
                                        disabled={!activeVesselMmsi}
                                    >
                                        <FontAwesomeIcon icon={faLocation} />
                                    </Button>
                                    <div
                                        className={`absolute text-sm left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max rounded-lg border-1 px-2 py-1 ${
                                            !activeVesselMmsi
                                                ? "bg-zinc-700 text-zinc-500 border-zinc-500"
                                                : "bg-zinc-900 text-white border-zinc-600"
                                        }`}
                                    >
                                        Move into view
                                    </div>
                                </li>
                                <li className="group relative">
                                    <Button
                                        className="px-3"
                                        onClick={onExpandClick}
                                        disabled={!activeVesselMmsi}
                                    >
                                        <FontAwesomeIcon icon={faExpand} />
                                    </Button>
                                    <div
                                        className={`absolute text-sm left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max rounded-lg border-1 px-2 py-1 ${
                                            !activeVesselMmsi
                                                ? "bg-zinc-700 text-zinc-500 border-zinc-500"
                                                : "bg-zinc-900 text-white border-zinc-600"
                                        }`}
                                    >
                                        Expand view
                                    </div>
                                </li>
                                <li className="w-full group relative">
                                    <Button
                                        className="w-full"
                                        onClick={onEncountersClick}
                                        disabled={
                                            !activeVesselMmsi ||
                                            encounteringVesselsMmsi.length === 0
                                        }
                                    >
                                        Encountering
                                    </Button>
                                    <div
                                        className={`absolute text-center text-sm left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max rounded-lg border-1 px-2 py-1 ${
                                            !activeVesselMmsi
                                                ? "bg-zinc-700 text-zinc-500 border-zinc-500"
                                                : "bg-zinc-900 text-white border-zinc-600"
                                        }`}
                                    >
                                        Expand to encountering <br /> vessels
                                        view
                                    </div>
                                </li>
                            </ul>
                            <div className="border-t-2 border-zinc-600 pt-4 -mx-3 pb-4">
                                <div className="mx-3">
                                    <ContainerTitle>Filters</ContainerTitle>
                                    <VesselFilter />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default Layout;
