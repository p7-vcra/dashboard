interface Vessel {
    mmsi: number;
    vesselType: string;
    latitude: number;
    longitude: number;
    name?: string
    cog: number;
    sog: number;
    cri?: number;
    futureLocation: [number, number][];
}

export { type Vessel };
