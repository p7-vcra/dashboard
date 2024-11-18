import { LatLng } from 'leaflet';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface MapOptions {
  zoom: number;
  center: LatLng;
}

interface MapOptionsContextType {
  mapOptions: MapOptions;
  setMapOptions: (mapOptions: MapOptions) => void;
}

const MapOptionsContext = createContext<MapOptionsContextType | undefined>(undefined);

function MapOptionsProvider({ children }: { children: React.ReactNode }) {
  const denmarkCoords = new LatLng(56.2639, 9.5018);
  const defaultMapOptions = {
    center: denmarkCoords,
    zoom: 4,
  };
  const [mapOptions, setMapOptions] = useState<MapOptions>(defaultMapOptions);

  const updateMapOptions = useCallback((mapOptions: MapOptions) => {
    return setMapOptions(mapOptions);
  }, []);

  console.log(mapOptions);

  return (
    <MapOptionsContext.Provider value={{ mapOptions, setMapOptions: updateMapOptions }}>
      {children}
    </MapOptionsContext.Provider>
  );
}

function useMapOptions() {
  const context = useContext(MapOptionsContext);
  if (!context) {
    throw new Error('useMapOptions must be used within an MapOptionsProvider');
  }
  return context;
}

export { MapOptionsProvider, useMapOptions };
