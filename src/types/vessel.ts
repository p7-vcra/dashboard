interface Vessel {
    mmsi: number;
    vesselType: string;
    latitude: number;
    longitude: number;
    history: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
        cog: number;
        sog: number;
    }>;
    cog: number;
    sog: number;
    cri?: number;
    futureLocation: [number, number][];
}

export { type Vessel };
