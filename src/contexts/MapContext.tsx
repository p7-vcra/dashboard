import { LatLng, Map as LeafletMap } from "leaflet";
import React, { createContext, useCallback, useContext, useState } from "react";

interface MapOptions {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    center: LatLng;
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
}

interface MapContextType {
    map: LeafletMap | null;
    mapOptions: MapOptions;
    setMap: (map: LeafletMap) => void;
    setMapOptions: (mapOptions: MapOptions) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

function MapProvider({ children }: { children: React.ReactNode }) {
    const [map, setMap] = useState<LeafletMap | null>(null);
    const denmarkCoords = new LatLng(56.2639, 9.5018);
    const defaultMapOptions = {
        center: denmarkCoords,
        zoom: 5,
        minZoom: 5,
        maxZoom: 18,
    };
    const [mapOptions, setMapOptions] = useState<MapOptions>(defaultMapOptions);

    const updateMapOptions = useCallback((mapOptions: MapOptions) => {
        return setMapOptions(mapOptions);
    }, []);

    const updateMap = useCallback((map: LeafletMap) => {
        return setMap(map);
    }, []);

    return (
        <MapContext.Provider
            value={{
                map,
                mapOptions,
                setMap: updateMap,
                setMapOptions: updateMapOptions,
            }}
        >
            {children}
        </MapContext.Provider>
    );
}

function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context;
}

export { MapProvider, useMap };
