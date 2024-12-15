import { EncounteringVessel, Vessel } from "../types/vessel";
import ContainerSegment from "./ContainerSegment";

interface EncounteringVesselCardProps {
    vessel: Vessel;
    encounteringVessel: EncounteringVessel;
}

function EncounteringVesselCard({ vessel, encounteringVessel }: EncounteringVesselCardProps) {
    const shownAttributes: Array<keyof (Vessel & EncounteringVessel)> = ["mmsi", "name", "cri", "futureCri"];

    const data = {
        ...vessel,
        ...encounteringVessel,
    };

    return (
        <div>
            <ul className="w-full text-sm justify-between text-white grid grid-cols-2 gap-2 text-left">
                {vessel &&
                    shownAttributes.map((key) => (
                        <li key={key}>
                            <ContainerSegment title={key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()}>
                                <div className="truncate">
                                    {data[key] !== undefined && data[key] !== null ? String(data[key]) : "-"}
                                </div>
                            </ContainerSegment>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default EncounteringVesselCard;
