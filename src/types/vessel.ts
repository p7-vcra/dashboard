interface Vessel {
    mmsi: string;
    vesselType: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    cog: number;
    sog: number;
    name?: string;
    cri?: number;
    forecast?: [string, number, number][];
    encounteringVessels?: string[];
}

type VesselForecast = Pick<Vessel, "mmsi" | "forecast">;

type EncounteringVessel = Pick<Vessel, "mmsi" | "latitude" | "longitude" | "cog" | "sog"> & { length: number };

interface VesselEncounter {
    vessel1: EncounteringVessel
    vessel2: EncounteringVessel
    distance: number;
    startTime: string;
    endTime: string;
    duration: string;
    euclidianDist: number;
    relMovementDirection: number;
    azimuthTargetToOwn: number;
    cri: number;
}

export { type Vessel, type VesselEncounter, type VesselForecast };
