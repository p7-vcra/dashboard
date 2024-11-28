import React from "react";
import Container from "../components/Container";
import ContainerSegment from "../components/ContainerSegment";
import { useVesselData } from "../contexts/VesselsContext";
import { Vessel } from "../types/vessel";

const Vessels: React.FC = () => {
    const { filtered } = useVesselData();

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
        <div className="xl:grid-cols-4 grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 bg-zinc-700">
            {Object.values(filtered).map((vessel) => (
                <Container className="m-2" key={`card-${vessel.mmsi}`}>
                    <div className="grid grid-cols-2 gap-y-4">
                        {shownAttributes.map((key) => (
                            <ContainerSegment
                                title={key.toUpperCase()}
                                key={`attr-${key}-${vessel.mmsi}`}
                            >
                                <div className="truncate">
                                    {vessel[key] || "-"}
                                </div>
                            </ContainerSegment>
                        ))}
                    </div>
                </Container>
            ))}
        </div>
    );
};

export default Vessels;
