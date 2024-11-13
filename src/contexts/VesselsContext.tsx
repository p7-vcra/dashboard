import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Vessel } from '../types/vessel';

interface VesselsContextType {
  vessels: { [mmsi: number]: Vessel };
  filtered: { [mmsi: number]: Vessel };
  updateVessels: (newVessels: { [mmsi: number]: Vessel }) => void;
  filter: (vessel: Vessel) => boolean;
  updateFilter: (predicate: (vessel: Vessel) => boolean) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
  const [vessels, setVessels] = useState<{ [mmsi: number]: Vessel }>({});
  const [filter, setFilter] = useState<(vessel: Vessel) => boolean>(() => () => true);
  const [filtered, setFiltered] = useState<{ [mmsi: number]: Vessel }>({});

  const updateVessels = useCallback(
    (newVessels: { [mmsi: number]: Vessel }) => {
      setVessels((prevVessels) => {
        const updatedVessels = { ...prevVessels, ...newVessels };
        setFiltered(Object.fromEntries(Object.entries(updatedVessels).filter(([_, vessel]) => filter(vessel))));
        return updatedVessels;
      });
    },
    [filter]
  );

  const updateFilter = useCallback((predicate: (vessel: Vessel) => boolean) => {
    setFilter(() => predicate);
  }, []);

  // Recalculate `filtered` whenever `vessels` or `filter` changes
  useEffect(() => {
    setFiltered(Object.fromEntries(Object.entries(vessels).filter(([_, vessel]) => filter(vessel))));
  }, [vessels, filter]);

  return (
    <VesselsContext.Provider value={{ vessels, filtered, updateVessels, filter, updateFilter }}>
      {children}
    </VesselsContext.Provider>
  );
}

function useVessels() {
  const context = useContext(VesselsContext);
  if (!context) {
    throw new Error('useVessels must be used within a VesselsProvider');
  }
  return context;
}

function useVesselData() {
  const { vessels, updateVessels, filtered } = useVessels();
  const map = useMap();
  const vesselsRef = useRef(vessels);
  vesselsRef.current = vessels;

  useEffect(() => {
    const bounds = map.getBounds();

    const url = `http://130.225.37.58:8000/slice?latitude_range=${bounds.getSouth()},${bounds.getNorth()}&longitude_range=${bounds.getWest()},${bounds.getEast()}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => console.log('EventSource connection opened');

    eventSource.addEventListener('ais', (event) => {
      const eventData: Vessel[] = JSON.parse(event.data, vesselsRevivier);
      const parsedData = eventData.reduce((acc: { [mmsi: number]: Vessel }, vessel: Vessel) => {
        const { mmsi, vesselType } = vessel;

        if (vesselType === 'Class A' && !isNaN(mmsi)) {
          acc[mmsi] = {
            ...vesselsRef.current[mmsi],
            ...vessel,
          };
        }
        return acc;
      }, {});

      updateVessels(parsedData);
    });

    return () => {
      eventSource.close();
    };
  }, [map, updateVessels]);

  return { vessels, filtered };
}

function vesselsRevivier(_key: string, value: any): Vessel[] | never {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return {
          mmsi: item['MMSI'],
          vesselType: item['Type of mobile'],
          latitude: item['Latitude'],
          longitude: item['Longitude'],
          history: item['history'] || [],
          cog: item['COG'],
          sog: item['SOG'],
        } as Vessel;
      }
      return item;
    });
  }
  return value;
}

export { useVesselData, useVessels, VesselsProvider };
