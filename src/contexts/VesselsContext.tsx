import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Vessel } from '../types/Vessel';

interface VesselsContextType {
  vessels: { [mmsi: number]: Vessel };
  updateVessels: (newVessels: { [mmsi: number]: Vessel }) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
  const [vessels, setVessels] = useState<{ [mmsi: number]: Vessel }>({});

  const updateVessels = useCallback((newVessels: { [mmsi: number]: Vessel }) => {
    setVessels((prevVessels) => ({
      ...prevVessels,
      ...newVessels,
    }));
  }, []);

  return <VesselsContext.Provider value={{ vessels, updateVessels }}>{children}</VesselsContext.Provider>;
}

function useVessels() {
  const context = useContext(VesselsContext);
  if (!context) {
    throw new Error('useVessels must be used within a VesselsProvider');
  }
  return context;
}

function useVesselData() {
  const { vessels, updateVessels } = useVessels();
  const map = useMap();
  const vesselsRef = useRef(vessels);
  vesselsRef.current = vessels;

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const updateEventSource = () => {
      if (eventSource) {
        eventSource.close();
      }

      const bounds = map.getBounds();
      const url = `http://130.225.37.58:8000/slice?latitude_range=${bounds.getSouth()},${bounds.getNorth()}&longitude_range=${bounds.getWest()},${bounds.getEast()}`;
      eventSource = new EventSource(url);

      eventSource.onopen = () => console.log('EventSource connection opened');

      eventSource.addEventListener('ais', (event) => {
        const eventData: Vessel[] = JSON.parse(event.data, vesselRetriever);
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
    };

    updateEventSource();
    map.on('moveend', updateEventSource);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      map.off('moveend', updateEventSource);
    };
  }, [map, updateVessels]);

  useEffect(() => {
    const futureVesselEventSource = new EventSource('http://130.225.37.58:8000/dummy-prediction');

    futureVesselEventSource.onopen = () => console.log('Future Vessel course connection opened');

    futureVesselEventSource.addEventListener('ais', (event) => {
      const eventData = JSON.parse(event.data);

      // Process the eventData to match the Vessel structure
      const vesselPredictions = eventData.reduce((acc: { [mmsi: number]: number[][] }, prediction: any) => {
        const { MMSI: mmsi, Latitude, Longitude } = prediction;
        if (!acc[mmsi]) {
          acc[mmsi] = [];
        }
        acc[mmsi].push([Latitude, Longitude]);
        return acc;
      }, {});

      // Update the vessels with future predictions
      const updatedVessels = Object.entries(vesselPredictions).reduce(
        (acc: { [mmsi: number]: Vessel }, [mmsiStr, predictions]) => {
          const mmsi = Number(mmsiStr);
          if (vesselsRef.current[mmsi]) {
            acc[mmsi] = {
              ...vesselsRef.current[mmsi],
              futureLocation: predictions.slice(1), // Skip first point if necessary
            };
            console.log('Added future points to vessel', mmsi, predictions.slice(1));
          }
          return acc;
        },
        {}
      );

      // Use updateVessels to merge the new data
      updateVessels(updatedVessels);
    });

    return () => {
      futureVesselEventSource.close();
    };
  }, []); // Empty dependency array to ensure EventSource remains open


  return { vessels };
}

function vesselRetriever(_key: string, value: any): Vessel[] | never {
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
          futureLocation: []
        } as Vessel;
      }
      return item;
    });
  }
  return value;
}
export { useVesselData, useVessels, VesselsProvider };
