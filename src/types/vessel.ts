interface Vessel {
    mmsi: string;
    vesselType: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    cog: number;
    sog: number;
    length: number;
    name?: string;
    forecast?: ForecastPoint[];
    encounteringVessels?: EncounteringVessel[];
}

type VesselForecast = Pick<Vessel, "mmsi" | "forecast">;

type EncounteringVessel = Omit<VesselEncounter, "vessel1" | "vessel2"> & {
    mmsi: string;
};

interface ForecastPoint {
    timestamp: string;
    latitude: number;
    longitude: number;
}

type EncounteringPairVessel = Pick<Vessel, "mmsi" | "latitude" | "longitude" | "cog" | "sog" | "length">;

interface VesselEncounter {
    vessel1: EncounteringPairVessel;
    vessel2: EncounteringPairVessel;
    distance: number;
    startTime: string;
    endTime: string;
    duration: string;
    euclidianDist: number;
    relMovementDirection: number;
    azimuthTargetToOwn: number;
    cri: number;
    futureCri?: number;
}

export {
    type EncounteringPairVessel,
    type EncounteringVessel,
    type ForecastPoint,
    type Vessel,
    type VesselEncounter,
    type VesselForecast,
};
