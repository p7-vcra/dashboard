import { Vessel } from "../types/vessel";

function getMaxCri(vessel: Vessel): number {
    if (!vessel.encounteringVessels) {
        return 0;
    }

    return vessel.encounteringVessels.reduce(
        (maxCri, encounteringVessel) => Math.max(maxCri, encounteringVessel.cri),
        0
    );
}

function getMinCri(vessel: Vessel): number {
    if (!vessel.encounteringVessels) {
        return 0;
    }

    return vessel.encounteringVessels.reduce(
        (minCri, encounteringVessel) => Math.min(minCri, encounteringVessel.cri),
        Infinity
    );
}



export { getMaxCri, getMinCri };
