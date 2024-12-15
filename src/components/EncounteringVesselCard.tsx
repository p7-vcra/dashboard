import { Vessel } from "../types/vessel";
import ContainerSegment from "./ContainerSegment";

interface EncounteringVesselCardProps {
    vessel: Vessel;
    cri?: number;
    futureCri?: number;
}

function EncounteringVesselCard({ vessel, cri, futureCri }: EncounteringVesselCardProps) {
    const data = {
        name: vessel.name,
        mmsi: vessel.mmsi,
        cri: cri,
        futureCri: futureCri,
    };

    return (
        <div>
            <ul className="w-full text-sm justify-between text-white grid grid-cols-2 gap-2 text-left">
                {vessel &&
                    Object.entries(data).map(([key, value]) => (
                        <li key={key}>
                            <ContainerSegment title={key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()}>
                                <div className="truncate">{value ?? "-"}</div>
                            </ContainerSegment>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default EncounteringVesselCard;
