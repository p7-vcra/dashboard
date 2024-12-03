import {
    faLocation,
    faMagnifyingGlassPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useMap } from "../contexts/MapContext";
import { Vessel } from "../types/vessel";
import Button from "./Button";
import Container from "./Container";
import ContainerSegment from "./ContainerSegment";
import ContainerTitle from "./ContainerTitle";

interface VesselModalProps {
    vessel: Vessel;
    onClose: () => void;
}

function VesselModal({ vessel, onClose }: VesselModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    const { map } = useMap();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const onZoomClick = () => {
        if (vessel) {
            const { latitude, longitude } = vessel;
            map?.setView([latitude, longitude], 15);
        }
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
        <div id="vessel-modal" ref={modalRef}>
            <Container className="fixed top-0 right-0 m-2 z-[1000]">
                <ContainerTitle onClose={onClose}>Vessel</ContainerTitle>
                <div className="space-y-2">
                    <ul className="flex space-x-2 text-md border-b pb-2 border-zinc-600 border-opacity-50">
                        <li>
                            <Button className="px-3">
                                <FontAwesomeIcon icon={faLocation} />
                            </Button>
                        </li>
                        <li>
                            <Button className="px-3" onClick={onZoomClick}>
                                <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                            </Button>
                        </li>
                    </ul>
                    <ul className="w-44 text-md space-y-4">
                        {vessel &&
                            shownAttributes
                                .filter((key) => key in vessel)
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
                                                {vessel[key] || "-"}
                                            </div>
                                        </ContainerSegment>
                                    </li>
                                ))}
                    </ul>
                </div>
            </Container>
        </div>
    );
}

export default VesselModal;
