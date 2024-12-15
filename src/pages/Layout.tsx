import { faMap, faShip } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ActiveVesselView from "../components/ActiveVesselView";
import NavigationItem from "../components/NavigationItem";
import Section from "../components/Section";
import Sections from "../components/Sections";
import Sidebar from "../components/Sidebar";
import VesselFilter from "../components/VesselFilter";
import VesselSearch from "../components/VesselSearch";
import ViewControls from "../components/ViewControls";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useVessels } from "../contexts/VesselsContext";

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

    const { setActiveVesselMmsi } = useActiveVessel();
    const { vessels } = useVessels();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveVesselMmsi(null);
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setActiveVesselMmsi]);

    return (
        <div>
            <Sidebar position="left" width={20}>
                <nav>
                    <ul className="p-3 font-medium text-sm">
                        {Object.values(routes).map(({ href, icon, display }) => (
                            <NavigationItem key={href} href={href} icon={icon} title={display} />
                        ))}
                    </ul>
                </nav>
            </Sidebar>

            <main className="flex-1 ml-20 mr-72">
                <Outlet />
            </main>

            <Sidebar position="right" width={72} className="overflow-y-auto">
                <Sections>
                    <Section>
                        <VesselSearch vessels={vessels} />
                    </Section>
                    <Section>
                        <ActiveVesselView />
                    </Section>
                    <Section bottom>
                        <ViewControls />
                    </Section>
                    <Section bottom title="Filters" collapseble initialCollapsed>
                        <VesselFilter />
                    </Section>
                </Sections>
            </Sidebar>
        </div>
    );
}

export default Layout;
