interface Vessel {
    mmsi: number;
    vesselType: string;
    latitude: number;
    longitude: number;
    history: Array<{ latitude: number, longitude: number, timestamp: string, cog: number, sog: number }>;
    cog: number;
    sog: number;

}


function revivier(key: string, value: any): Vessel[] | never {
    if (Array.isArray(value)) {
        return value.map(item => {
            if (typeof item === 'object' && item !== null) {
                return {
                    mmsi: item['MMSI'],
                    vesselType: item['Type of mobile'],
                    latitude: item['Latitude'],
                    longitude: item['Longitude'],
                    history: item['history'] || [],
                    cog: item['COG'],
                    sog: item['SOG']
                } as Vessel;
            }
            return item;
        });
    }
    return value;
};


export { revivier, type Vessel };

