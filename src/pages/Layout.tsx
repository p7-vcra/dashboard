import { faFilter, faMap, faShip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Button from "../components/Button";
import VesselFilter from "../components/VesselFilter";

function Layout() {
    const [isOpen, setIsOpen] = useState(true);

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

    return (
        <div className="">
            <aside
                id="default-sidebar"
                className="fixed top-0 left-0 z-40 w-56 h-screen transition-transform border-r-2 border-zinc-600"
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto bg-zinc-800 ">
                    <ul className="space-y-2 font-medium text-sm">
                        {Object.values(routes).map((route) => (
                            <li key={route.href}>
                                <Link
                                    to={route.href}
                                    className="flex items-center p-2 text-white rounded-lg  hover:bg-zinc-700"
                                >
                                    <FontAwesomeIcon
                                        icon={route.icon}
                                        className="mr-2"
                                    />
                                    <span>{route.display}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <div className="z-[3000] fixed bottom-0 right-0 p-2">
                {isOpen ? (
                    <VesselFilter onClose={() => setIsOpen(false)} />
                ) : (
                    <div>
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="px-4 space-x-2"
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            <span>Filters</span>
                        </Button>
                    </div>
                )}
            </div>

            <main className="flex-1 ml-56 -z-10">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
