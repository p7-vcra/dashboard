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

export { type Vessel };
