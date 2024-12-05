import { Vessel } from "../types/vessel";
import ContainerSegment from "./ContainerSegment";

interface VesselCardProps {
    vessel: Vessel;
}

function VesselCard({ vessel }: VesselCardProps) {
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
        <div>
            <ul className="w-full text-md justify-between text-white grid grid-cols-2 gap-2 ">
                {vessel &&
                    shownAttributes
                        .filter((key) => key in vessel)
                        .map((key) => (
                            <li key={key}>
                                <ContainerSegment
                                    title={key
                                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                                        .toUpperCase()}
                                >
                                    <div className="truncate">
                                        {vessel[key] || "-"}
                                    </div>
                                </ContainerSegment>
                            </li>
                        ))}
            </ul>

            <div className="text-zinc-400 text-xs py-2 font-medium">
                Last updated{" "}
                {new Date(vessel.timestamp).toLocaleString("en-GB", {
                    timeZone: "UTC",
                })}
            </div>
        </div>
    );
}

export default VesselCard;
