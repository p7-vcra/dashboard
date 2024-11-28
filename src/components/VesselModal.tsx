import { useEffect, useRef } from "react";
import { Vessel } from "../types/vessel";
import Container from "./Container";
import ContainerSegment from "./ContainerSegment";
import ContainerTitle from "./ContainerTitle";

interface VesselModalProps {
    vessel: Vessel;
    onClose: () => void;
}

function VesselModal({ vessel, onClose }: VesselModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

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
                <div className="">
                    <ul className="w-44 text-md">
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
