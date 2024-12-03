interface Vessel {
    mmsi: string;
    vesselType: string;
    latitude: number;
    longitude: number;
    name?: string;
    cog: number;
    sog: number;
    cri?: number;
    forecast?: [number, number][];
}

export { type Vessel };
