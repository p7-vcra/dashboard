import {
    faExpand,
    faLocation,
    faMagnifyingGlassPlus,
    faMap,
    faShip,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import Button from "../components/Button";
import ContainerSegment from "../components/ContainerSegment";
import ContainerTitle from "../components/ContainerTitle";
import VesselFilter from "../components/VesselFilter";
import VesselSearch from "../components/VesselSearch";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useVesselData } from "../contexts/VesselsContext";
import { Vessel } from "../types/vessel";

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
    const { activeVessel, setActiveVessel } = useActiveVessel();
    const { vessels } = useVesselData();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveVessel(null);
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setActiveVessel]);

    const onZoomClick = () => {
        if (activeVessel) {
            const { latitude, longitude } = activeVessel;
            map?.flyTo([latitude, longitude], 15, {
                animate: true,
                duration: 0.25,
            });
        }
    };

    const onMoveClick = () => {
        if (activeVessel) {
            const { latitude, longitude } = activeVessel;
            map?.panTo([latitude, longitude], {
                animate: true,
                duration: 0.25,
            });
        }
    };

    const onExpandClick = () => {
        const points: LatLngBoundsExpression = [
            [activeVessel?.latitude, activeVessel?.longitude] as LatLngTuple,
        ];

        if (activeVessel?.forecast) {
            points.push(
                ...activeVessel.forecast.map(
                    (forecast) => [forecast[0], forecast[1]] as LatLngTuple
                )
            );
        }

        map?.fitBounds(points, {
            animate: true,
            duration: 0.25,
            padding: [50, 50],
        });
    };

    const shownAttributes: Array<keyof Vessel> = [
        "mmsi",
        "name",
        "cri",
        "vesselType",
        "latitude",
        "longitude",
        "sog",
        "cog",
    ];

    return (
        <div className="">
            <aside className="fixed top-0 left-0 z-40 w-20 h-screen transition-transform border-r-2 border-zinc-600">
                <div className="h-full px-3 py-4 overflow-y-auto bg-zinc-800 ">
                    <ul className="space-y-2 font-medium text-sm">
                        {Object.values(routes).map((route) => (
                            <li key={route.href}>
                                <Link
                                    to={route.href}
                                    className="flex items-center justify-center p-4 text-white rounded-lg  hover:bg-zinc-700"
                                >
                                    <FontAwesomeIcon icon={route.icon} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 ml-20 mr-72 -z-10">
                <Outlet />
            </main>

            <aside className="fixed top-0 right-0 z-40 w-72 h-screen transition-transform border-l-2 border-zinc-600">
                <div className="h-full px-3  overflow-y-auto bg-zinc-800 ">
                    <div className="space-y-2 flex flex-col justify-between h-full">
                        <div>
                            <div className="border-b-2 -mx-3 py-4 mb-3 border-zinc-600 ">
                                <div className="mx-3">
                                    <VesselSearch vessels={vessels} />
                                </div>
                            </div>
                            {activeVessel && (
                                <>
                                    <ContainerTitle
                                        onClose={() => setActiveVessel(null)}
                                    >
                                        Vessel
                                    </ContainerTitle>
                                    <ul className="w-full text-md justify-between text-white grid grid-cols-2">
                                        {activeVessel &&
                                            shownAttributes
                                                .filter(
                                                    (key) => key in activeVessel
                                                )
                                                .map((key) => (
                                                    <li key={key}>
                                                        <ContainerSegment
                                                            title={key
                                                                .replace(
                                                                    /([a-z])([A-Z])/g,
                                                                    "$1 $2"
                                                                )
                                                                .toUpperCase()}
                                                        >
                                                            <div className="truncate">
                                                                {activeVessel[
                                                                    key
                                                                ] || "-"}
                                                            </div>
                                                        </ContainerSegment>
                                                    </li>
                                                ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <div>
                            <ul className="flex space-x-2 text-md pb-4">
                                <li>
                                    <Button
                                        className="px-3"
                                        onClick={onMoveClick}
                                        disabled={!activeVessel}
                                    >
                                        <FontAwesomeIcon icon={faLocation} />
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className="px-3"
                                        onClick={onZoomClick}
                                        disabled={!activeVessel}
                                    >
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlassPlus}
                                        />
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className="px-3"
                                        onClick={onExpandClick}
                                        disabled={!activeVessel}
                                    >
                                        <FontAwesomeIcon icon={faExpand} />
                                    </Button>
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
