import { LatLng } from "leaflet";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { useVessels } from "../contexts/VesselsContext";
import Badge from "./Badge";
import Button from "./Button";
import ContainerTitle from "./ContainerTitle";
import EncounteringVesselCard from "./EncounteringVesselCard";
import VesselCard from "./VesselCard";

function ActiveVesselView() {
    const { activeVesselMmsi, setActiveVesselMmsi } = useActiveVessel();
    const { vessels } = useVessels();
    const { map } = useMap();

    return (
        <>
            {activeVesselMmsi && (
                <>
                    <ContainerTitle onClose={() => setActiveVesselMmsi(null)}>
                        Vessel
                    </ContainerTitle>
                    <VesselCard vessel={vessels[activeVesselMmsi]} />
                </>
            )}
            {activeVesselMmsi &&
                vessels[activeVesselMmsi]?.encounteringVessels && (
                    <>
                        <ContainerTitle className="py-2">
                            Encountering Vessels
                        </ContainerTitle>
                        <ul className="space-y-2">
                            {vessels[activeVesselMmsi].encounteringVessels.map(
                                (encounter, index) => {
                                    const vessel = vessels[encounter.mmsi];
                                    if (!vessel) return null;
                                    return (
                                        <li
                                            key={vessel.mmsi}
                                            className="w-full flex items-center space-x-2"
                                        >
                                            <Badge> {index + 1} </Badge>
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
                                                <EncounteringVesselCard
                                                    vessel={vessel}
                                                    encounteringVessel={
                                                        encounter
                                                    }
                                                />
                                            </Button>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </>
                )}
        </>
    );
}

export default ActiveVesselView;
