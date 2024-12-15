import React from "react";
import Container from "../components/Container";
import VesselCard from "../components/VesselCard";
import { useVessels } from "../contexts/VesselsContext";
// import { useVesselData } from "../contexts/VesselsContext";

const Vessels: React.FC = () => {
    const { filtered } = useVessels();
    document.title = "Vessels - Vessel CRA";

    return (
        <div className="bg-zinc-700 p-2 h-full min-h-screen">
            {Object.entries(filtered).length > 0 ? (
                <div>
                    <div className="text-zinc-300 p-2">
                        Showing {Object.entries(filtered).length} results
                    </div>
                    <div className="xl:grid-cols-4 grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                        {Object.values(filtered).map((vessel) => (
                            <Container key={`card-${vessel.mmsi}`}>
                                <VesselCard vessel={vessel} />
                            </Container>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center w-full h-screen flex justify-center items-center text-zinc-300">
                    No vessels found
                </div>
            )}
        </div>
    );
};

export default Vessels;
